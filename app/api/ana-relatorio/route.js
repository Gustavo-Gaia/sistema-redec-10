export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

let globalToken = null;
let globalTokenExp = 0;

async function getAuthToken() {
  const agora = Date.now();
  if (globalToken && agora < globalTokenExp) return globalToken;

  // Criamos um sinal de cancelamento de 25 segundos (limite máximo seguro na Vercel)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const resp = await fetch("https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1", {
      method: "GET",
      headers: {
        "Identificador": "09627246700",
        "Senha": "qaex0ake",
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
      },
      signal: controller.signal,
      cache: "no-store"
    });

    clearTimeout(timeoutId);
    const json = await resp.json();
    
    // Captura flexível conforme o manual e seu teste
    const token = json?.items?.tokenautenticacao || json?.items?.TokenAutenticacao || json?.tokenautenticacao;

    if (!token) return null;

    globalToken = token;
    globalTokenExp = agora + (14 * 60 * 1000);
    return token;
  } catch (err) {
    console.error("⏳ Erro ou Timeout na ANA:", err.name === 'AbortError' ? "Tempo esgotado" : err.message);
    return null;
  }
}

async function processarEstacao(codigo, horaRef, token) {
  // Calculamos a data de hoje e de 2 dias atrás no formato AAAA-MM-DD
  const hoje = new Date();
  const anteontem = new Date();
  anteontem.setDate(hoje.getDate() - 2);
  
  const dataFim = hoje.toISOString().split('T')[0];
  const dataInicio = anteontem.toISOString().split('T')[0];

  // ESTRATÉGIA FINAL: Usar DataInicio e DataFim em vez de RangeIntervalo
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetrica/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&DataInicio=${dataInicio}&DataFim=${dataFim}`;

  try {
    const resp = await fetch(url, {
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      signal: AbortSignal.timeout(10000), 
      cache: "no-store"
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json?.items || [];
    
    if (items.length === 0) return null;

    const medicoes = items.map(m => {
      const valor = m.Cota ?? m.Valor ?? m.Cota_Adotada ?? m.Media;
      const dataRaw = m.Data_Hora_Medicao || m.Data_Hora_Leitura;
      return {
        datetime: new Date(dataRaw.replace(" ", "T")),
        nivel: parseFloat(valor) / 100 
      };
    }).filter(m => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

    const base = new Date();
    base.setHours(parseInt(horaRef), 0, 0, 0);
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      const m = medicoes
        .filter(med => med.datetime <= alvo && med.datetime >= new Date(alvo.getTime() - 480 * 60000))
        .sort((a, b) => b.datetime - a.datetime)[0];
      resultado[["ref", "h4", "h8", "h12"][i]] = m ? { nivel: m.nivel, hora: m.datetime.toTimeString().slice(0, 5) } : null;
    });
    return resultado;
  } catch (e) { return null; }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ erro: "A ANA demorou muito para responder ou as credenciais falharam." }, { status: 504 });
  }

  const { data: estacoes } = await supabase.from("estacoes").select("id, codigo_estacao").eq("fonte", "ANA").eq("ativo", true);
  if (!estacoes || estacoes.length === 0) return NextResponse.json({});

  const resultados = {};
  // Processamos de 2 em 2 para dar tempo da ANA responder cada uma sem pressa
  for (let i = 0; i < estacoes.length; i += 2) {
    const grupo = estacoes.slice(i, i + 2);
    await Promise.all(grupo.map(async (e) => {
      const dados = await processarEstacao(e.codigo_estacao, horaRef, token);
      if (dados) resultados[e.id] = dados;
    }));
  }

  return NextResponse.json(resultados);
}
