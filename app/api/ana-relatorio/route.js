/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// TOKEN CACHE
// ============================

let tokenCache = null;
let tokenExpiraEm = null;

async function getAuthToken() {
  const agora = Date.now();

  if (tokenCache && agora < tokenExpiraEm) {
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
  tokenExpiraEm = agora + 55 * 60 * 1000;

  return token;
}

// ============================
// BUSCAR DADOS (CORRETO)
// ============================

async function buscarDados(codigo, token) {
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const formatar = (d) => d.toISOString().split("T")[0];

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
      total: json?.items?.length || 0,
      exemplo: json?.items?.[0] || null,
      url,
    };

  } catch (err) {
    return { erro: true, codigo };
  }
}

// ============================
// API
// ============================

export async function GET() {

  const token = await getAuthToken();

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  const resultados = {};

  await Promise.all(
    estacoes.map(async (e) => {
      resultados[e.id] = await buscarDados(
        e.codigo_estacao,
        token
      );
    })
  );

  return NextResponse.json(resultados);
}
