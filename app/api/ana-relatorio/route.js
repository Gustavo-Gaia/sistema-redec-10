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
      headers: {
        "Identificador": "09627246700",
        "Senha": "qaex0ake",
        "Accept": "*/*" // Mudado para aceitar tudo, conforme seu teste curl
      },
      cache: "no-store"
    });

    const json = await resp.json();
    
    // Pegando EXATAMENTE o campo que apareceu no seu teste manual
    const token = json?.items?.tokenautenticacao;

    if (!token) {
      console.error("Token não encontrado no JSON:", json);
      return null;
    }

    globalToken = token;
    globalTokenExp = agora + (14 * 60 * 1000); // Validade de 14 min
    return token;
  } catch (err) {
    return null;
  }
}

async function processarEstacao(codigo, horaRef, token) {
  // URL de telemetria bruta (a que costuma ter o dado de hoje mais rápido)
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetrica/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_3`;

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
    const items = json?.items || [];
    
    if (items.length === 0) return null;

    const medicoes = items.map(m => {
      // No seu teste manual os campos costumam ser Cota ou Valor
      const valorBruto = m.Cota ?? m.Valor ?? m.Cota_Adotada;
      const dataISO = m.Data_Hora_Medicao.replace(" ", "T");

      return {
        datetime: new Date(dataISO),
        nivel: parseFloat(valorBruto) / 100 
      };
    }).filter(m => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

    const base = new Date();
    base.setHours(parseInt(horaRef), 0, 0, 0);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      
      // Janela de 6 horas para garantir o dado
      const m = medicoes
        .filter(med => med.datetime <= alvo && med.datetime >= new Date(alvo.getTime() - 360 * 60000))
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
  if (!token) return NextResponse.json({ erro: "Erro ao capturar tokenautenticacao" }, { status: 401 });

  const { data: estacoes } = await supabase.from("estacoes").select("id, codigo_estacao").eq("fonte", "ANA").eq("ativo", true);
  if (!estacoes || estacoes.length === 0) return NextResponse.json({ aviso: "Sem estações no banco" });

  const resultados = {};
  // Lotes pequenos (2 em 2) para garantir que a Vercel não dê timeout
  for (let i = 0; i < estacoes.length; i += 2) {
    const grupo = estacoes.slice(i, i + 2);
    await Promise.all(grupo.map(async (e) => {
      const dados = await processarEstacao(e.codigo_estacao, horaRef, token);
      if (dados) resultados[e.id] = dados;
    }));
  }

  return NextResponse.json(resultados);
}
