/* app/api/inea/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";
import https from "https";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Agente para ignorar erro de certificado SSL (equivalente ao verify=False do Python)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function capturarINEA(codigo) {
  const url = `https://alertadecheias.inea.rj.gov.br/alertadecheias/${codigo}.html`;

  try {
    const response = await fetch(url, {
      agent: httpsAgent, // Aplica o agente que ignora SSL
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      next: { revalidate: 0 } // Garante que o Next.js não faça cache da resposta
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // O INEA costuma usar ID "Table" (com T maiúsculo). 
    // Por segurança, vamos buscar por ID ou pela estrutura de tabela se falhar.
    let tabela = $("#Table");
    if (tabela.length === 0) tabela = $("table"); 

    const registros = [];

    tabela.find("tr").each((i, el) => {
      const cols = $(el).find("td");
      if (cols.length < 8) return;

      const dataHoraTxt = $(cols[0]).text().trim();
      const nivelTxt = $(cols[7]).text().trim();

      if (!dataHoraTxt || !nivelTxt || dataHoraTxt.includes("Data")) return;

      try {
        // Tratamento da data no formato DD/MM/YYYY HH:MM
        const [dataPart, horaPart] = dataHoraTxt.split(" ");
        const [dia, mes, ano] = dataPart.split("/");
        
        // Criando a data manualmente para evitar problemas de fuso horário local
        const dataFormatada = `${ano}-${mes}-${dia}T${horaPart}:00`;
        const dt = new Date(dataFormatada);

        const nivel = parseFloat(nivelTxt.replace(",", "."));

        if (!isNaN(dt.getTime()) && !isNaN(nivel)) {
          registros.push({ dt, nivel });
        }
      } catch (e) {
        // Ignora linhas de erro de parse
      }
    });

    if (registros.length === 0) return null;

    // 🔥 Encontra o registro mais recente (igual ao seu max() no Python)
    const ultimo = registros.reduce((a, b) => (a.dt > b.dt ? a : b));

    return {
      data: ultimo.dt.toISOString().split("T")[0],
      hora: ultimo.dt.toTimeString().slice(0, 5),
      nivel: ultimo.nivel
    };

  } catch (error) {
    console.error(`Erro na captura do código ${codigo}:`, error.message);
    return null;
  }
}

export async function GET() {
  const { data: estacoes, error } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "INEA")
    .eq("ativo", true);

  if (error || !estacoes) {
    return NextResponse.json({ error: "Erro ao buscar estações" }, { status: 500 });
  }

  const resultados = [];

  // Usando for...of para respeitar o await corretamente
  for (const estacao of estacoes) {
    if (!estacao.codigo_estacao) continue;

    const dados = await capturarINEA(estacao.codigo_estacao);

    if (dados) {
      resultados.push({
        estacao_id: estacao.id,
        ...dados
      });
    }
  }

  return NextResponse.json(resultados);
}
