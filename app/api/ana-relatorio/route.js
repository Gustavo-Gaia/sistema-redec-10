/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// CONFIG
// ============================

// ⏱ Pequeno delay para evitar bloqueio da ANA
const DELAY = 250;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================
// FORMATAR DATA ANA
// ============================

function formatarDataANA(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ============================
// GERAR HORÁRIOS
// ============================

function gerarHorariosAlvo(horaRef) {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(parseInt(horaRef));

  return {
    ref: new Date(base),
    h4: new Date(base.getTime() - 4 * 3600000),
    h8: new Date(base.getTime() - 8 * 3600000),
    h12: new Date(base.getTime() - 12 * 3600000),
  };
}

// ============================
// EXTRAIR MEDIÇÕES (RÁPIDO)
// ============================

function extrairMedicoes(xml) {
  const regex = /<DataHora>(.*?)<\/DataHora>[\s\S]*?<Nivel>(.*?)<\/Nivel>/g;

  let match;
  const lista = [];

  while ((match = regex.exec(xml)) !== null) {
    const dataHora = match[1];
    const nivel = parseFloat(match[2]);

    if (!dataHora || isNaN(nivel)) continue;

    const dt = new Date(dataHora.replace(" ", "T"));

    lista.push({
      datetime: dt,
      nivel: nivel / 100
    });
  }

  return lista;
}

// ============================
// BUSCAR VALOR MAIS PRÓXIMO
// ============================

function buscarValor(lista, alvo) {
  let melhor = null;

  for (let i = lista.length - 1; i >= 0; i--) {
    const m = lista[i];

    if (m.datetime <= alvo) {
      melhor = m;
      break;
    }
  }

  return melhor;
}

// ============================
// PROCESSAR ESTAÇÃO
// ============================

async function processarEstacao(codigo, horaRef) {

  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 2);

  const url =
    `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos` +
    `?codEstacao=${codigo}` +
    `&dataInicio=${formatarDataANA(inicio)}` +
    `&dataFim=${formatarDataANA(hoje)}`;

  try {

    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store"
    });

    if (!resp.ok) return null;

    const xml = await resp.text();

    const medicoes = extrairMedicoes(xml);
    if (medicoes.length === 0) return null;

    // 🔥 ordena uma única vez (ganho de performance)
    medicoes.sort((a, b) => a.datetime - b.datetime);

    const horarios = gerarHorariosAlvo(horaRef);

    const resultado = {};

    for (const chave in horarios) {
      const alvo = horarios[chave];

      const m = buscarValor(medicoes, alvo);

      resultado[chave] = m
        ? {
            nivel: m.nivel,
            hora: m.datetime.toTimeString().slice(0, 5),
            fonte: "ANA"
          }
        : null;
    }

    return resultado;

  } catch (err) {
    console.log("Erro ANA estação:", codigo);
    return null;
  }
}

// ============================
// API PRINCIPAL
// ============================

export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};

  for (const estacao of estacoes) {

    const dados = await processarEstacao(
      estacao.codigo_estacao,
      horaRef
    );

    if (dados) {
      resultados[estacao.id] = dados;
    }

    // 🔥 CONTROLE DE BLOQUEIO (ESSENCIAL)
    await sleep(DELAY);
  }

  return NextResponse.json(resultados);
}
