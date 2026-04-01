/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// CACHE DE TOKEN
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

    if (!resp.ok) throw new Error("Erro ao autenticar ANA");

    const json = await resp.json();
    const token = json?.items?.tokenautenticacao;

    if (!token) throw new Error("Token inválido");

    tokenCache = token;
    tokenExpiraEm = agora + 55 * 60 * 1000;

    return token;

  } catch (err) {
    console.error("Erro TOKEN ANA:", err);
    return null;
  }
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

// ============================
// VALOR MAIS PRÓXIMO
// ============================

function getValorAteHorario(lista, alvo) {
  const filtrados = lista.filter((m) => m.datetime <= alvo);

  if (filtrados.length === 0) return null;

  filtrados.sort((a, b) => b.datetime - a.datetime);
  return filtrados[0];
}

// ============================
// FETCH COM RETRY (🔥 PRINCIPAL)
// ============================

async function fetchComToken(url, token, tentativa = 0) {

  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  // 🔥 TOKEN EXPIRADO → RENOVA AUTOMATICAMENTE
  if (resp.status === 401 && tentativa === 0) {
    console.warn("Token expirado, renovando...");

    tokenCache = null;

    const novoToken = await getAuthToken(true);

    if (!novoToken) return null;

    return fetchComToken(url, novoToken, 1);
  }

  if (!resp.ok) return null;

  return resp.json();
}

// ============================
// PROCESSAR ESTAÇÃO
// ============================

async function processarEstacao(codigo, token, horaRef) {

  const url =
    `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
    `?CodigoDaEstacao=${codigo}` +
    `&TipoFiltroData=DATA_LEITURA` +
    `&RangeIntervaloDeBusca=DIAS_2`;

  try {
    const json = await fetchComToken(url, token);

    if (!json) return null;

    const items = json?.items || [];
    if (items.length === 0) return null;

    const medicoes = items
      .map((m) => ({
        datetime: new Date(m.Data_Hora_Medicao),
        nivel: parseFloat(m.Cota_Adotada) / 100,
      }))
      .filter((m) => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

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

  } catch (err) {
    console.error("Erro estação ANA:", codigo);
    return null;
  }
}

// ============================
// API
// ============================

export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  let token = await getAuthToken();
  if (!token) return NextResponse.json({});

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};

  await Promise.all(
    estacoes.map(async (estacao) => {
      const dados = await processarEstacao(
        estacao.codigo_estacao,
        token,
        horaRef
      );

      if (dados) {
        resultados[estacao.id] = dados;
      }
    })
  );

  return NextResponse.json(resultados);
}
