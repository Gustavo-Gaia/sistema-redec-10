/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAuthToken() {
  try {
    const resp = await fetch(
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1",
      {
        headers: {
          accept: "*/*",
          Identificador: process.env.ANA_IDENTIFICADOR,
          Senha: process.env.ANA_SENHA,
        },
        cache: "no-store",
      }
    );

    const json = await resp.json();
    return json?.items?.tokenautenticacao || null;
  } catch (err) {
    return null;
  }
}

async function processarEstacao(codigo, token, horaRef) {
  const url =
    `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
    `?C%C3%B3digo%20da%20Esta%C3%A7%C3%A3o=${codigo}` +
    `&Tipo%20Filtro%20Data=DATA_LEITURA` +
    `&Range%20Intervalo%20de%20busca=DIAS_3`;

  try {
    const resp = await fetch(url, {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!resp.ok) return null;

    const json = await resp.json();
    const items = json?.items || [];

    if (items.length === 0) return null;

    // 🔥 converter para timestamp (NÚMERO)
    const medicoes = items
      .map((m) => ({
        ms: new Date(m.Data_Hora_Medicao.replace(" ", "T")).getTime(),
        nivel: parseFloat(m.Cota_Adotada) / 100,
      }))
      .filter((m) => !isNaN(m.nivel));

    // 🔥 base HOJE na hora digitada
    const agora = new Date();
    const base = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      parseInt(horaRef),
      0,
      0,
      0
    );

    const baseMS = base.getTime();

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvoMS = baseMS - sub * 60 * 60 * 1000;

      // 🔥 busca o MAIS PRÓXIMO (não usa janela fixa)
      let maisProximo = null;
      let menorDiff = Infinity;

      for (const m of medicoes) {
        const diff = Math.abs(m.ms - alvoMS);

        if (diff < menorDiff) {
          menorDiff = diff;
          maisProximo = m;
        }
      }

      // 🔥 tolerância de até 3 horas
      if (maisProximo && menorDiff <= 3 * 60 * 60 * 1000) {
        const data = new Date(maisProximo.ms);

        resultado[chaves[i]] = {
          nivel: maisProximo.nivel,
          hora: data.toTimeString().slice(0, 5),
        };
      } else {
        resultado[chaves[i]] = null;
      }
    });

    return resultado;
  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ debug: "Erro Token" });

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
      token,
      horaRef
    );

    if (dados) {
      resultados[estacao.id] = dados;
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
