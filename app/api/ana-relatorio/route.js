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

    // 1. Criamos os objetos de data das medições
    const medicoes = items.map((m) => ({
      datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
      nivel: parseFloat(m.Cota_Adotada) / 100,
    })).filter(m => !isNaN(m.nivel));

    // 2. Construção da BASE robusta
    const agora = new Date();
    // Forçamos a criação da data com Strings para evitar bugs de virada de dia do objeto Date
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(horaRef).padStart(2, '0');
    
    // "2026-04-03T01:00:00"
    const base = new Date(`${ano}-${mes}-${dia}T${hora}:00:00`);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      // Criamos o alvo a partir do Timestamp (milissegundos) da base
      // Isso GARANTE que ao subtrair 4 horas de 01:00, ele vá para 21:00 do dia anterior
      const alvoTimestamp = base.getTime() - (sub * 60 * 60 * 1000);
      const alvo = new Date(alvoTimestamp);

      // Janela de tolerância: 60 minutos ANTES do horário alvo
      const limiteMinimo = new Date(alvo.getTime() - (60 * 60 * 1000));

      // LOGICA DE FILTRO ALTERADA: 
      // Buscamos qualquer medição que esteja na janela de 1 hora
      const filtrados = medicoes.filter(m => {
        const mTime = m.datetime.getTime();
        return mTime <= alvo.getTime() && mTime >= limiteMinimo.getTime();
      });

      if (filtrados.length > 0) {
        // Ordena para garantir que pegamos o dado MAIS PRÓXIMO da hora cheia (o maior timestamp)
        filtrados.sort((a, b) => b.datetime.getTime() - a.datetime.getTime());
        const m = filtrados[0];

        resultado[chaves[i]] = {
          nivel: m.nivel,
          hora: m.datetime.toTimeString().slice(0, 5)
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

    await new Promise(r => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
