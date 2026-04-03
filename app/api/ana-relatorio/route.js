export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- CONFIGURAÇÕES DA ANA ---
const ANA_BASE_URL = "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas";
const IDENTIFICADOR = process.env.ANA_IDENTIFICADOR;
const SENHA = process.env.ANA_SENHA;

// --- AUXILIARES ---

async function obterToken() {
  try {
    const resp = await fetch(`${ANA_BASE_URL}/OAUth/v1`, {
      method: 'GET',
      headers: {
        'Identificador': IDENTIFICADOR,
        'Senha': SENHA
      },
      next: { revalidate: 600 } // Tenta cachear o token por 10 min se possível
    });

    if (!resp.ok) throw new Error("Falha ao obter token");
    const data = await resp.json();
    
    // O token vem dentro de items.tokenautenticacao segundo o manual
    return data.items?.tokenautenticacao || null;
  } catch (err) {
    console.error("❌ ERRO TOKEN ANA:", err);
    return null;
  }
}

function processarMedicoesNovas(items, horaRef) {
  if (!items || !Array.isArray(items)) return null;

  // A nova API retorna objetos com DataLeitura e Nivel
  const medicoes = items.map(item => {
    // Exemplo de data da nova API geralmente segue ISO ou padrão PT-BR
    // Ajuste aqui se o formato de string for diferente
    const dt = new Date(item.DataLeitura); 
    return {
      datetime: dt,
      nivel: parseFloat(item.Nivel) // Verifique se precisa dividir por 100 como antes
    };
  }).filter(m => !isNaN(m.nivel));

  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(parseInt(horaRef));

  const chaves = ["ref", "h4", "h8", "h12"];
  const offsets = [0, 4, 8, 12];
  const resultado = {};

  offsets.forEach((sub, i) => {
    const alvo = new Date(base);
    alvo.setHours(alvo.getHours() - sub);

    // Janela de busca (2h antes, 30min depois)
    const limitePassado = new Date(alvo.getTime() - (120 * 60000));
    const limiteFuturo = new Date(alvo.getTime() + (30 * 60000));

    const filtrados = medicoes.filter(m => 
      m.datetime >= limitePassado && m.datetime <= limiteFuturo
    );

    if (filtrados.length > 0) {
      // Pega o mais próximo do horário exato
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
  // A rota nova usa RangeIntervaloDeBusca=DIAS_30 para garantir que pegamos os dados recentes
  const url = `${ANA_BASE_URL}/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigoEstacao}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_30`;

  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!resp.ok) return null;

    const json = await resp.json();
    // O manual diz que os dados vêm no campo 'items'
    return processarMedicoesNovas(json.items, horaRef);
  } catch (err) {
    return null;
  }
}

// --- API ---

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  // 1. Pega estações do Supabase
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes || estacoes.length === 0) return NextResponse.json({});

  // 2. Obtém o Token ÚNICO para a sessão de busca
  const token = await obterToken();
  if (!token) {
    return NextResponse.json({ error: "Não foi possível autenticar na ANA" }, { status: 500 });
  }

  const resultados = {};

  // 3. Loop de processamento
  for (const estacao of estacoes) {
    const dados = await buscarDadosEstacao(token, estacao.codigo_estacao, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    }
    // Mantendo o delay de segurança
    await new Promise(r => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
