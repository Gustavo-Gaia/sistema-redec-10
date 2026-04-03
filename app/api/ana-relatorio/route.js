export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAuthToken() {
  console.log("--- INICIANDO AUTENTICAÇÃO ANA ---");
  try {
    const resp = await fetch(
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1",
      {
        headers: {
          Identificador: process.env.ANA_IDENTIFICADOR,
          Senha: process.env.ANA_SENHA,
        },
        cache: "no-store",
      }
    );

    if (!resp.ok) {
      console.error(`❌ Erro HTTP na Autenticação: ${resp.status}`);
      return null;
    }

    const json = await resp.json();
    const token = json?.items?.tokenautenticacao;

    if (!token) {
      console.error("❌ Resposta da ANA não continha o campo 'tokenautenticacao':", json);
      return null;
    }

    console.log("✅ Token obtido com sucesso!");
    return token;
  } catch (err) {
    console.error("❌ Falha crítica ao pedir token:", err.message);
    return null;
  }
}

async function processarEstacao(codigo, token, horaRef) {
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_30`;

  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!resp.ok) {
      console.warn(`⚠️ Estação ${codigo}: Erro HTTP ${resp.status}`);
      return null;
    }

    const json = await resp.json();
    const items = json?.items || [];

    if (items.length === 0) {
      console.warn(`⚠️ Estação ${codigo}: Retornou lista de itens vazia.`);
      return null;
    }

    // Diagnóstico de formato de data
    console.log(`🔎 Exemplo de dado bruto da estação ${codigo}:`, items[0]);

    const medicoes = items.map((m) => {
      // Tentativa de conversão robusta
      const dataStr = m.Data_Hora_Medicao ? m.Data_Hora_Medicao.replace(" ", "T") : null;
      const dt = new Date(dataStr);
      
      return {
        datetime: dt,
        nivel: parseFloat(m.Cota_Adotada) / 100,
      };
    }).filter((m) => !isNaN(m.nivel) && m.datetime.toString() !== "Invalid Date");

    if (medicoes.length === 0) {
      console.error(`❌ Estação ${codigo}: Falha ao processar datas/níveis dos itens.`);
      return null;
    }

    // ... (Lógica de filtragem por horário permanece igual)
    const base = new Date();
    base.setMinutes(0, 0, 0);
    base.setHours(parseInt(horaRef));
    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      const filtrados = medicoes.filter(m => m.datetime <= alvo && m.datetime >= new Date(alvo.getTime() - 180 * 60000));
      filtrados.sort((a, b) => b.datetime - a.datetime);
      const m = filtrados[0];
      resultado[chaves[i]] = m ? { nivel: m.nivel, hora: m.datetime.toTimeString().slice(0, 5) } : null;
    });

    return resultado;
  } catch (err) {
    console.error(`❌ Erro no processamento da estação ${codigo}:`, err.message);
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
