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
// TOKEN
// ============================

let tokenCache = null;
let expira = null;

async function getToken() {
  const agora = Date.now();

  if (tokenCache && expira && agora < expira) {
    return tokenCache;
  }

  const resp = await fetch(
    "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1",
    {
      headers: {
        Identificador: process.env.ANA_IDENTIFICADOR,
        Senha: process.env.ANA_SENHA,
      },
      cache: "no-store",
    }
  );

  const json = await resp.json();

  const token = json?.items?.tokenautenticacao;

  tokenCache = token;
  expira = agora + 55 * 60 * 1000;

  return token;
}

// ============================
// DATAS
// ============================

function formatar(d) {
  return d.toISOString().slice(0, 10);
}

// ============================
// PROCESSAR ESTAÇÃO (HIDROSAT)
// ============================

async function processarEstacao(codigo, token) {

  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const params = new URLSearchParams({
    "Código da Estação": codigo,
    "Tipo Filtro Data": "DATA_LEITURA",
    "Data Inicial (yyyy-MM-dd)": formatar(ontem),
    "Data Final (yyyy-MM-dd)": formatar(hoje),
    "Horário Inicial (00:00:00)": "00:00:00",
    "Horário Final (23:59:59)": "23:59:59",
  });

  const url =
    "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidrosatSerieDados/v1?" +
    params.toString();

  try {
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const json = await resp.json();

    return {
      status: resp.status,
      url,
      total: json?.items?.length || 0,
      exemplo: json?.items?.[0] || null,
    };

  } catch (err) {
    return {
      erro: true,
      mensagem: err.message,
    };
  }
}

// ============================
// API
// ============================

export async function GET() {

  const token = await getToken();

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  const resultados = {};

  for (const estacao of estacoes) {

    resultados[estacao.id] = await processarEstacao(
      estacao.codigo_estacao,
      token
    );

    await new Promise(r => setTimeout(r, 300));
  }

  return NextResponse.json(resultados);
}
