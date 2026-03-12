/* app/api/ana/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =============================
// FORMATAR DATA DD/MM/YYYY
// =============================

function formatarData(d) {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// =============================
// CAPTURAR ANA
// =============================

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

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 8000);

    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      cache: "no-store"
    });

    clearTimeout(timeout);

    if (!resp.ok) return null;

    let xml = await resp.text();

    // remove namespaces
    xml = xml.replace(/<\/?\w+:/g, "<");

    // extrair blocos de medição
    const registros = [...xml.matchAll(
      /<DadosHidrometereologicos>([\s\S]*?)<\/DadosHidrometereologicos>/g
    )];

    if (!registros.length) return null;

    const dados = [];

    for (const r of registros) {

      const bloco = r[1];

      const dataHora = bloco.match(/<DataHora>(.*?)<\/DataHora>/);
      const nivel = bloco.match(/<Nivel>(.*?)<\/Nivel>/);

      if (!dataHora || !nivel) continue;

      const dt = new Date(dataHora[1].replace(" ", "T"));
      const nivelNum = parseFloat(nivel[1]);

      if (!isNaN(dt) && !isNaN(nivelNum)) {

        dados.push({
          dt,
          nivel: nivelNum / 100
        });

      }

    }

    if (!dados.length) return null;

    // pegar medição mais recente
    const ultimo = dados.reduce((a, b) =>
      a.dt > b.dt ? a : b
    );

    return {
      data: ultimo.dt.toISOString().split("T")[0],
      hora: ultimo.dt.toTimeString().slice(0, 5),
      nivel: ultimo.nivel
    };

  } catch (err) {

    console.log("Erro ANA:", codigo);
    return null;

  }

}

// =============================
// API
// =============================

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
        ...dados
      });

    }

  }

  return NextResponse.json(resultados);

}
