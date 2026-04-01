export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let tokenCache = null;
let tokenExpiraEm = null;

// ============================
// 1. OBTENÇÃO DO TOKEN (Ajustado ao Manual)
// ============================
async function getAuthToken(force = false) {
  const agora = Date.now();
  if (!force && tokenCache && tokenExpiraEm && agora < tokenExpiraEm) return tokenCache;

  try {
    // URL exata do manual Java: ApiConfig.HIDRO_WEBSERVICE_URL + "/OAUth/v1"
    const url = "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1";
    
    const resp = await fetch(url, {
      method: "GET",
      headers: { 
        "Identificador": process.env.ANA_IDENTIFICADOR, 
        "Senha": process.env.ANA_SERVER_ROLE_KEY || process.env.ANA_SENHA // Use a variável que definiu no .env
      },
      cache: "no-store",
    });

    const json = await resp.json();
    
    // Conforme TokenModelVO.java e TokenModelItemsVO.java:
    // O token está em json.items.tokenautenticacao (items é um objeto, não array)
    const token = json?.items?.tokenautenticacao;

    if (!token) {
      console.error("ERRO ANA: Resposta sem token", json);
      return null;
    }

    tokenCache = token;
    tokenExpiraEm = agora + 50 * 60 * 1000; 
    return token;
  } catch (err) {
    console.error("ERRO CRÍTICO AUTENTICAÇÃO ANA:", err);
    return null;
  }
}

// ============================
// 2. BUSCA DE DADOS (Ajustado ao Manual)
// ============================
async function processarEstacao(codigo, horaRef, token) {
  // O manual sugere DIAS_30 no exemplo Java, mas DIAS_3 é mais rápido para o seu relatório
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_3`;

  try {
    const resp = await fetch(url, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      },
      cache: "no-store",
    });

    if (!resp.ok) return null;
    
    const json = await resp.json();
    // No manual DevolucaoVO.java, os dados estão em json.items
    const items = json?.items || [];
    
    if (items.length === 0) return null;

    const medicoes = items.map(m => ({
      // Ajuste para garantir que o JS entenda a data da ANA corretamente
      datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
      nivel: parseFloat(m.Cota_Adotada || m.Cota) / 100
    })).filter(m => !isNaN(m.nivel));

    // Lógica de horários (Ref, -4h, -8h, -12h)
    const base = new Date();
    base.setHours(parseInt(horaRef), 0, 0, 0);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);

      // Busca a leitura mais próxima (janela de 2 horas para cobrir atrasos da telemetria)
      const limiteInferior = new Date(alvo.getTime() - 120 * 60000);
      
      const m = medicoes
        .filter(med => med.datetime <= alvo && med.datetime >= limiteInferior)
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
// 3. ROTA GET
// ============================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "Falha na autenticação ANA" }, { status: 401 });

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA").eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};
  const BATCH_SIZE = 5; // Para não ser bloqueado por excesso de requisições simultâneas

  for (let i = 0; i < estacoes.length; i += BATCH_SIZE) {
    const grupo = estacoes.slice(i, i + BATCH_SIZE);
    await Promise.all(grupo.map(async (estacao) => {
      const dados = await processarEstacao(estacao.codigo_estacao, horaRef, token);
      if (dados) {
        resultados[estacao.id] = dados;
      }
    }));
  }

  return NextResponse.json(resultados);
}
