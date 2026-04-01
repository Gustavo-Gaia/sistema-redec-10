/* app/api/inea-relatorio/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";
import axios from "axios";
import https from "https";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================
// GERAR HORÁRIOS ALVO
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
// PEGAR VALOR ATÉ HORÁRIO
// ============================

function getValorAteHorario(lista, alvo) {
  const filtrados = lista.filter(m => m.dt <= alvo);

  if (filtrados.length === 0) return null;

  filtrados.sort((a, b) => b.dt - a.dt);

  return filtrados[0];
}

// ============================
// PROCESSAR ESTAÇÃO INEA
// ============================

async function processarINEA(codigo, horaRef) {

  const url =
    `https://alertadecheias.inea.rj.gov.br/alertadecheias/${codigo}.html`;

  try {

    const response = await axios.get(url, {
      timeout: 8000,
      httpsAgent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"
      }
    });

    const $ = cheerio.load(response.data);

    const tabela = $("#Table").length ? $("#Table") : $("table");

    const registros = [];

    tabela.find("tr").each((i, el) => {

      const cols = $(el).find("td");

      if (cols.length < 8) return;

      const dataHoraTxt = $(cols[0]).text().trim();
      const nivelTxt = $(cols[7]).text().trim();

      if (!dataHoraTxt || !nivelTxt || dataHoraTxt.includes("Data")) return;

      try {

        const [dataPart, horaPart] = dataHoraTxt.split(" ");
        const [dia, mes, ano] = dataPart.split("/");

        const dt = new Date(`${ano}-${mes}-${dia}T${horaPart}:00`);

        const nivel = parseFloat(nivelTxt.replace(",", "."));

        if (!isNaN(dt.getTime()) && !isNaN(nivel)) {
          registros.push({ dt, nivel });
        }

      } catch {}

    });

    if (registros.length === 0) return null;

    const horarios = gerarHorariosAlvo(horaRef);
    const chaves = ["ref", "h4", "h8", "h12"];

    const resultado = {};

    horarios.forEach((alvo, i) => {

      const m = getValorAteHorario(registros, alvo);

      resultado[chaves[i]] = m
        ? {
            nivel: m.nivel,
            hora: m.dt.toTimeString().slice(0, 5)
          }
        : null;

    });

    return resultado;

  } catch (error) {

    console.log("Erro INEA estação:", codigo, error.message);

    return null;

  }

}

// ============================
// API
// ============================

export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id,codigo_estacao")
    .eq("fonte","INEA")
    .eq("ativo",true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};

  for (const estacao of estacoes) {

    const dados = await processarINEA(
      estacao.codigo_estacao,
      horaRef
    );

    if (dados) {
      resultados[estacao.id] = dados;
    }

    // mantém proteção anti-bloqueio
    await sleep(600);

  }

  return NextResponse.json(resultados);

}
