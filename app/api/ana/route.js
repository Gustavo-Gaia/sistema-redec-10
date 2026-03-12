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
  // Formatação manual da data para garantir DD/MM/YYYY
  const formatarData = (date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 5);

  const dataFim = formatarData(hoje);
  const dataInicio = formatarData(inicio);

  const url = `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${codigo}&dataInicio=${dataInicio}&dataFim=${dataFim}`;

  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/xml' },
      next: { revalidate: 0 }
    });

    if (!resp.ok) return null;

    const xml = await resp.text();

    // Limpeza de XML mais agressiva (similar ao seu Regex do Python)
    const xmlLimpo = xml
      .replace(/<\/?\w+:/g, "<")
      .replace(/xmlns(:\w+)?="[^"]*"/g, "")
      .trim();

    const json = await parseStringPromise(xmlLimpo, { explicitArray: false, mergeAttrs: true });

    // O webservice da ANA retorna NewDataSet -> DadosHidrometereologicos (atenção ao erro de digitação do próprio ANA: "metereologicos")
    let registros = json?.NewDataSet?.DadosHidrometereologicos;

    if (!registros) return null;

    // Se vier apenas um registro, o xml2js não cria array com explicitArray: false, então normalizamos
    if (!Array.isArray(registros)) registros = [registros];

    const registrosValidos = [];

    registros.forEach((r) => {
      const dataHoraRaw = r.DataHora;
      const nivelRaw = r.Nivel;

      if (!dataHoraRaw || !nivelRaw) return;

      // ANA costuma enviar: 2024-03-12 10:00:00 ou formato ISO
      const dt = new Date(dataHoraRaw.replace(" ", "T")); 
      const nivel = parseFloat(nivelRaw);

      if (!isNaN(dt.getTime()) && !isNaN(nivel)) {
        registrosValidos.push({
          dt,
          nivel: nivel / 100 // Convertendo para metros se o dado vier em cm
        });
      }
    });

    if (registrosValidos.length === 0) return null;

    // Pega o mais recente (max no Python)
    const ultimo = registrosValidos.reduce((a, b) => (a.dt > b.dt ? a : b));

    return {
      data: ultimo.dt.toISOString().split("T")[0],
      hora: ultimo.dt.toTimeString().slice(0, 5),
      nivel: ultimo.nivel
    };

  } catch (err) {
    console.error(`Erro ANA Estação ${codigo}:`, err.message);
    return null;
  }
}

export async function GET() {
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes || estacoes.length === 0) return NextResponse.json([]);

  const resultados = [];

  // Na Vercel, limite o loop para não dar timeout se tiver muitas estações
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
