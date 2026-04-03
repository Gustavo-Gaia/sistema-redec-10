export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAuthToken() {
  try {
    const resp = await fetch(
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1",
      {
        headers: {
          'accept': '*/*',
          'Identificador': process.env.ANA_IDENTIFICADOR,
          'Senha': process.env.ANA_SENHA,
        },
        cache: "no-store",
      }
    );
    const json = await resp.json();
    return json?.items?.tokenautenticacao || null;
  } catch (err) {
    return null;
  }
}

async function processarEstacao(codigo, token, horaRef) {
  const agoraBr = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const ontemBr = new Date(agoraBr);
  ontemBr.setDate(ontemBr.getDate() - 1);

  // Formato DD/MM/AAAA que a ANA costuma aceitar sem dar Erro 400
  const fmt = (d) => d.toLocaleDateString('pt-BR');
  
  // Buscamos do início de ontem até o final de hoje
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
              `?C%C3%B3digo%20da%20Esta%C3%A7%C3%A3o=${codigo}` +
              `&Tipo%20Filtro%20Data=DATA_LEITURA` +
              `&Data%20In%C3%ADcio=${fmt(ontemBr)}` + 
              `&Data%20Fim=${fmt(agoraBr)}`;

  try {
    const resp = await fetch(url, {
      headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` },
      cache: "no-store",
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json?.items || [];
    if (items.length === 0) return null;

    const medicoes = items.map((m) => ({
      datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
      nivel: parseFloat(m.Cota_Adotada) / 100,
    })).filter(m => !isNaN(m.nivel));

    const extrairParaData = (dataBase) => {
      const base = new Date(dataBase.getFullYear(), dataBase.getMonth(), dataBase.getDate(), parseInt(horaRef), 0, 0);
      const chaves = ["ref", "h4", "h8", "h12"];
      const resultado = {};

      [0, 4, 8, 12].forEach((sub, i) => {
        const alvo = new Date(base);
        alvo.setHours(alvo.getHours() - sub);
        
        // Janela de 120min para compensar atrasos de transmissão
        const limiteMinimo = new Date(alvo.getTime() - 120 * 60000);
        const filtrados = medicoes.filter(m => m.datetime <= alvo && m.datetime >= limiteMinimo);

        if (filtrados.length > 0) {
          filtrados.sort((a, b) => b.datetime - a.datetime);
          resultado[chaves[i]] = {
            nivel: filtrados[0].nivel,
            hora: filtrados[0].datetime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
          };
        } else {
          resultado[chaves[i]] = null;
        }
      });
      return resultado;
    };

    return {
      hoje: extrairParaData(agoraBr),
      ontem: extrairParaData(ontemBr)
    };

  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ erro: "Falha na autenticação com ANA" });

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({ erro: "Nenhuma estação encontrada no banco" });

  const resultados = {};

  for (const estacao of estacoes) {
    const dados = await processarEstacao(estacao.codigo_estacao, token, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    }
    // Pequeno delay para não sobrecarregar a API da ANA
    await new Promise(r => setTimeout(r, 150));
  }

  return NextResponse.json(resultados);
}
