export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Cache de Token (conforme item 6 do manual: validade de 15 min)
let globalToken = null;
let globalTokenExp = 0;

async function getAuthToken() {
  const agora = Date.now();
  if (globalToken && agora < globalTokenExp) return globalToken;

  try {
    const resp = await fetch("https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1", {
      method: "GET",
      headers: {
        "Identificador": String(process.env.ANA_IDENTIFICADOR).trim(),
        "Senha": String(process.env.ANA_SENHA).trim(),
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    const json = await resp.json();
    // O manual Java mostra json.items.tokenautenticacao
    const token = json?.items?.tokenautenticacao || json?.items?.TokenAutenticacao;

    if (!token) return null;

    globalToken = token;
    globalTokenExp = agora + (14 * 60 * 1000); // 14 minutos para segurança
    return token;
  } catch (err) {
    return null;
  }
}

async function processarEstacao(codigo, horaRef, token) {
  // Usamos a URL base do manual, mas DIAS_3 para performance (já que o dado é de hoje)
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetrica/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_3`;

  try {
    const resp = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      cache: "no-store"
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json?.items || [];
    
    if (!Array.isArray(items) || items.length === 0) return null;

    // MAPEAMENTO AGRESSIVO: Tenta encontrar o nível em qualquer campo possível
    const medicoes = items.map(m => {
      const valorBruto = m.Cota ?? m.Cota_Adotada ?? m.Media ?? m.Valor ?? m.Cota_Bruta;
      
      // ISO Date fix: Garante que "2026-04-01 08:00:00" vire "2026-04-01T08:00:00"
      const dataString = m.Data_Hora_Medicao.includes("T") 
        ? m.Data_Hora_Medicao 
        : m.Data_Hora_Medicao.replace(" ", "T");

      return {
        datetime: new Date(dataString),
        nivel: parseFloat(valorBruto) / 100 
      };
    }).filter(m => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

    // Lógica de horários alvos
    const agora = new Date();
    const base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), parseInt(horaRef), 0, 0);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      
      // Janela de 4 horas (240 min) para "pescar" o dado mais próximo do alvo
      const m = medicoes
        .filter(med => med.datetime <= alvo && med.datetime >= new Date(alvo.getTime() - 240 * 60000))
        .sort((a, b) => b.datetime - a.datetime)[0];
                        
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  // 1. Token
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ erro: "Falha na autenticação ANA (Token nulo)" }, { status: 401 });
  }

  // 2. Estações do Supabase
  const { data: estacoes, error: dbError } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (dbError) return NextResponse.json({ erro: "Erro Banco", detalhes: dbError }, { status: 500 });
  if (!estacoes || estacoes.length === 0) return NextResponse.json({ aviso: "Sem estações ANA no banco" });

  // 3. Processamento em Lotes (Simulando o threadCount do Java)
  const resultados = {};
  const BATCH_SIZE = 3; // Lote menor para evitar Timeout da Vercel (10s)

  for (let i = 0; i < estacoes.length; i += BATCH_SIZE) {
    const grupo = estacoes.slice(i, i + BATCH_SIZE);
    
    await Promise.all(grupo.map(async (e) => {
      const dados = await processarEstacao(e.codigo_estacao, horaRef, token);
      if (dados) {
        resultados[e.id] = dados;
      }
    }));

    // Se estivermos chegando perto do limite de tempo da Vercel, o loop continua
  }

  // Se resultados estiver vazio, enviamos um log útil para você ler no navegador
  if (Object.keys(resultados).length === 0) {
    return NextResponse.json({
      aviso: "Token OK, Estações OK, mas a ANA não retornou dados para estes códigos.",
      codigos_testados: estacoes.map(e => e.codigo_estacao)
    });
  }

  return NextResponse.json(resultados);
}
