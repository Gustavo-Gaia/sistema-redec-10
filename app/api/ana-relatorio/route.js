export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Cache seguindo a regra de 15 minutos do manual (isTokenValid)
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
    // Conforme TokenModelVO -> TokenModelItemsVO do manual:
    const token = json?.items?.tokenautenticacao;

    if (!token) return null;

    globalToken = token;
    globalTokenExp = agora + (15 * 60 * 1000); // 15 minutos exatos como no Java
    return token;
  } catch (err) {
    return null;
  }
}

async function processarEstacao(codigo, horaRef, token) {
  // Usando a URL exata do manual (item 6: executeRoute)
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_30`;

  try {
    const resp = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    
    // Conforme DevolucaoVO do manual: os dados estão em 'items'
    const items = json?.items || [];
    if (!Array.isArray(items)) return null;

    const medicoes = items.map(m => ({
      // Tratamento para evitar erro de fuso horário no RS/RJ
      datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
      nivel: parseFloat(m.Cota_Adotada || m.Cota) / 100
    })).filter(m => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

    // Lógica de Alvos (Hoje)
    const base = new Date();
    base.setHours(parseInt(horaRef), 0, 0, 0);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      
      // Janela de 4 horas para garantir captura
      const m = medicoes
        .filter(med => med.datetime <= alvo && med.datetime >= new Date(alvo.getTime() - 240 * 60000))
        .sort((a, b) => b.datetime - a.datetime)[0];
                        
      resultado[chaves[i]] = m ? { 
        nivel: m.nivel, 
        hora: m.datetime.toTimeString().slice(0, 5) 
      } : null;
    });

    return resultado;
  } catch (err) { return null; }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "Token inválido ou ausente" }, { status: 401 });

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes || estacoes.length === 0) return NextResponse.json({});

  const resultados = {};
  
  // No Java eles usam threads (5 simultâneas). Fazemos o mesmo com Promise.all em lotes.
  const BATCH_SIZE = 5; 
  for (let i = 0; i < estacoes.length; i += BATCH_SIZE) {
    const grupo = estacoes.slice(i, i + BATCH_SIZE);
    await Promise.all(grupo.map(async (e) => {
      const dados = await processarEstacao(e.codigo_estacao, horaRef, token);
      if (dados) resultados[e.id] = dados;
    }));
    // Pequena pausa para não ser bloqueado por "alta frequência" (item 2.7 do manual)
    await new Promise(r => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
