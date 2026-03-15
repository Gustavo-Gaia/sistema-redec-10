/* app/api/inea/route.js */

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

// ignora erro de certificado do site do INEA
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// delay entre requisições
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================
// CAPTURAR DADOS INEA
// ============================

async function capturarINEA(codigo) {

  const url =
    `https://alertadecheias.inea.rj.gov.br/alertadecheias/${codigo}.html`;

  try {

    const response = await axios.get(url, {
      timeout: 10000,
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

        const nivel = parseFloat(
          nivelTxt.replace(",", ".")
        );

        if (!isNaN(dt.getTime()) && !isNaN(nivel)) {
          registros.push({ dt, nivel });
        }

      } catch {}

    });

    if (registros.length === 0) return null;

    // pega medição mais recente
    const ultimo = registros.reduce((a, b) =>
      a.dt > b.dt ? a : b
    );

    return {
      data: ultimo.dt.toISOString().slice(0,10),
      hora: ultimo.dt.toTimeString().slice(0,5),
      nivel: ultimo.nivel
    };

  } catch (error) {

    console.log(`Erro INEA estação ${codigo}:`, error.message);

    return null;

  }

}

// ============================
// API
// ============================

export async function GET() {

  try {

    const { data: estacoes, error } = await supabase
      .from("estacoes")
      .select("id, codigo_estacao")
      .eq("fonte","INEA")
      .eq("ativo",true);

    if (error) {
      console.error("Erro ao buscar estações INEA:", error);
      return NextResponse.json([]);
    }

    if (!estacoes || estacoes.length === 0) {
      return NextResponse.json([]);
    }

    console.log("Estações INEA encontradas:", estacoes.length);

    const resultados = [];

    for (const estacao of estacoes) {

      const dados = await capturarINEA(estacao.codigo_estacao);

      if (dados) {

        resultados.push({
          estacao_id: estacao.id,
          fonte: "INEA",
          ...dados
        });

      }

      // evita bloqueio do servidor INEA
      await sleep(700);

    }

    console.log("Medições INEA capturadas:", resultados.length);

    return NextResponse.json(resultados);

  } catch (err) {

    console.error("Erro geral na API INEA:", err);

    return NextResponse.json(
      { erro: "Falha ao capturar dados INEA" },
      { status: 500 }
    );

  }

}
