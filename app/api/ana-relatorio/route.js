/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";
export const revalidate = 0; // Desativa qualquer cache do Next.js/Vercel

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- AUXILIARES ---

function formatarDataANA(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function extrairMedicoes(xml) {
  const regex = /<DataHora>(.*?)<\/DataHora>[\s\S]*?<Nivel>(.*?)<\/Nivel>/g;
  let match;
  const lista = [];

  while ((match = regex.exec(xml)) !== null) {
    const dataHoraStr = match[1].trim(); 
    const nivel = parseFloat(match[2]);
    if (!dataHoraStr || isNaN(nivel)) continue;

    // Converte a data da ANA para objeto Date real evitando fuso de servidor
    const [dataPart, horaPart] = dataHoraStr.split(" ");
    const [dia, mes, ano] = dataPart.split("/");
    const dt = new Date(`${ano}-${mes}-${dia}T${horaPart}`);

    lista.push({ datetime: dt, nivel: nivel / 100 });
  }
  return lista;
}

function getValorAteHorario(lista, alvo) {
  // JANELA RIGOROSA: Aceita dados de até 2h antes ou 30min depois do alvo
  const limitePassado = new Date(alvo.getTime() - (120 * 60000)); 
  const limiteFuturo = new Date(alvo.getTime() + (30 * 60000));

  const filtrados = lista.filter(m => 
    m.datetime >= limitePassado && m.datetime <= limiteFuturo
  );

  if (filtrados.length === 0) return null;

  // Pega a medição com a menor diferença de tempo em relação ao alvo
  filtrados.sort((a, b) => {
    return Math.abs(a.datetime - alvo) - Math.abs(b.datetime - alvo);
  });

  return filtrados[0];
}

// --- CORE ---

async function processarEstacao(codigo, horaRef) {
  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 2);

  // Cache Buster para evitar que a ANA ou a Vercel entreguem XML vazio antigo
  const buster = Math.random().toString(36).substring(7);
  const url = `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${codigo}&dataInicio=${formatarDataANA(inicio)}&dataFim=${formatarDataANA(hoje)}&v=${buster}`;

  try {
    const resp = await fetch(url, { 
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "Cache-Control": "no-cache"
      }
    });
    
    if (!resp.ok) return null;
    
    const xml = await resp.text();
    if (!xml.includes("<DataHora>")) return null;

    const medicoes = extrairMedicoes(xml);
    const base = new Date();
    base.setMinutes(0, 0, 0);
    base.setHours(parseInt(horaRef));

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      const m = getValorAteHorario(medicoes, alvo);
      
      resultado[chaves[i]] = m ? { 
        nivel: m.nivel, 
        hora: m.datetime.toTimeString().slice(0, 5) 
      } : null;
    });

    return resultado;
  } catch (err) {
    return null;
  }
}

// --- API ---

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes || estacoes.length === 0) return NextResponse.json({});

  const resultados = {};

  // Processamento com "Delay" para evitar bloqueio por IP (Rate Limit)
  for (const estacao of estacoes) {
    const dados = await processarEstacao(estacao.codigo_estacao, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    }
    // Pausa de 400ms entre requisições (camuflagem de robô)
    await new Promise(r => setTimeout(r, 400));
  }

  return NextResponse.json(resultados);
}
