/* app/api/ana/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// FORMATAR DATA
// ============================

function formatarData(d) {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// ============================
// CAPTURAR DADOS ANA
// ============================

async function capturarANA(codigo) {

  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 5);

  const dataInicio = formatarData(inicio);
  const dataFim = formatarData(hoje);

  const url =
    `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos` +
    `?codEstacao=${codigo}` +
    `&dataInicio=${dataInicio}` +
    `&dataFim=${dataFim}`;

  try {

    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store"
    });

    if (!resp.ok) return null;

    let xml = await resp.text();

    // ============================
    // PEGAR PRIMEIRA MEDIÇÃO
    // ============================

    const match = xml.match(
      /<DadosHidrometereologicos[\s\S]*?<DataHora>(.*?)<\/DataHora>[\s\S]*?<Nivel>(.*?)<\/Nivel>/
    );

    if (!match) return null;

    const dataHora = match[1].trim();
    const nivel = parseFloat(match[2]);

    if (!dataHora || isNaN(nivel)) return null;

    const dt = new Date(dataHora.replace(" ", "T"));

    return {
      data: dt.toISOString().split("T")[0],
      hora: dt.toTimeString().slice(0, 5),
      nivel: nivel / 100
    };

  } catch (err) {

    console.log("Erro ANA:", codigo);
    return null;

  }

}

// ============================
// API
// ============================

export async function GET() {

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json([]);

  const resultados = [];

  for (const estacao of estacoes) {

    const dados = await capturarANA(estacao.codigo_estacao);

    if (dados) {

      resultados.push({
        estacao_id: estacao.id,
        fonte: "ANA", // <--- ADICIONE ESTA LINHA
        ...dados
      });

    }

  }

  return NextResponse.json(resultados);

}
