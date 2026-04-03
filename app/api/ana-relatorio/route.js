export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ANA_BASE_URL = "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas";
const IDENTIFICADOR = process.env.ANA_IDENTIFICADOR;
const SENHA = process.env.ANA_SENHA;

// 1. OBTENÇÃO DO TOKEN (Página 13 do Manual)
async function obterToken() {
  try {
    const resp = await fetch(`${ANA_BASE_URL}/OAUth/v1`, {
      method: 'GET',
      headers: {
        'Identificador': IDENTIFICADOR,
        'Senha': SENHA
      },
      cache: 'no-store'
    });

    const data = await resp.json();
    return data.items?.tokenautenticacao || null;
  } catch (err) {
    console.error("Erro ao obter Token:", err);
    return null;
  }
}

// 2. FILTRAGEM DE HORÁRIOS (Lógica que você prefere)
function getValorAteHorario(lista, alvo) {
  const limitePassado = new Date(alvo.getTime() - 120 * 60000); // 2h de tolerância
  
  const filtrados = lista.filter(m => 
    m.datetime <= alvo && m.datetime >= limitePassado
  );

  if (filtrados.length === 0) return null;

  // Ordena para pegar o mais próximo do alvo (o mais recente dentro da janela)
  filtrados.sort((a, b) => b.datetime - a.datetime);
  return filtrados[0];
}

// 3. BUSCA DE DADOS NA API NOVA (Página 7 e 10 do Manual)
async function processarEstacao(token, codigo, horaRef) {
  // A nova API usa este endpoint para telemetria adotada
  const url = `${ANA_BASE_URL}/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_30`;

  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json.items || [];

    // Converte os campos da API nova: Data_Hora_Medicao e Cota_Adotada
    const medicoes = items.map(item => ({
      datetime: new Date(item.Data_Hora_Medicao.replace(" ", "T")),
      nivel: parseFloat(item.Cota_Adotada) / 100 // Converte cm para metros
    })).filter(m => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

    // Gerar horários alvo (Ref, -4h, -8h, -12h)
    const base = new Date();
    base.setMinutes(0, 0, 0);
    base.setHours(parseInt(horaRef));

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      
      const m = getValorAteHorario(medicoes, alvo);
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

// 4. ROUTE HANDLER PRINCIPAL
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  // Busca estações do Supabase
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes || estacoes.length === 0) return NextResponse.json({});

  // Pede o token uma única vez para todas as estações
  const token = await obterToken();
  if (!token) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const resultados = {};

  for (const estacao of estacoes) {
    const dados = await processarEstacao(token, estacao.codigo_estacao, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    }
    // Pequena pausa para evitar bloqueio de IP pela ANA
    await new Promise(r => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
