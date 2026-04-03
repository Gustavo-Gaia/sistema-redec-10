export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Cache de Token em memória (útil enquanto a instância da Vercel estiver quente)
let tokenCache = null;
let tokenExpiraEm = null;

async function getAuthToken() {
  const agora = Date.now();
  if (tokenCache && tokenExpiraEm && agora < tokenExpiraEm) return tokenCache;

  try {
    const resp = await fetch(
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1",
      {
        headers: {
          Identificador: process.env.ANA_IDENTIFICADOR,
          Senha: process.env.ANA_SENHA,
        },
        cache: "no-store",
      }
    );

    const json = await resp.json();
    const token = json?.items?.tokenautenticacao;

    if (!token) throw new Error("Token não encontrado na resposta");

    tokenCache = token;
    tokenExpiraEm = agora + 14 * 60 * 1000; // Token dura 15min, renovamos com 14 por segurança
    return token;
  } catch (err) {
    console.error("❌ Erro Token ANA:", err);
    return null;
  }
}

function gerarHorariosAlvo(horaRef) {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(parseInt(horaRef));

  return [0, 4, 8, 12].map((sub) => {
    const d = new Date(base);
    d.setHours(d.getHours() - sub);
    return d;
  });
}

function getValorAteHorario(lista, alvo) {
  // Pega apenas medições que aconteceram ATÉ o horário alvo
  // Adicionamos uma tolerância de 2 horas para trás (limitePassado)
  const limitePassado = new Date(alvo.getTime() - 120 * 60000);
  
  const filtrados = lista.filter((m) => m.datetime <= alvo && m.datetime >= limitePassado);

  if (filtrados.length === 0) return null;

  // Ordena para pegar o dado mais recente dentro da janela
  filtrados.sort((a, b) => b.datetime - a.datetime);
  return filtrados[0];
}

async function processarEstacao(codigo, token, horaRef) {
  // Usando DIAS_30 para garantir que pegamos o histórico necessário para h12
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_30`;

  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json?.items || [];

    const medicoes = items.map((m) => {
      // 🚨 CORREÇÃO CRÍTICA: Substituir espaço por 'T' para formato ISO compatível
      const dataFormatada = m.Data_Hora_Medicao.replace(" ", "T");
      return {
        datetime: new Date(dataFormatada),
        nivel: parseFloat(m.Cota_Adotada) / 100, // cm para metros
      };
    }).filter((m) => !isNaN(m.nivel) && m.datetime.toString() !== "Invalid Date");

    if (medicoes.length === 0) return null;

    const horarios = gerarHorariosAlvo(horaRef);
    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    horarios.forEach((alvo, i) => {
      const m = getValorAteHorario(medicoes, alvo);
      resultado[chaves[i]] = m ? {
        nivel: m.nivel,
        hora: m.datetime.toTimeString().slice(0, 5),
      } : null;
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
  if (!token) return NextResponse.json({ error: "Erro de Autenticação" }, { status: 401 });

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};

  // Processamento sequencial com pequeno delay para respeitar o Rate Limit da ANA
  for (const estacao of estacoes) {
    const dados = await processarEstacao(estacao.codigo_estacao, token, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    }
    await new Promise(r => setTimeout(r, 150)); // 150ms entre cada estação
  }

  return NextResponse.json(resultados);
}
