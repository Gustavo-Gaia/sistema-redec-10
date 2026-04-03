/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// 🔐 TOKEN ANA
// ============================

async function getToken() {
  try {
    const resp = await fetch(
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1",
      {
        method: "GET",
        headers: {
          Identificador: process.env.ANA_IDENTIFICADOR,
          Senha: process.env.ANA_SENHA
        },
        cache: "no-store"
      }
    );

    const json = await resp.json();

    const token = json?.items?.tokenautenticacao;

    if (!token) {
      return { erro: "Token não retornado", raw: json };
    }

    return { token, raw: json };

  } catch (err) {
    return { erro: err.message };
  }
}

// ============================
// 🌊 BUSCAR DADOS ANA
// ============================

async function buscarEstacao(token, codigo) {
  try {
    const hoje = new Date();
    const dataBusca = hoje.toISOString().split("T")[0]; // YYYY-MM-DD

    const url =
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelem%C3%A9tricaAdotada/v1" +
      `?CodigoDaEstacao=${codigo}` +
      `&TipoFiltroData=DATA_LEITURA` +
      `&DataBusca=${dataBusca}` +
      `&IntervaloDeBusca=HORA_1`;

    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    const text = await resp.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return { erro: "Resposta não é JSON", raw: text };
    }

    return {
      status: resp.status,
      total: json?.items?.length || 0,
      exemplo: json?.items?.[0] || null,
      raw: json
    };

  } catch (err) {
    return { erro: err.message };
  }
}

// ============================
// 🚀 API PRINCIPAL (DEBUG)
// ============================

export async function GET() {

  // pega apenas 1 estação pra teste
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true)
    .limit(1);

  if (!estacoes || estacoes.length === 0) {
    return NextResponse.json({
      erro: "Nenhuma estação encontrada no banco"
    });
  }

  const estacao = estacoes[0];

  // ============================
  // TOKEN
  // ============================

  const tokenInfo = await getToken();

  if (tokenInfo.erro) {
    return NextResponse.json({
      etapa: "TOKEN",
      erro: tokenInfo
    });
  }

  const token = tokenInfo.token;

  // ============================
  // DADOS ANA
  // ============================

  const dados = await buscarEstacao(token, estacao.codigo_estacao);

  // ============================
  // RESPOSTA DEBUG
  // ============================

  return NextResponse.json({
    etapa: "DEBUG FINAL",

    estacao: estacao,

    token: token.substring(0, 30) + "...",

    respostaANA: {
      status: dados.status,
      totalRegistros: dados.total,
      exemploItem: dados.exemplo
    },

    bruto: dados.raw
  });
}
