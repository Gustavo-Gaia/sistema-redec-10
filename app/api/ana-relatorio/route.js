/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ---------------------------
// SUPABASE
// ---------------------------

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ---------------------------
// TOKEN ANA
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
// FORMATAR DATA (yyyy-MM-dd)
// ---------------------------

function formatarDataISO(d) {
  return d.toISOString().split("T")[0];
}

// ---------------------------
// PROCESSAR ESTAÇÃO
// ---------------------------

async function processarEstacao(codigo, token) {

  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 2);

  const url =
    "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1" +
    `?CodigoDaEstacao=${codigo}` +
    `&TipoFiltroData=DATA_LEITURA` +
    `&DataInicial=${formatarDataISO(inicio)}` +
    `&DataFinal=${formatarDataISO(hoje)}`;

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
    } catch {
      json = null;
    }

    return {
      codigo,
      status,
      total: json?.items?.length || 0,
      exemplo: json?.items?.[0] || null,
      bruto: json
    };

  } catch (err) {
    return {
      codigo,
      erro: err.message
    };
  }
}

// ---------------------------
// API PRINCIPAL
// ---------------------------

export async function GET() {

  // 1. Buscar estações
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true)
    .limit(1); // 🔥 DEBUG só 1 estação

  if (!estacoes || estacoes.length === 0) {
    return NextResponse.json({ erro: "Sem estações" });
  }

  const estacao = estacoes[0];

  // 2. Token
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ erro: "Token inválido" });
  }

  // 3. Consulta ANA
  const resultado = await processarEstacao(
    estacao.codigo_estacao,
    token
  );

  // 4. DEBUG COMPLETO
  return NextResponse.json({
    etapa: "DEBUG FINAL CORRIGIDO",
    estacao,
    token: token.slice(0, 30) + "...",
    resultado
  });
}
