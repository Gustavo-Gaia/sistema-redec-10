/* app/api/ana/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseStringPromise } from "xml2js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function capturarANA(codigo) {
  const formatarDataBR = (data) => {
    const d = String(data.getDate()).padStart(2, '0');
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const y = data.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 3); // Reduzi para 3 dias para ser mais rápido

  const dataFim = formatarDataBR(hoje);
  const dataInicio = formatarDataBR(inicio);

  const url = `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${codigo}&dataInicio=${dataInicio}&dataFim=${dataFim}`;

  try {
    const resp = await fetch(url, { next: { revalidate: 0 } });
    if (!resp.ok) return null;

    const xml = await resp.text();

    // 1. Limpeza agressiva de namespaces para simplificar o JSON
    const xmlLimpo = xml
      .replace(/<\/?\w+:/g, "<")
      .replace(/xmlns(:\w+)?="[^"]*"/g, "")
      .trim();

    const json = await parseStringPromise(xmlLimpo, { 
      explicitArray: false, 
      ignoreAttrs: true,
      stripPrefix: true // Remove prefixos como diffgr:
    });

    // 2. Tenta encontrar os dados nos dois caminhos possíveis (Normal ou Diffgram)
    let registros = 
      json?.DataTable?.diffgram?.DocumentElement?.DadosHidrometereologicos || 
      json?.NewDataSet?.DadosHidrometereologicos ||
      json?.DocumentElement?.DadosHidrometereologicos;

    if (!registros) return null;

    // Normaliza para Array
    if (!Array.isArray(registros)) registros = [registros];

    const registrosValidos = [];

    registros.forEach((r) => {
      const dataHoraRaw = r.DataHora;
      const nivelRaw = r.Nivel;

      if (!dataHoraRaw || !nivelRaw) return;

      const dt = new Date(dataHoraRaw.trim().replace(" ", "T"));
      const nivel = parseFloat(nivelRaw.replace(",", "."));

      if (!isNaN(dt.getTime()) && !isNaN(nivel)) {
        registrosValidos.push({ dt, nivel: nivel / 100 });
      }
    });

    if (registrosValidos.length === 0) return null;

    // Pega o mais recente
    const ultimo = registrosValidos.reduce((a, b) => (a.dt > b.dt ? a : b));

    return {
      data: ultimo.dt.toISOString().split("T")[0],
      hora: ultimo.dt.toTimeString().slice(0, 5),
      nivel: ultimo.nivel
    };

  } catch (err) {
    console.error(`Erro ANA ${codigo}:`, err.message);
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

  // Processa as estações
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
