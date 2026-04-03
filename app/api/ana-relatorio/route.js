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
    // O token JWT necessário é o 'tokenautenticacao'
    return json?.items?.tokenautenticacao || null;
  } catch (err) {
    return null;
  }
}

async function processarEstacao(codigo, token, horaRef) {
  // Range de 3 dias para garantir a captura de dados de ontem (h12/h24)
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
              `?C%C3%B3digo%20da%20Esta%C3%A7%C3%A3o=${codigo}` +
              `&Tipo%20Filtro%20Data=DATA_LEITURA` +
              `&Range%20Intervalo%20de%20busca=DIAS_3`;

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

    // Converte os dados da ANA para objetos Date do JS
    const medicoes = items.map((m) => ({
      datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
      nivel: parseFloat(m.Cota_Adotada) / 100, 
    })).filter(m => !isNaN(m.nivel));

    // --- LÓGICA DE DIA FIXO ---
    // Criamos a base sempre no dia de hoje, na hora que você digitou
    const hoje = new Date();
    let base = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      parseInt(horaRef),
      0, 0, 0
    );

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    // Loop para calcular os 4 horários (de 4 em 4 horas para trás)
    for (let i = 0; i < 4; i++) {
      const alvo = new Date(base.getTime());
      
      // Tolerância de 60 minutos (busca dados entre alvo-1h e alvo)
      const limiteMinimo = new Date(alvo.getTime() - 60 * 60000);
      
      const filtrados = medicoes.filter(m => 
        m.datetime <= alvo && m.datetime >= limiteMinimo
      );
      
      if (filtrados.length > 0) {
        // Ordena para pegar o mais próximo do horário exato (o mais recente daquela janela)
        filtrados.sort((a, b) => b.datetime - a.datetime);
        const m = filtrados[0];
        resultado[chaves[i]] = {
          nivel: m.nivel,
          hora: m.datetime.toTimeString().slice(0, 5)
        };
      } else {
        resultado[chaves[i]] = null;
      }

      // Subtrai 4 horas da base para o próximo ciclo do loop
      // O objeto Date do JS retrocede o dia automaticamente se passar de 00h
      base.setHours(base.getHours() - 4);
    }

    return resultado;
  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ debug: "Erro de autenticação com a ANA" });

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes || estacoes.length === 0) return NextResponse.json({});

  const resultados = {};

  // Processamento sequencial com pequeno intervalo para evitar bloqueio da API
  for (const estacao of estacoes) {
    const dados = await processarEstacao(estacao.codigo_estacao, token, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  return NextResponse.json(resultados);
}
