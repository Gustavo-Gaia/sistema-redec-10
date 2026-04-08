export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ============================
// FORMATAR DATA PARA A URL
// ============================
function formatarData(d) {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// ============================
// PARSE XML → ARRAY DE OBJETOS
// ============================
function parseXML(xml) {
  const blocos = xml.split("<DadosHidrometereologicos>");
  const medicoes = [];

  for (const bloco of blocos) {
    const dataMatch = bloco.match(/<DataHora>(.*?)<\/DataHora>/);
    const nivelMatch = bloco.match(/<Nivel>(.*?)<\/Nivel>/);

    if (!dataMatch || !nivelMatch) continue;

    const dataHoraRaw = dataMatch[1].trim();
    const nivel = parseFloat(nivelMatch[1]);

    if (!dataHoraRaw || isNaN(nivel)) continue;

    // Criamos a data usando o formato ISO simples (sem fuso forçado)
    const dt = new Date(dataHoraRaw.replace(" ", "T"));

    medicoes.push({
      datetime: dt,
      nivel: nivel / 100, // Converte cm para m
    });
  }
  return medicoes;
}

// ============================
// LOGICA DE FILTRAGEM (JANELAS)
// ============================
function extrairBlocos(medicoes, horaRef, dataBase) {
  // Define a hora de referência no dia atual
  const base = new Date(dataBase);
  base.setHours(parseInt(horaRef), 0, 0, 0);

  const chaves = ["ref", "h4", "h8", "h12"];
  const intervalos = [0, 4, 8, 12];
  const resultado = {};

  intervalos.forEach((atraso, i) => {
    const alvo = new Date(base.getTime());
    alvo.setHours(alvo.getHours() - atraso);

    // Janela: [Alvo - 1 hora] até [Alvo]
    const inicioJanela = new Date(alvo.getTime() - 60 * 60000);

    const candidatos = medicoes.filter(
      (m) => m.datetime >= inicioJanela && m.datetime <= alvo
    );

    if (candidatos.length > 0) {
      // Ordena para pegar o mais próximo do limite superior da janela (o mais recente)
      candidatos.sort((a, b) => b.datetime - a.datetime);
      const melhor = candidatos[0];

      resultado[chaves[i]] = {
        nivel: melhor.nivel,
        hora: melhor.datetime.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } else {
      resultado[chaves[i]] = null;
    }
  });

  return resultado;
}

// ============================
// PROCESSAR CADA ESTAÇÃO
// ============================
async function processarEstacao(codigo, horaRef) {
  const agora = new Date();
  
  // Retrocedemos 3 dias para garantir que pegamos os dados de ontem (H12)
  const inicio = new Date();
  inicio.setDate(agora.getDate() - 3);

  const url = `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${codigo}&dataInicio=${formatarData(inicio)}&dataFim=${formatarData(agora)}`;

  try {
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) return null;

    const xml = await resp.text();
    const medicoes = parseXML(xml);

    if (medicoes.length === 0) return null;

    // Se a hora digitada ainda não chegou hoje, a base vira "ontem"
    let dataBase = new Date(agora);
    if (parseInt(horaRef) > agora.getHours()) {
      dataBase.setDate(agora.getDate() - 1);
    }

    const blocos = extrairBlocos(medicoes, horaRef, dataBase);

    return { hoje: blocos };
  } catch (err) {
    return null;
  }
}

// ============================
// ROTA PRINCIPAL (GET)
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
    const dados = await processarEstacao(estacao.codigo_estacao, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    }
    // Pequeno delay para evitar bloqueio por excesso de requisições
    await new Promise((r) => setTimeout(r, 150));
  }

  return NextResponse.json(resultados);
}
