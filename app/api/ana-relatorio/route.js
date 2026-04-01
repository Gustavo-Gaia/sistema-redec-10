export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

let globalToken = null;
let globalTokenExp = 0;

async function getAuthToken() {
  const agora = Date.now();
  if (globalToken && agora < globalTokenExp) return globalToken;
  try {
    const resp = await fetch("https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1", {
      method: "GET",
      headers: { "Identificador": "09627246700", "Senha": "qaex0ake", "Accept": "application/json" },
      cache: "no-store"
    });
    const json = await resp.json();
    const token = json?.items?.tokenautenticacao || json?.items?.TokenAutenticacao;
    if (!token) return null;
    globalToken = token;
    globalTokenExp = agora + (14 * 60 * 1000);
    return token;
  } catch (err) { return null; }
}

async function processarEstacao(codigo, horaRef, token) {
  // 🛡️ PROTEÇÃO 1: Tentamos primeiro a série ADOTADA (mais estável)
  // 🛡️ PROTEÇÃO 2: Se falhar, tentamos a série BRUTA (mais recente)
  const endpoints = [
    "HidroinfoanaSerieTelemetricaAdotada",
    "HidroinfoanaSerieTelemetrica"
  ];

  for (const endpoint of endpoints) {
    const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/${endpoint}/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_7`;

    try {
      const resp = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
        cache: "no-store"
      });

      if (!resp.ok) continue;
      const json = await resp.json();
      const items = json?.items || [];
      if (items.length === 0) continue;

      const medicoes = items.map(m => {
        const valor = m.Cota ?? m.Cota_Adotada ?? m.Media ?? m.Valor;
        const dataStr = (m.Data_Hora_Medicao || m.Data_Hora_Leitura || "").replace(" ", "T");
        return { datetime: new Date(dataStr), nivel: parseFloat(valor) / 100 };
      }).filter(m => !isNaN(m.nivel));

      if (medicoes.length === 0) continue;

      // Se achou dados em um endpoint, processa e para o loop (break)
      const base = new Date();
      base.setHours(parseInt(horaRef), 0, 0, 0);
      const chaves = ["ref", "h4", "h8", "h12"];
      const resultado = {};

      [0, 4, 8, 12].forEach((sub, i) => {
        const alvo = new Date(base);
        alvo.setHours(alvo.getHours() - sub);
        const m = medicoes.filter(med => med.datetime <= alvo && med.datetime >= new Date(alvo.getTime() - 480 * 60000))
                          .sort((a, b) => b.datetime - a.datetime)[0];
        resultado[chaves[i]] = m ? { nivel: m.nivel, hora: m.datetime.toTimeString().slice(0, 5) } : null;
      });
      return resultado;
    } catch (e) { continue; }
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ erro: "Token nulo" }, { status: 401 });

  const { data: estacoes } = await supabase.from("estacoes").select("id, codigo_estacao").eq("fonte", "ANA").eq("ativo", true);
  if (!estacoes) return NextResponse.json({});

  const resultados = {};
  // 🛡️ PROTEÇÃO 3: Lote de 2 por vez para não estourar os 10s da Vercel
  for (let i = 0; i < estacoes.length; i += 2) {
    const grupo = estacoes.slice(i, i + 2);
    await Promise.all(grupo.map(async (e) => {
      const dados = await processarEstacao(e.codigo_estacao, horaRef, token);
      if (dados) resultados[e.id] = dados;
    }));
  }

  // Se ainda assim der vazio, vamos retornar um log de "Estações Tentadas" para conferência
  if (Object.keys(resultados).length === 0) {
      return NextResponse.json({ 
          debug: "Nenhum dado encontrado nos 2 endpoints da ANA",
          estacoes_testadas: estacoes.map(e => e.codigo_estacao)
      });
  }

  return NextResponse.json(resultados);
}
