export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase via Variáveis de Ambiente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Cache Global para o Token (Duração de 15 minutos conforme manual)
let globalToken = null;
let globalTokenExp = 0;

// ============================
// 🔐 AUTENTICAÇÃO DIRETA ANA
// ============================
async function getAuthToken() {
  const agora = Date.now();
  if (globalToken && agora < globalTokenExp) return globalToken;

  try {
    const resp = await fetch("https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1", {
      method: "GET",
      headers: {
        "Identificador": "09627246700",
        "Senha": "qaex0ake",
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    const json = await resp.json();
    
    // Captura o token seguindo a estrutura exata do manual (items -> tokenautenticacao)
    const token = json?.items?.tokenautenticacao || json?.items?.TokenAutenticacao;

    if (!token) {
      console.error("❌ ERRO NO LOGIN ANA:", json);
      return null;
    }

    globalToken = token;
    globalTokenExp = agora + (14 * 60 * 1000); // 14 minutos para segurança
    return token;
  } catch (err) {
    console.error("💥 FALHA NA REQUISIÇÃO DE TOKEN:", err.message);
    return null;
  }
}

// ============================
// 📡 PROCESSAMENTO DE ESTAÇÃO
// ============================
async function processarEstacao(codigo, horaRef, token) {
  // Usando Série Telemetrica (Bruta) para garantir dados de hoje
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

    // Mapeamento de múltiplos campos de nível (Cota, Cota_Adotada, Valor, Media)
    const medicoes = items.map(m => {
      const valorBruto = m.Cota ?? m.Cota_Adotada ?? m.Valor ?? m.Media;
      const dataISO = m.Data_Hora_Medicao.includes("T") 
        ? m.Data_Hora_Medicao 
        : m.Data_Hora_Medicao.replace(" ", "T");

      return {
        datetime: new Date(dataISO),
        nivel: parseFloat(valorBruto) / 100 
      };
    }).filter(m => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

    // Lógica para encontrar os horários de referência
    const agora = new Date();
    const base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), parseInt(horaRef), 0, 0);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      
      // Janela de 4 horas para encontrar o dado telemétrico mais próximo
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

// ============================
// 🚀 ROTA PRINCIPAL (GET)
// ============================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  // 1. Tenta obter o Token
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ 
      erro: "Falha na Autenticação ANA com Identificador Direto",
      dica: "Verifique se a senha qaex0ake está correta ou se o acesso Web Service está ativo para este ID."
    }, { status: 401 });
  }

  // 2. Busca estações no Supabase
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes || estacoes.length === 0) {
    return NextResponse.json({ aviso: "Nenhuma estação ANA encontrada no banco de dados." });
  }

  const resultados = {};
  
  // 3. Processamento em paralelo (Lotes de 4 estações)
  for (let i = 0; i < estacoes.length; i += 4) {
    const grupo = estacoes.slice(i, i + 4);
    await Promise.all(grupo.map(async (e) => {
      const dados = await processarEstacao(e.codigo_estacao, horaRef, token);
      if (dados) resultados[e.id] = dados;
    }));
  }

  // Retorno final para o front-end
  return NextResponse.json(resultados);
}
