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
let tokenExpiraEm = 0;

// ============================
// AUTENTICAÇÃO ANA
// ============================

async function getAuthToken(force = false) {
  const agora = Date.now();

  // usa cache se válido
  if (!force && tokenCache && agora < tokenExpiraEm) {
    return tokenCache;
  }

  try {
    const resp = await fetch(
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1",
      {
        method: "GET",
        headers: {
          Identificador: process.env.ANA_IDENTIFICADOR,
          Senha: process.env.ANA_SENHA,
        },
        cache: "no-store",
      }
    );

    const json = await resp.json();

    const token = json?.items?.tokenautenticacao;

    if (!token) {
      console.error("❌ Token inválido ANA:", json);
      return null;
    }

    // salva por 50 minutos (segurança)
    tokenCache = token;
    tokenExpiraEm = agora + 50 * 60 * 1000;

    console.log("✅ Novo token ANA gerado");

    return token;

  } catch (err) {
    console.error("❌ Erro ao autenticar ANA:", err);
    return null;
  }
}

// ============================
// GERAR HORÁRIOS
// ============================

function gerarAlvos(horaRef) {
  const base = new Date();
  base.setHours(parseInt(horaRef), 0, 0, 0);

  return [0, 4, 8, 12].map((sub) => {
    const d = new Date(base);
    d.setHours(d.getHours() - sub);
    return d;
  });
}

// ============================
// BUSCAR MEDIÇÃO MAIS PRÓXIMA
// ============================

function encontrarMedicao(lista, alvo) {
  const janelaMin = 120; // minutos

  const inicio = new Date(alvo.getTime() - janelaMin * 60000);

  return lista
    .filter(m => m.datetime <= alvo && m.datetime >= inicio)
    .sort((a, b) => b.datetime - a.datetime)[0] || null;
}

// ============================
// PROCESSAR ESTAÇÃO
// ============================

async function processarEstacao(codigo, horaRef, token) {

  const url =
    `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
    `?CodigoDaEstacao=${codigo}` +
    `&TipoFiltroData=DATA_LEITURA` +
    `&RangeIntervaloDeBusca=DIAS_3`;

  try {
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    // 🔥 token expirou → tenta renovar UMA VEZ
    if (resp.status === 401) {
      console.warn("🔄 Token expirado, renovando...");

      const novoToken = await getAuthToken(true);
      if (!novoToken) return null;

      return processarEstacao(codigo, horaRef, novoToken);
    }

    if (!resp.ok) {
      console.warn("⚠️ Erro estação:", codigo);
      return null;
    }

    const json = await resp.json();
    const items = json?.items || [];

    if (items.length === 0) return null;

    const medicoes = items
      .map(m => ({
        datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
        nivel: parseFloat(m.Cota_Adotada || m.Cota) / 100
      }))
      .filter(m => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

    const alvos = gerarAlvos(horaRef);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    alvos.forEach((alvo, i) => {
      const m = encontrarMedicao(medicoes, alvo);

      resultado[chaves[i]] = m
        ? {
            nivel: m.nivel,
            hora: m.datetime.toTimeString().slice(0, 5),
          }
        : null;
    });

    return resultado;

  } catch (err) {
    console.error("❌ Erro estação ANA:", codigo);
    return null;
  }
}

// ============================
// API PRINCIPAL
// ============================

export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { error: "Falha autenticação ANA" },
      { status: 401 }
    );
  }

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};

  // 🔥 controle anti-bloqueio ANA
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

    // pequena pausa evita bloqueio
    await new Promise(r => setTimeout(r, 300));
  }

  return NextResponse.json(resultados);
}
