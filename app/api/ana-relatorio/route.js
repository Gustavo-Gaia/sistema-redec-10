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
// 🔐 TOKEN
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

    const text = await resp.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return { erro: "Token não é JSON", raw: text };
    }

    const token = json?.items?.tokenautenticacao;

    return {
      sucesso: !!token,
      token: token ? token.substring(0, 20) + "..." : null,
      raw: json
    };

  } catch (err) {
    return { erro: err.message };
  }
}

// ============================
// 🌊 BUSCAR ESTAÇÃO
// ============================

async function buscarEstacao(token, codigo) {
  try {
    const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_30`;

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
      exemplo: json?.items?.[0] || null,
      total: json?.items?.length || 0,
      raw: json
    };

  } catch (err) {
    return { erro: err.message };
  }
}

// ============================
// 🚀 API DEBUG
// ============================

export async function GET() {
  // pega 1 estação só (para debug)
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true)
    .limit(1);

  if (!estacoes || estacoes.length === 0) {
    return NextResponse.json({ erro: "Sem estações no banco" });
  }

  const estacao = estacoes[0];

  // 🔐 TOKEN
  const tokenInfo = await getToken();

  if (!tokenInfo.sucesso) {
    return NextResponse.json({
      etapa: "TOKEN",
      erro: tokenInfo
    });
  }

  // 🌊 DADOS
  const dados = await buscarEstacao(
    tokenInfo.raw.items.tokenautenticacao,
    estacao.codigo_estacao
  );

  return NextResponse.json({
    etapa: "DEBUG COMPLETO",
    
    estacao: estacao,

    token: {
      ok: tokenInfo.sucesso,
      preview: tokenInfo.token
    },

    respostaANA: {
      status: dados.status,
      totalRegistros: dados.total,
      exemploItem: dados.exemplo
    },

    bruto: dados.raw
  });
}
