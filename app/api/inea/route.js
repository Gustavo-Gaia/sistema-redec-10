/* app/api/inea/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // ✅ IMPORTAÇÃO CORRIGIDA
import * as cheerio from "cheerio";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capturarINEA(codigo) {

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

        const nivel = parseFloat(
          nivelTxt.replace(",", ".")
        );

        if (!isNaN(dt.getTime()) && !isNaN(nivel)) {
          registros.push({ dt, nivel });
        }

      } catch {}

    });

    if (registros.length === 0) return null;

    const ultimo = registros.reduce((a, b) =>
      a.dt > b.dt ? a : b
    );

    return {
      data: ultimo.dt.toISOString().slice(0,10),
      hora: ultimo.dt.toTimeString().slice(0,5),
      nivel: ultimo.nivel
    };

  } catch (error) {

    console.log("Erro INEA estação:", codigo, error.message);

    return null;

  }

}

export async function GET() {

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id,codigo_estacao")
    .eq("fonte","INEA")
    .eq("ativo",true);

  const resultados = [];

  for (const estacao of estacoes) {

    const dados = await capturarINEA(estacao.codigo_estacao);

    if (dados) {

      resultados.push({
        estacao_id: estacao.id,
        fonte: "INEA", // <--- ADICIONE ESTA LINHA
        ...dados
      });

    }

    // evita bloqueio do INEA (igual seu python)
    await sleep(600);

  }

  return NextResponse.json(resultados);

}
