/* app/api/ana/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseStringPromise } from "xml2js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function formatarData(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

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
      headers: {
        "Accept": "application/xml",
        "User-Agent": "Mozilla/5.0"
      },
      cache: "no-store"
    });

    if (!resp.ok) return null;

    let xml = await resp.text();

    // 🔎 extrai XML interno caso venha dentro de <string>
    const match = xml.match(/<string[^>]*>([\s\S]*)<\/string>/);
    if (match) xml = match[1];

    // remove namespaces (igual python)
    xml = xml
      .replace(/<\/?\w+:/g, "<")
      .replace(/xmlns(:\w+)?="[^"]*"/g, "")
      .trim();

    const json = await parseStringPromise(xml, {
      explicitArray: false,
      mergeAttrs: true
    });

    let registros = json?.NewDataSet?.DadosHidrometereologicos;

    if (!registros) return null;

    if (!Array.isArray(registros)) registros = [registros];

    const registrosValidos = [];

    registros.forEach((r) => {

      const dataHora = r.DataHora;
      const nivelRaw = r.Nivel;

      if (!dataHora || !nivelRaw) return;

      const dt = new Date(dataHora.replace(" ", "T"));
      const nivel = parseFloat(nivelRaw);

      if (!isNaN(dt.getTime()) && !isNaN(nivel)) {

        registrosValidos.push({
          dt,
          nivel: nivel / 100
        });

      }

    });

    if (registrosValidos.length === 0) return null;

    // pega o mais recente
    const ultimo = registrosValidos.reduce((a, b) =>
      a.dt > b.dt ? a : b
    );

    return {
      data: ultimo.dt.toISOString().split("T")[0],
      hora: ultimo.dt.toTimeString().slice(0, 5),
      nivel: ultimo.nivel
    };

  } catch (err) {

    console.error(`Erro ANA ${codigo}`, err);
    return null;

  }

}

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
