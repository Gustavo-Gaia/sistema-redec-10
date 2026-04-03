/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================
// SUPABASE
// ============================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// CACHE TOKEN
// ============================

let tokenCache = null;
let tokenExpira = null;

async function getTokenANA() {
  const agora = Date.now();

  if (tokenCache && tokenExpira && agora < tokenExpira) {
    return tokenCache;
  }

  try {
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

    if (!token) return null;

    tokenCache = token;
    tokenExpira = agora + 55 * 60 * 1000;

    return token;

  } catch (err) {
    console.error("Erro token ANA:", err);
    return null;
  }
}

// ============================
// FORMATAR DATA
// ============================

function formatarDataHoje() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// ============================
// PEGAR VALOR MAIS PRÓXIMO
// ============================

function getValorAteHorario(lista, alvo) {
  const filtrados = lista.filter((m) => m.datetime <= alvo);

  if (filtrados.length === 0) return null;

  filtrados.sort((a, b) => b.datetime - a.datetime);

  return filtrados[0];
}

// ============================
// GERAR HORÁRIOS
// ============================

function gerarHorarios(horaRef) {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(parseInt(horaRef));

  return [0, 4, 8, 12].map((h) => {
    const d = new Date(base);
    d.setHours(d.getHours() - h);
    return d;
  });
}

// ============================
// PROCESSAR ESTAÇÃO
// ============================

async function processarEstacao(codigo, token, horaRef) {

  const dataBusca = formatarDataHoje();

  const url =
    `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
    `?CodigoDaEstacao=${codigo}` +
    `&TipoFiltroData=DATA_LEITURA` +
    `&DataBusca=${dataBusca}` +
    `&Intervalo=HORA_1`;

  try {
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const json = await resp.json();

    const items = json?.items || [];

    // DEBUG FORTE
    if (!resp.ok) {
      return {
        erro: true,
        codigo,
        status: resp.status,
        url,
        retorno: json,
      };
    }

    if (items.length === 0) return null;

    const medicoes = items.map((m) => ({
      datetime: new Date(m.Data_Hora_Medicao),
      nivel: parseFloat(m.Cota_Adotada) / 100,
    }));

    const horarios = gerarHorarios(horaRef);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    horarios.forEach((alvo, i) => {
      const m = getValorAteHorario(medicoes, alvo);

      resultado[chaves[i]] = m
        ? {
            nivel: m.nivel,
            hora: m.datetime.toTimeString().slice(0, 5),
          }
        : null;
    });

    return resultado;

  } catch (err) {
    return {
      erro: true,
      codigo,
      mensagem: err.message,
    };
  }
}

// ============================
// API
// ============================

export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getTokenANA();

  if (!token) {
    return NextResponse.json({
      erro: "TOKEN INVALIDO",
    });
  }

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  const resultados = {};

  for (const estacao of estacoes) {

    const dados = await processarEstacao(
      estacao.codigo_estacao,
      token,
      horaRef
    );

    resultados[estacao.id] = dados;

    await new Promise((r) => setTimeout(r, 300));
  }

  return NextResponse.json({
    horaRef,
    resultados,
  });
}
