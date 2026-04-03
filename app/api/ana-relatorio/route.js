/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------
// TOKEN
// ---------------------------

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
  return json?.items?.tokenautenticacao || null;
}

// ---------------------------
// DATA YYYY-MM-DD
// ---------------------------

function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

// ---------------------------
// CONSULTA ANA (CORRETA)
// ---------------------------

async function consultarANA(codigo, token) {

  const url =
    "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1" +
    `?CodigoDaEstacao=${codigo}` +
    `&TipoFiltroData=DATA_LEITURA` +
    `&DataBusca=${hojeISO()}` +
    `&Intervalo=HORA_1`;

  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    const status = resp.status;

    let json = null;
    try {
      json = await resp.json();
    } catch {}

    return {
      url,
      status,
      total: json?.items?.length || 0,
      exemplo: json?.items?.[0] || null,
      bruto: json
    };

  } catch (err) {
    return { erro: err.message };
  }
}

// ---------------------------
// API
// ---------------------------

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

  const token = await getToken();

  if (!token) {
    return NextResponse.json({ erro: "Token inválido" });
  }

  const resultado = await consultarANA(
    estacao.codigo_estacao,
    token
  );

  return NextResponse.json({
    etapa: "DEBUG FINAL CORRETO",
    estacao,
    token: token.slice(0, 30) + "...",
    resultado
  });
}
