/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================
// SUPABASE (SERVER SIDE)
// ============================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// TOKEN CACHE (MEMÓRIA)
// ============================

let tokenCache = null;
let tokenExpiraEm = null;

// ============================
// BUSCAR TOKEN ANA
// ============================

async function getAuthToken() {
  const agora = Date.now();

  // reutiliza token válido
  if (tokenCache && tokenExpiraEm && agora < tokenExpiraEm) {
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

    // salva por 55 minutos (segurança)
    tokenCache = token;
    tokenExpiraEm = agora + 55 * 60 * 1000;

    return token;

  } catch (err) {
    console.error("Erro token ANA:", err);
    return null;
  }
}

// ============================
// GERAR HORÁRIOS
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
// PEGAR VALOR MAIS PRÓXIMO
// ============================

function getValorAteHorario(lista, alvo) {
  const filtrados = lista.filter((m) => m.datetime <= alvo);

  if (filtrados.length === 0) return null;

  filtrados.sort((a, b) => b.datetime - a.datetime);

  return filtrados[0];
}

// ============================
// PROCESSAR ESTAÇÃO (NOVA)
// ============================

async function processarEstacao(codigo, token, horaRef) {

  const url =
    `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
    `?CodigoDaEstacao=${codigo}` +
    `&TipoFiltroData=DATA_LEITURA` +
    `&RangeIntervaloDeBusca=DIAS_2`;

  try {
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!resp.ok) return null;

    const json = await resp.json();

    const items = json?.items || [];

    if (items.length === 0) return null;

    // converter dados
    const medicoes = items
      .map((m) => ({
        datetime: new Date(m.Data_Hora_Medicao),
        nivel: parseFloat(m.Cota_Adotada) / 100, // cm -> m
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
// API PRINCIPAL
// ============================

export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  // 🔥 pega token UMA VEZ
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({});
  }

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};

  // ============================
  // ⚡ PARALELISMO CONTROLADO
  // ============================

  const promises = estacoes.map(async (estacao) => {
    const dados = await processarEstacao(
      estacao.codigo_estacao,
      token,
      horaRef
    );

    if (dados) {
      resultados[estacao.id] = dados;
    }
  });

  await Promise.all(promises);

  return NextResponse.json(resultados);
}
