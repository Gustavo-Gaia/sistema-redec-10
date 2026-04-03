/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAuthToken() {
  try {
    const resp = await fetch(
      "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1",
      {
        headers: {
          'accept': '*/*',
          'Identificador': process.env.ANA_IDENTIFICADOR,
          'Senha': process.env.ANA_SENHA,
        },
        cache: "no-store",
      }
    );

    const json = await resp.json();
    return json?.items?.tokenautenticacao || null;
  } catch (err) {
    return null;
  }
}

async function processarEstacao(codigo, token, horaRef) {
  // 1. Garantir data correta no fuso de Brasília (independente do servidor)
  const agoraBr = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const dataBusca = agoraBr.toISOString().split('T')[0];

  // 2. URL com o parâmetro real descoberto no F12
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
              `?C%C3%B3digo%20da%20Esta%C3%A7%C3%A3o=${codigo}` +
              `&Tipo%20Filtro%20Data=DATA_LEITURA` +
              `&${encodeURIComponent('Data de Busca (yyyy-MM-dd)')}=${dataBusca}` + 
              `&Range%20Intervalo%20de%20busca=DIAS_2`;

  try {
    const resp = await fetch(url, {
      headers: { 
        'accept': '*/*',
        'Authorization': `Bearer ${token}` 
      },
      cache: "no-store",
    });

    if (!resp.ok) return null;

    const json = await resp.json();
    const items = json?.items || [];
    if (items.length === 0) return null;

    // Converte e limpa as medições
    const medicoes = items.map((m) => ({
      datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
      nivel: parseFloat(m.Cota_Adotada) / 100,
    })).filter(m => !isNaN(m.nivel));

    // Função auxiliar para extrair dados baseados em uma data específica
    const extrairParaData = (dataReferencia) => {
      const base = new Date(
        dataReferencia.getFullYear(),
        dataReferencia.getMonth(),
        dataReferencia.getDate(),
        parseInt(horaRef),
        0, 0, 0
      );

      const chaves = ["ref", "h4", "h8", "h12"];
      const blocos = {};

      [0, 4, 8, 12].forEach((sub, i) => {
        const alvo = new Date(base);
        alvo.setHours(alvo.getHours() - sub);
        
        // Janela de 120min para garantir captura mesmo com atraso na transmissão
        const limiteMinimo = new Date(alvo.getTime() - 60 * 60000);

        const filtrados = medicoes.filter(m => m.datetime <= alvo && m.datetime >= limiteMinimo);

        if (filtrados.length > 0) {
          filtrados.sort((a, b) => b.datetime - a.datetime);
          blocos[chaves[i]] = {
            nivel: filtrados[0].nivel,
            hora: filtrados[0].datetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
        } else {
          blocos[chaves[i]] = null;
        }
      });
      return blocos;
    };

    const ontemBr = new Date(agoraBr);
    ontemBr.setDate(ontemBr.getDate() - 1);

    return {
      hoje: extrairParaData(agoraBr),
      ontem: extrairParaData(ontemBr)
    };

  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "Erro na autenticação com a ANA" }, { status: 401 });

  const { data: estacoes, error } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (error || !estacoes) return NextResponse.json({ error: "Erro ao buscar estações no banco" }, { status: 500 });

  const resultados = {};

  // Processamento sequencial para não sobrecarregar a API da ANA
  for (const estacao of estacoes) {
    const dados = await processarEstacao(
      estacao.codigo_estacao,
      token,
      horaRef
    );

    if (dados) {
      resultados[estacao.id] = dados;
    }

    // Delay de segurança entre requisições
    await new Promise(r => setTimeout(r, 300));
  }

  return NextResponse.json(resultados);
}
