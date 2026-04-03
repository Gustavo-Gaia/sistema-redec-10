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
          'accept': '*/*',
          'Identificador': process.env.ANA_IDENTIFICADOR,
          'Senha': process.env.ANA_SENHA,
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
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
              `?C%C3%B3digo%20da%20Esta%C3%A7%C3%A3o=${codigo}` +
              `&Tipo%20Filtro%20Data=DATA_LEITURA` +
              `&Range%20Intervalo%20de%20busca=DIAS_3`;

  try {
    const resp = await fetch(url, {
      headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` },
      cache: "no-store",
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json?.items || [];
    if (items.length === 0) return null;

    // 1. Parse Manual: Evita o erro de "Invalid Date" no servidor
    const medicoes = items.map((m) => {
      // m.Data_Hora_Medicao vem como "02/04/2026 20:00:00"
      const [data, horaFull] = m.Data_Hora_Medicao.split(" ");
      const [d, mes, a] = data.split("/");
      const [h, min] = horaFull.split(":");
      
      // Criamos o objeto Date de forma explícita (Ano, Mês-1, Dia, Hora, Min)
      const dt = new Date(parseInt(a), parseInt(mes) - 1, parseInt(d), parseInt(h), parseInt(min));

      return {
        timestamp: dt.getTime(),
        nivel: parseFloat(m.Cota_Adotada) / 100,
        horaTexto: `${h}:${min}`
      };
    }).filter(m => !isNaN(m.nivel) && !isNaN(m.timestamp));

    // 2. Base de HOJE (08h, 04h, etc)
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

    // 3. Loop de Subtração
    [0, 4, 8, 12].forEach((sub, i) => {
      // Subtração de milissegundos pura (3600000 ms = 1 hora)
      const alvoMs = base.getTime() - (sub * 3600000);
      const limiteMinimoMs = alvoMs - (60 * 60000); // Janela de 1 hora para trás

      const filtrados = medicoes.filter(m =>
        m.timestamp <= alvoMs && m.timestamp >= limiteMinimoMs
      );

      if (filtrados.length > 0) {
        // Ordena pelo timestamp mais recente
        filtrados.sort((a, b) => b.timestamp - a.timestamp);
        const m = filtrados[0];

        resultado[chaves[i]] = {
          nivel: m.nivel,
          hora: m.horaTexto
        };
      } else {
        resultado[chaves[i]] = null;
      }
    });

    return resultado;

  } catch (err) {
    console.error("Erro interno processarEstacao:", err);
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

    await new Promise(r => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
