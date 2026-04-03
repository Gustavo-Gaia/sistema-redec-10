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
// 🔐 TOKEN ANA
// ============================

async function getToken() {
  try {
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

    if (!resp.ok) {
      console.error("❌ ERRO TOKEN:", await resp.text());
      return null;
    }

    const json = await resp.json();

    const token = json?.items?.tokenautenticacao;

    if (!token) {
      console.error("❌ TOKEN INVÁLIDO:", json);
      return null;
    }

    return token;

  } catch (err) {
    console.error("❌ ERRO AO OBTER TOKEN:", err);
    return null;
  }
}

// ============================
// 🌊 BUSCAR DADOS DA ESTAÇÃO
// ============================

async function buscarEstacao(token, codigo) {
  try {
    const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_30`;

    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (!resp.ok) {
      console.error(`❌ ERRO ESTAÇÃO ${codigo}:`, await resp.text());
      return null;
    }

    const json = await resp.json();

    return json?.items || [];

  } catch (err) {
    console.error(`❌ ERRO FETCH ESTAÇÃO ${codigo}:`, err);
    return null;
  }
}

// ============================
// 🔄 CONVERTER DADOS
// ============================

function extrairMedicoesJSON(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map(item => {
      const dataStr =
        item?.DataHora ||
        item?.dataHora ||
        item?.Data ||
        item?.data;

      const nivelRaw =
        item?.Nivel ||
        item?.nivel;

      if (!dataStr || nivelRaw === undefined || nivelRaw === null) {
        return null;
      }

      const dt = new Date(dataStr);
      const nivel = parseFloat(nivelRaw);

      if (isNaN(dt.getTime()) || isNaN(nivel)) return null;

      return {
        datetime: dt,
        nivel
      };
    })
    .filter(Boolean);
}

// ============================
// 🧠 LÓGICA DE HORÁRIO (MANTIDA)
// ============================

function getValorAteHorario(lista, alvo) {
  const limitePassado = new Date(alvo.getTime() - (120 * 60000));
  const limiteFuturo = new Date(alvo.getTime() + (30 * 60000));

  const filtrados = lista.filter(m =>
    m.datetime >= limitePassado && m.datetime <= limiteFuturo
  );

  if (filtrados.length === 0) return null;

  filtrados.sort((a, b) => {
    return Math.abs(a.datetime - alvo) - Math.abs(b.datetime - alvo);
  });

  return filtrados[0];
}

// ============================
// ⚙️ PROCESSAR ESTAÇÃO
// ============================

async function processarEstacao(token, codigo, horaRef) {
  const items = await buscarEstacao(token, codigo);
  if (!items) return null;

  const medicoes = extrairMedicoesJSON(items);

  if (medicoes.length === 0) return null;

  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(parseInt(horaRef));

  const chaves = ["ref", "h4", "h8", "h12"];
  const resultado = {};

  [0, 4, 8, 12].forEach((sub, i) => {
    const alvo = new Date(base);
    alvo.setHours(alvo.getHours() - sub);

    const m = getValorAteHorario(medicoes, alvo);

    resultado[chaves[i]] = m
      ? {
          nivel: m.nivel,
          hora: m.datetime.toTimeString().slice(0, 5)
        }
      : null;
  });

  return resultado;
}

// ============================
// 🚀 API PRINCIPAL
// ============================

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  // 🔐 pega token
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { error: "Erro ao autenticar na ANA" },
      { status: 500 }
    );
  }

  // 📡 busca estações no banco
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes || estacoes.length === 0) {
    return NextResponse.json({});
  }

  const resultados = {};

  // 🔄 processa uma por uma (seguro)
  for (const estacao of estacoes) {
    const dados = await processarEstacao(
      token,
      estacao.codigo_estacao,
      horaRef
    );

    if (dados) {
      resultados[estacao.id] = dados;
    }

    // pequena pausa (evita bloqueio)
    await new Promise(r => setTimeout(r, 150));
  }

  return NextResponse.json(resultados);
}
