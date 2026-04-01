/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";

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
// TOKEN CACHE
// ============================

let tokenCache = null;
let tokenExpiraEm = null;

// ============================
// TOKEN ANA
// ============================

async function getAuthToken(force = false) {
  const agora = Date.now();

  if (!force && tokenCache && tokenExpiraEm && agora < tokenExpiraEm) {
    return tokenCache;
  }

  console.log("🔐 Gerando novo token ANA...");

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

  if (!resp.ok) {
    console.error("❌ Erro ao autenticar ANA");
    return null;
  }

  const json = await resp.json();

  const token = json?.items?.tokenautenticacao;

  if (!token) {
    console.error("❌ Token inválido:", json);
    return null;
  }

  tokenCache = token;
  tokenExpiraEm = agora + 50 * 60 * 1000; // 50 min (segurança)

  return token;
}

// ============================
// HORÁRIOS
// ============================

function gerarHorariosAlvo(horaRef) {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(parseInt(horaRef));

  return [0, 4, 8, 12].map((sub) => {
    const d = new Date(base);
    d.setHours(d.getHours() - sub);
    return d;
  });
}

function getValorAteHorario(lista, alvo) {
  const filtrados = lista.filter((m) => m.datetime <= alvo);
  if (filtrados.length === 0) return null;

  filtrados.sort((a, b) => b.datetime - a.datetime);
  return filtrados[0];
}

// ============================
// PROCESSAR ESTAÇÃO (COM RETRY)
// ============================

async function processarEstacao(codigo, horaRef, token) {

  const url =
    `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
    `?CodigoDaEstacao=${codigo}` +
    `&TipoFiltroData=DATA_LEITURA` +
    `&RangeIntervaloDeBusca=DIAS_2`;

  async function executar(tokenAtual) {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${tokenAtual}` },
      cache: "no-store",
    });

    if (!resp.ok) {
      throw new Error(`Erro HTTP ${resp.status}`);
    }

    const json = await resp.json();
    const items = json?.items || [];

    if (!items.length) return null;

    const medicoes = items
      .map((m) => ({
        datetime: new Date(m.Data_Hora_Medicao),
        nivel: parseFloat(m.Cota_Adotada) / 100,
      }))
      .filter((m) => !isNaN(m.nivel));

    if (!medicoes.length) return null;

    const horarios = gerarHorariosAlvo(horaRef);
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
  }

  try {
    return await executar(token);
  } catch (err) {
    console.warn(`🔁 Retry estação ${codigo}`);

    const novoToken = await getAuthToken(true);

    if (!novoToken) return null;

    try {
      return await executar(novoToken);
    } catch (err2) {
      console.error("❌ Falha final estação:", codigo);
      return null;
    }
  }
}

// ============================
// API
// ============================

export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();

  if (!token) return NextResponse.json({});

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};

  // ⚠️ LIMITADOR DE CONCORRÊNCIA (MUITO IMPORTANTE)
  const BATCH = 5;

  for (let i = 0; i < estacoes.length; i += BATCH) {
    const grupo = estacoes.slice(i, i + BATCH);

    await Promise.all(
      grupo.map(async (estacao) => {
        const dados = await processarEstacao(
          estacao.codigo_estacao,
          horaRef,
          token
        );

        if (dados) {
          resultados[estacao.id] = dados;
        }
      })
    );
  }

  return NextResponse.json(resultados);
}
