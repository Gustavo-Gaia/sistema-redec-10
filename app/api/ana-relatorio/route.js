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

async function processarEstacao(codigo, token, horaRef, debug) {
  const url =
    `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
    `?C%C3%B3digo%20da%20Esta%C3%A7%C3%A3o=${codigo}` +
    `&Tipo%20Filtro%20Data=DATA_LEITURA` +
    `&Range%20Intervalo%20de%20busca=DIAS_2`;

  try {
    const resp = await fetch(url, {
      headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json?.items || [];
    if (items.length === 0) return null;

    const medicoes = items
      .map((m) => ({
        datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
        nivel: parseFloat(m.Cota_Adotada) / 100,
      }))
      .filter((m) => !isNaN(m.nivel));

    // Função interna para buscar dados de uma data específica
    const buscarPorData = (dataAlvo) => {
      const base = new Date(dataAlvo.getFullYear(), dataAlvo.getMonth(), dataAlvo.getDate(), parseInt(horaRef), 0, 0);
      const chaves = ["ref", "h4", "h8", "h12"];
      const res = {};

      [0, 4, 8, 12].forEach((sub, i) => {
        const alvo = new Date(base);
        alvo.setHours(alvo.getHours() - sub);
        
        // Aumentei a margem para 90 min para garantir captura de estações horárias
        const limiteMinimo = new Date(alvo.getTime() - 90 * 60000);

        const filtrados = medicoes.filter(m => m.datetime <= alvo && m.datetime >= limiteMinimo);
        if (filtrados.length > 0) {
          filtrados.sort((a, b) => b.datetime - a.datetime);
          res[chaves[i]] = {
            nivel: filtrados[0].nivel,
            hora: filtrados[0].datetime.toTimeString().slice(0, 5),
            data: filtrados[0].datetime.toLocaleDateString('pt-BR').slice(0, 5)
          };
        } else {
          res[chaves[i]] = null;
        }
      });
      return res;
    };

    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    const resultado = {
      hoje: buscarPorData(hoje),
      ontem: buscarPorData(ontem)
    };

    if (debug) {
      resultado.debug = {
        totalRegistros: items.length,
        ultimaLeitura: items[0]?.Data_Hora_Medicao,
        primeiraLeitura: items[items.length - 1]?.Data_Hora_Medicao
      };
    }

    return resultado;
  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const horaRef = searchParams.get("hora") || "08";

  // 🔥 ATIVA DEBUG VIA URL
  const debug = searchParams.get("debug") === "1";

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
      horaRef,
      debug
    );

    if (dados) {
      resultados[estacao.id] = dados;
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
