export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAuthToken() {
  console.log("--- TESTE DE VARIÁVEIS ---");
  
  const idTest = process.env.ANA_IDENTIFICADOR;
  const pwTest = process.env.ANA_SENHA;

  if (!idTest || !pwTest) {
    console.error("❌ ERRO: A Vercel não está lendo as variáveis ANA_IDENTIFICADOR ou ANA_SENHA.");
    return null; 
  }

  try {
    const resp = await fetch(
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1",
      {
        headers: {
          // Teste forçar os headers como String para garantir
          'Identificador': String(idTest).trim(),
          'Senha': String(pwTest).trim(),
        },
        cache: "no-store",
      }
    );

    const json = await resp.json();
    console.log("Resposta bruta da ANA:", json);
    
    return json?.items?.tokenautenticacao || null;
  } catch (err) {
    console.error("Erro na chamada Fetch:", err);
    return null;
  }
}
async function processarEstacao(codigo, token, horaRef) {
  // Aumentamos para DIAS_30 para garantir que pegamos qualquer dado existente
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_30`;

  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json?.items || [];

    if (items.length === 0) return null;

    const medicoes = items.map((m) => {
      // 1. Tenta tratar a data de várias formas (ISO, Espaço, ou Local)
      let dataBruta = m.Data_Hora_Medicao || m.DataLeitura; // Tenta os dois nomes possíveis
      if (!dataBruta) return { nivel: NaN };

      const dataTratada = dataBruta.includes(" ") ? dataBruta.replace(" ", "T") : dataBruta;
      const dt = new Date(dataTratada);

      // 2. Tenta pegar o nível de diferentes campos possíveis na API nova
      const nivelBruto = m.Cota_Adotada ?? m.Cota ?? m.Nivel;
      
      return {
        datetime: dt,
        nivel: parseFloat(nivelBruto) / 100, // Converte cm para metros
      };
    }).filter((m) => !isNaN(m.nivel) && m.datetime.toString() !== "Invalid Date");

    if (medicoes.length === 0) return null;

    // Lógica de horários alvo
    const base = new Date();
    base.setMinutes(0, 0, 0);
    base.setHours(parseInt(horaRef));

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      
      // Janela de busca de 4 horas para garantir que ache o dado mais próximo
      const m = getValorAteHorario(medicoes, alvo);
      
      resultado[chaves[i]] = m ? {
        nivel: m.nivel,
        hora: m.datetime.toTimeString().slice(0, 5),
      } : null;
    });

    return resultado;
  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ debug: "Falha na geração do Token. Verifique CNPJ/Senha nas variáveis de ambiente." });
  }

  const { data: estacoes, error: dbError } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (dbError) {
    return NextResponse.json({ debug: "Erro ao ler Supabase", error: dbError });
  }

  if (!estacoes || estacoes.length === 0) {
    return NextResponse.json({ debug: "Nenhuma estação encontrada no Supabase com fonte 'ANA' e 'ativo=true'." });
  }

  const resultados = {};
  const logs = [];

  for (const estacao of estacoes) {
    const dados = await processarEstacao(estacao.codigo_estacao, token, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    } else {
      logs.push(`Estação ${estacao.codigo_estacao} falhou ou não tem dados recentes.`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // Se o resultado for vazio, retornamos um objeto de debug para você ver no navegador
  if (Object.keys(resultados).length === 0) {
    return NextResponse.json({
      debug: "A busca foi concluída, mas nenhum dado válido foi processado.",
      detalhes: logs,
      total_estacoes_tentadas: estacoes.length
    });
  }

  return NextResponse.json(resultados);
}
