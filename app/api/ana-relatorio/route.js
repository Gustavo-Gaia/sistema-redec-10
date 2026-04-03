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
  return json?.items?.tokenautenticacao;
}

// ============================
// 🌊 BUSCAR ESTAÇÃO (CORRIGIDO)
// ============================

async function buscarEstacao(token, codigo) {
  try {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 2);

    const formatar = (d) =>
      d.toISOString().slice(0, 19).replace("T", " ");

    const url =
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1" +
      `?CodigoDaEstacao=${codigo}` +
      `&DataInicio=${encodeURIComponent(formatar(inicio))}` +
      `&DataFim=${encodeURIComponent(formatar(hoje))}`;

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
      return { erro: "Não é JSON", raw: text };
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
// 🚀 API DEBUG
// ============================

export async function GET() {

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true)
    .limit(1);

  if (!estacoes || estacoes.length === 0) {
    return NextResponse.json({ erro: "Sem estações" });
  }

  const estacao = estacoes[0];

  // 🔐 TOKEN
  const token = await getToken();

  if (!token) {
    return NextResponse.json({
      erro: "Token inválido"
    });
  }

  // 🌊 BUSCA
  const dados = await buscarEstacao(token, estacao.codigo_estacao);

  return NextResponse.json({
    estacao,
    token: token.substring(0, 25) + "...",

    respostaANA: {
      status: dados.status,
      total: dados.total,
      exemploItem: dados.exemplo
    },

    bruto: dados.raw
  });
}
