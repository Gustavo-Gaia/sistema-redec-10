/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 🔥 CACHE GLOBAL: Fica fora da função GET para persistir entre as chamadas
let globalToken = null;
let globalTokenExp = 0;

async function getAuthToken() {
  const agora = Date.now();
  
  // Se já temos um token e ele ainda vale (usando margem de 50min)
  if (globalToken && agora < globalTokenExp) {
    console.log("♻️ Usando token do cache...");
    return globalToken;
  }

  try {
    console.log("🔐 Solicitando NOVO token à ANA...");
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
    const token = json?.items?.tokenautenticacao;

    if (!token) throw new Error("Token não encontrado na resposta");

    // Salva no cache global
    globalToken = token;
    globalTokenExp = agora + (50 * 60 * 1000); // Expira em 50 minutos
    
    return token;
  } catch (err) {
    console.error("❌ Erro ao autenticar:", err);
    return null;
  }
}

// ... manter funções gerarAlvos e encontrarMedicaoProxima ...

async function processarEstacao(codigo, horaRef, token) {
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_7`; // Aumentei para 7 dias por segurança

  try {
    const resp = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "User-Agent": "PostmanRuntime/7.32.3" // User-agent mais comum para evitar bloqueios
      },
      cache: "no-store"
    });

    if (resp.status === 401) return { error: "TOKEN_EXPIRED" };
    if (!resp.ok) return null;

    const json = await resp.json();
    const items = json?.items || [];
    
    const medicoes = items.map(m => ({
      datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
      nivel: parseFloat(m.Cota_Adotada || m.Cota) / 100
    })).filter(m => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

    const alvos = [0, 4, 8, 12].map(sub => {
      const d = new Date();
      d.setHours(parseInt(horaRef) - sub, 0, 0, 0);
      return d;
    });

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    alvos.forEach((alvo, i) => {
      // Janela de 3 horas para garantir que ache o dado telemétrico
      const m = medicoes.filter(med => med.datetime <= alvo && med.datetime >= new Date(alvo.getTime() - 180 * 60000))
                        .sort((a, b) => b.datetime - a.datetime)[0];
      resultado[chaves[i]] = m ? { nivel: m.nivel, hora: m.datetime.toTimeString().slice(0, 5) } : null;
    });

    return resultado;
  } catch (err) { return null; }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "Erro de Autenticação" }, { status: 401 });

  const { data: estacoes } = await supabase.from("estacoes").select("id, codigo_estacao").eq("fonte", "ANA").eq("ativo", true);
  
  const resultados = {};
  const BATCH = 5;

  for (let i = 0; i < estacoes.length; i += BATCH) {
    const grupo = estacoes.slice(i, i + BATCH);
    await Promise.all(grupo.map(async (e) => {
      const dados = await processarEstacao(e.codigo_estacao, horaRef, token);
      if (dados) resultados[e.id] = dados;
    }));
    await new Promise(r => setTimeout(r, 400)); // Delay para não sobrecarregar
  }

  return NextResponse.json(resultados);
}
