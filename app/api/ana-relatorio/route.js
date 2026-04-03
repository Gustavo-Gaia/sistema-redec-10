export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// URL base extraída do manual [cite: 47]
const ANA_BASE_URL = "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas";
const IDENTIFICADOR = process.env.ANA_IDENTIFICADOR;
const SENHA = process.env.ANA_SENHA;

// --- AUXILIARES ---

async function obterToken() {
  try {
    // Rota de autenticação conforme página 13 [cite: 56]
    const resp = await fetch(`${ANA_BASE_URL}/OAUth/v1`, {
      method: 'GET',
      headers: {
        'Identificador': IDENTIFICADOR,
        'Senha': SENHA
      }
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    
    // O campo exato no JSON é 'tokenautenticacao' dentro de 'items' 
    return data.items?.tokenautenticacao || null;
  } catch (err) {
    console.error("Erro na autenticação ANA:", err);
    return null;
  }
}

function processarMedicoes(items, horaRef) {
  if (!items || !Array.isArray(items)) return null;

  // Mapeamento conforme campos do Anexo I do manual 
  const medicoes = items.map(item => {
    // Data_Hora_Medicao é o campo oficial para o horário da coleta 
    // Cota_Adotada vem em centímetros (cm) 
    const dt = new Date(item.Data_Hora_Medicao.replace(" ", "T")); 
    const nivelCm = parseFloat(item.Cota_Adotada);

    return {
      datetime: dt,
      nivel: nivelCm / 100 // Convertendo cm para metros para manter seu padrão
    };
  }).filter(m => !isNaN(m.nivel));

  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(parseInt(horaRef));

  const chaves = ["ref", "h4", "h8", "h12"];
  const resultado = {};

  [0, 4, 8, 12].forEach((sub, i) => {
    const alvo = new Date(base);
    alvo.setHours(alvo.getHours() - sub);

    const limitePassado = new Date(alvo.getTime() - (120 * 60000));
    const limiteFuturo = new Date(alvo.getTime() + (30 * 60000));

    const filtrados = medicoes.filter(m => 
      m.datetime >= limitePassado && m.datetime <= limiteFuturo
    );

    if (filtrados.length > 0) {
      filtrados.sort((a, b) => Math.abs(a.datetime - alvo) - Math.abs(b.datetime - alvo));
      const m = filtrados[0];
      resultado[chaves[i]] = {
        nivel: m.nivel,
        hora: m.datetime.toTimeString().slice(0, 5)
      };
    } else {
      resultado[chaves[i]] = null;
    }
  });

  return resultado;
}

// --- CORE ---

async function buscarDadosEstacao(token, codigoEstacao, horaRef) {
  // Rota oficial para séries adotadas (tempo quase-real) [cite: 39, 71]
  const url = `${ANA_BASE_URL}/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigoEstacao}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_30`;

  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`, // Autenticação via Bearer Token 
        'Accept': 'application/json'
      }
    });

    if (!resp.ok) return null;

    const json = await resp.json();
    // Os dados ficam dentro da array 'items' 
    return processarMedicoes(json.items, horaRef);
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

  const token = await obterToken();
  if (!token) return NextResponse.json({ error: "Falha na autenticação com a ANA" }, { status: 401 });

  const resultados = {};

  for (const estacao of estacoes) {
    const dados = await buscarDadosEstacao(token, estacao.codigo_estacao, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    }
    // Delay para evitar bloqueio de IP conforme recomendado 
    await new Promise(r => setTimeout(r, 300));
  }

  return NextResponse.json(resultados);
}
