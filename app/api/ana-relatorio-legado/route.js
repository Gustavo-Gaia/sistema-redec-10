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
// BUSCAR E PROCESSAR DADOS
// ============================

async function processarEstacao(codigo, horaRef) {

  const agoraBr = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

  const inicio = new Date(agoraBr);
  inicio.setDate(agoraBr.getDate() - 2);

  const url =
    `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos` +
    `?codEstacao=${codigo}` +
    `&dataInicio=${formatarData(inicio)}` +
    `&dataFim=${formatarData(agoraBr)}`;

  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store"
    });

    if (!resp.ok) return null;

    const xml = await resp.text();

    // 🔥 PEGA TODAS AS MEDIÇÕES (não só a primeira)
    const regex = /<DadosHidrometereologicos>[\s\S]*?<DataHora>(.*?)<\/DataHora>[\s\S]*?<Nivel>(.*?)<\/Nivel>/g;

    const medicoes = [];
    let match;

    while ((match = regex.exec(xml)) !== null) {
      const dataHora = match[1];
      const nivel = parseFloat(match[2]);

      if (!dataHora || isNaN(nivel)) continue;

      const dt = new Date(dataHora.replace(" ", "T"));

      medicoes.push({
        datetime: dt,
        nivel: nivel / 100
      });
    }

    if (medicoes.length === 0) return null;

    // ============================
    // LÓGICA IGUAL À API NOVA
    // ============================

    const extrair = () => {

      const base = new Date(
        agoraBr.getFullYear(),
        agoraBr.getMonth(),
        agoraBr.getDate(),
        parseInt(horaRef),
        0, 0, 0
      );

      const chaves = ["ref", "h4", "h8", "h12"];
      const blocos = {};

      [0, 4, 8, 12].forEach((sub, i) => {

        const alvo = new Date(base);
        alvo.setHours(alvo.getHours() - sub);

        const limiteMin = new Date(alvo.getTime() - 60 * 60000); // -1h

        const filtrados = medicoes.filter(m =>
          m.datetime <= alvo && // NÃO pode passar da hora
          m.datetime >= limiteMin // tolerância de 1h
        );

        if (filtrados.length > 0) {
          filtrados.sort((a, b) => b.datetime - a.datetime);

          blocos[chaves[i]] = {
            nivel: filtrados[0].nivel,
            hora: filtrados[0].datetime.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit"
            })
          };
        } else {
          blocos[chaves[i]] = null;
        }

      });

      return blocos;
    };

    return {
      hoje: extrair()
    };

  } catch (err) {
    console.log("Erro ANA:", codigo);
    return null;
  }
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

    const dados = await processarEstacao(
      estacao.codigo_estacao,
      horaRef
    );

    if (dados) {
      resultados[estacao.id] = dados;
    }

    await new Promise(r => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
