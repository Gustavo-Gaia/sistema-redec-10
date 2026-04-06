export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // ✅ Acesso único centralizado
import * as cheerio from "cheerio";
import axios from "axios";
import https from "https";

// Configuração para ignorar erros de certificado SSL do INEA
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================
// GERAR HORÁRIOS ALVO
// ============================
function gerarHorariosAlvo(horaRef) {
  // Pega a data atual no fuso do servidor (ajustado para Brasília se necessário)
  const base = new Date();
  base.setMinutes(0, 0, 0, 0);
  base.setHours(parseInt(horaRef));

  return [0, 4, 8, 12].map((sub) => {
    const d = new Date(base);
    d.setHours(d.getHours() - sub);
    return d;
  });
}

// ============================
// PEGAR VALOR COM TOLERÂNCIA (60 MIN)
// ============================
function getValorComTolerancia(lista, alvo) {
  // Define o limite de 1 hora atrás (60 minutos)
  const limiteMinimo = new Date(alvo.getTime() - 60 * 60000);

  // Filtra medições que estão dentro da janela de 1h antes do horário alvo
  const filtrados = lista.filter(m => m.dt <= alvo && m.dt >= limiteMinimo);

  if (filtrados.length === 0) return null;

  // Ordena para garantir que pegamos a medição mais próxima do alvo
  filtrados.sort((a, b) => b.dt - a.dt);

  return filtrados[0];
}

// ============================
// PROCESSAR ESTAÇÃO INEA
// ============================
async function processarINEA(codigo, horaRef) {
  const url = `https://alertadecheias.inea.rj.gov.br/alertadecheias/${codigo}.html`;

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      httpsAgent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"
      }
    });

    const $ = cheerio.load(response.data);
    const tabela = $("#Table").length ? $("#Table") : $("table");
    const registros = [];

    tabela.find("tr").each((i, el) => {
      const cols = $(el).find("td");
      if (cols.length < 8) return;

      const dataHoraTxt = $(cols[0]).text().trim();
      const nivelTxt = $(cols[7]).text().trim();

      if (!dataHoraTxt || !nivelTxt || dataHoraTxt.includes("Data")) return;

      try {
        const [dataPart, horaPart] = dataHoraTxt.split(" ");
        const [dia, mes, ano] = dataPart.split("/");
        
        // Criar objeto Date robusto
        const dt = new Date(`${ano}-${mes}-${dia}T${horaPart}:00`);
        const nivel = parseFloat(nivelTxt.replace(",", "."));

        if (!isNaN(dt.getTime()) && !isNaN(nivel)) {
          registros.push({ dt, nivel });
        }
      } catch (e) {}
    });

    if (registros.length === 0) return null;

    const horariosAlvo = gerarHorariosAlvo(horaRef);
    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    horariosAlvo.forEach((alvo, i) => {
      const m = getValorComTolerancia(registros, alvo);

      resultado[chaves[i]] = m ? {
        nivel: m.nivel,
        hora: m.dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        data: m.dt.toISOString().split('T')[0] // Adicionado para consistência com a ANA
      } : null;
    });

    return resultado;

  } catch (error) {
    console.error(`❌ Erro scraper INEA (${codigo}):`, error.message);
    return null;
  }
}

// ============================
// HANDLER GET
// ============================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  // Busca estações ativas do INEA no banco via cliente centralizado
  const { data: estacoes, error } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "INEA")
    .eq("ativo", true);

  if (error || !estacoes) {
    return NextResponse.json({ error: "Erro ao buscar estações" }, { status: 500 });
  }

  const resultados = {};

  // Processamento sequencial com delay para evitar bloqueio por IP (WAF/Firewall do INEA)
  for (const estacao of estacoes) {
    const dados = await processarINEA(estacao.codigo_estacao, horaRef);
    
    if (dados) {
      resultados[estacao.id] = dados;
    }

    await sleep(600); // Pausa de segurança
  }

  return NextResponse.json(resultados);
}
