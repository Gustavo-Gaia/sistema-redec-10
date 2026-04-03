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
  // TESTE 1: Usar datas fixas em vez de Range (Mais estável na ANA)
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  
  const fmt = (d) => d.toLocaleDateString('pt-BR');
  
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
              `?C%C3%B3digo%20da%20Esta%C3%A7%C3%A3o=${codigo}` +
              `&Tipo%20Filtro%20Data=DATA_LEITURA` +
              `&Data%20In%C3%ADcio=${fmt(ontem)}` + 
              `&Data%20Fim=${fmt(hoje)}`;

  try {
    const resp = await fetch(url, {
      headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` },
      cache: "no-store",
    });

    const json = await resp.json();
    const items = json?.items || [];

    // Se vier vazio, retornamos um objeto de erro para sabermos qual estação falhou
    if (items.length === 0) {
      return { erro: "ANA retornou zero itens para esta data", url_tentada: url };
    }

    // Se chegou aqui, os dados existem. Vamos ver o que tem dentro:
    const medicoes = items.map((m) => ({
      dt: m.Data_Hora_Medicao,
      n: parseFloat(m.Cota_Adotada) / 100,
    }));

    return {
      total: items.length,
      ultima: medicoes[0],
      primeira: medicoes[medicoes.length - 1],
      amostra: medicoes.slice(0, 2) // Só as duas primeiras para não encher a tela
    };

  } catch (err) {
    return { erro: err.message };
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
