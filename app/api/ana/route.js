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
      cache: "no-store",
      signal: AbortSignal.timeout(10000) // evita travamento
    });

    if (!resp.ok) return null;

    const xml = await resp.text();

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
      nivel: nivel / 100,
      fonte: "ANA"
    };

  } catch (err) {

    console.log(`Erro ANA estação ${codigo}:`, err.message);
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
      .eq("fonte", "ANA")
      .eq("ativo", true);

    if (error) {
      console.error("Erro ao buscar estações ANA:", error);
      return NextResponse.json([]);
    }

    if (!estacoes || estacoes.length === 0) {
      return NextResponse.json([]);
    }

    console.log("Estações ANA encontradas:", estacoes.length);

    // ============================
    // CAPTURA EM PARALELO
    // ============================

    const promessas = estacoes.map(async (estacao) => {

      const dados = await capturarANA(estacao.codigo_estacao);

      if (!dados) return null;

      return {
        estacao_id: estacao.id,
        ...dados
      };

    });

    const resultadosBrutos = await Promise.all(promessas);

    // remove null
    const resultados = resultadosBrutos.filter(r => r !== null);

    console.log("Medições ANA capturadas:", resultados.length);

    return NextResponse.json(resultados);

  } catch (err) {

    console.error("Erro geral na API ANA:", err);

    return NextResponse.json(
      { erro: "Falha ao capturar dados ANA" },
      { status: 500 }
    );

  }

}
