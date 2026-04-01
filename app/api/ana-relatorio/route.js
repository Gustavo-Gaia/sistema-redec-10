/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Auxiliar para formatar data padrão ANA (DD/MM/AAAA)
function formatarDataANA(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// Lógica para extrair TODAS as medições do XML e filtrar por hora
async function processarRelatorioANA(codigo, horaRef) {
  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 2); // 2 dias são suficientes e mais rápidos

  const url = `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${codigo}&dataInicio=${formatarDataANA(inicio)}&dataFim=${formatarDataANA(hoje)}`;

  try {
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" });
    if (!resp.ok) return null;
    const xml = await resp.text();

    // 1. Criar array com os 4 alvos de horas (Ex: 08, 04, 00, 20)
    const hRef = parseInt(horaRef);
    const alvos = [0, 4, 8, 12].map(sub => {
        let h = hRef - sub;
        return (h < 0 ? h + 24 : h).toString().padStart(2, '0') + ":00";
    });

    // 2. Extrair todas as medições usando Match Global
    const regex = /<DataHora>(.*?)<\/DataHora>[\s\S]*?<Nivel>(.*?)<\/Nivel>/g;
    let matches;
    const todasMedicoes = [];

    while ((matches = regex.exec(xml)) !== null) {
      todasMedicoes.push({
        hora: matches[1].trim().split(" ")[1].slice(0, 5), // Pega só "HH:MM"
        nivel: parseFloat(matches[2]) / 100
      });
    }

    // 3. Para cada alvo, achar a medição mais próxima
    // Retornamos um objeto formatado para a tabela
    const resultado = {};
    const chaves = ["ref", "h4", "h8", "h12"];

    alvos.forEach((alvo, index) => {
      // Filtra medições que estejam dentro de uma janela de 60min do alvo
      const alvoMinutos = parseInt(alvo.split(":")[0]) * 60;
      
      let melhorMedicao = null;
      let menorDiferenca = Infinity;

      todasMedicoes.forEach(m => {
        const mMinutos = parseInt(m.hora.split(":")[0]) * 60 + parseInt(m.hora.split(":")[1]);
        const diferenca = Math.abs(alvoMinutos - mMinutos);

        if (diferenca <= 60 && diferenca < menorDiferenca) {
          menorDiferenca = diferenca;
          melhorMedicao = m.nivel;
        }
      });

      resultado[chaves[index]] = melhorMedicao;
    });

    return resultado;

  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultadosTotal = {};

  // Processa as estações
  for (const estacao of estacoes) {
    const dadosQuadruplos = await processarRelatorioANA(estacao.codigo_estacao, horaRef);
    if (dadosQuadruplos) {
      resultadosTotal[estacao.id] = dadosQuadruplos;
    }
  }

  return NextResponse.json(resultadosTotal);
}
