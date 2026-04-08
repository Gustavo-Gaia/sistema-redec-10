/* app/api/ana-relatorio-legado/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
// CAPTURAR DADOS ANTIGOS
// ============================

async function capturarANA(codigo) {
  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 2);

  const url =
    `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos` +
    `?codEstacao=${codigo}` +
    `&dataInicio=${formatarData(inicio)}` +
    `&dataFim=${formatarData(hoje)}`;

  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store"
    });

    if (!resp.ok) return [];

    const xml = await resp.text();

    // pega TODAS medições (não só a primeira)
    const regex = /<DadosHidrometereologicos>[\s\S]*?<DataHora>(.*?)<\/DataHora>[\s\S]*?<Nivel>(.*?)<\/Nivel>/g;

    const medicoes = [];

    let match;
    while ((match = regex.exec(xml)) !== null) {
      const dt = new Date(match[1].replace(" ", "T"));
      const nivel = parseFloat(match[2]) / 100;

      if (!isNaN(nivel)) {
        medicoes.push({ datetime: dt, nivel });
      }
    }

    return medicoes;

  } catch (err) {
    return [];
  }
}

// ============================
// PROCESSAR IGUAL API NOVA
// ============================

function montarBlocos(medicoes, horaRef) {

  const agora = new Date();

  const base = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
    parseInt(horaRef),
    0, 0, 0
  );

  const chaves = ["ref", "h4", "h8", "h12"];
  const resultado = {};

  [0, 4, 8, 12].forEach((sub, i) => {

    const alvo = new Date(base);
    alvo.setHours(alvo.getHours() - sub);

    const limiteMinimo = new Date(alvo.getTime() - 60 * 60000);

    const filtrados = medicoes.filter(m =>
      m.datetime <= alvo && m.datetime >= limiteMinimo
    );

    if (filtrados.length > 0) {
      filtrados.sort((a, b) => b.datetime - a.datetime);

      resultado[chaves[i]] = {
        nivel: filtrados[0].nivel,
        hora: filtrados[0].datetime.toTimeString().slice(0, 5)
      };
    } else {
      resultado[chaves[i]] = null;
    }

  });

  return resultado;
}

// ============================
// API
// ============================

export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};

  for (const estacao of estacoes) {

    const medicoes = await capturarANA(estacao.codigo_estacao);

    if (medicoes.length > 0) {
      resultados[estacao.id] = montarBlocos(medicoes, horaRef);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
