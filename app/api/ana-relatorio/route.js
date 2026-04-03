import { NextResponse } from 'next/server';

// Função auxiliar para pegar o Token (Ajuste conforme sua lógica de Auth)
async function getAuthToken() {
  const url = "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/Token";
  const resp = await fetch(url, { method: 'POST', cache: 'no-store' });
  const json = await resp.json();
  return json.access_token;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const estacao = searchParams.get('estacao') || '58770000';
  
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ erro: "Falha no Token" });

  // Configurando Datas: Ontem e Hoje
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  // Formatação DD/MM/YYYY para a API da ANA
  const formatarData = (d) => d.toLocaleDateString('pt-BR');
  const dataInicio = formatarData(ontem);
  const dataFim = formatarData(hoje);

  const urlANA = 
    `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
    `?C%C3%B3digo%20da%20Esta%C3%A7%C3%A3o=${estacao}` +
    `&Tipo%20Filtro%20Data=DATA_LEITURA` +
    `&Data%20In%C3%ADcio=${dataInicio}` +
    `&Data%20Fim=${dataFim}`;

  try {
    const resp = await fetch(urlANA, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    });

    const data = await resp.json();
    const items = data.items || [];

    // Retorno simplificado para análise humana
    return NextResponse.json({
      configuracao: {
        estacaoBuscada: estacao,
        dataInicioUsada: dataInicio,
        dataFimUsada: dataFim,
        urlGerada: urlANA
      },
      resumo: {
        totalRegistros: items.length,
        maisRecente: items[0]?.Data_Hora_Medicao,
        maisAntigo: items[items.length - 1]?.Data_Hora_Medicao
      },
      // Mostra as 3 primeiras e 3 últimas para conferir as datas
      amostra: {
        topo: items.slice(0, 3),
        fundo: items.slice(-3)
      }
    });
  } catch (error) {
    return NextResponse.json({ erro: error.message });
  }
}
