/* app/api/ana/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseStringPromise } from "xml2js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function capturarANA(codigo, tentativas = 2) {
  // Função interna para formatar data DD/MM/YYYY
  const formatarDataBR = (data) => {
    const d = String(data.getDate()).padStart(2, '0');
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const y = data.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 5);

  const dataFim = formatarDataBR(hoje);
  const dataInicio = formatarDataBR(inicio);

  const url = `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${codigo}&dataInicio=${dataInicio}&dataFim=${dataFim}`;

  for (let i = 0; i < tentativas; i++) {
    try {
      const resp = await fetch(url, {
        method: 'GET',
        // O segredo do robô Python é o tempo de espera. 
        // Aqui usamos um sinal de aborto para não travar a função da Vercel
        signal: AbortSignal.timeout(15000), 
        next: { revalidate: 0 }
      });

      if (!resp.ok) continue;

      const xml = await resp.text();

      // Limpeza de Namespaces (Exatamente como você faz no Python com re.sub)
      const xmlLimpo = xml
        .replace(/<\/?\w+:/g, "<")
        .replace(/xmlns(:\w+)?="[^"]*"/g, "")
        .trim();

      const json = await parseStringPromise(xmlLimpo, { 
        explicitArray: false, 
        ignoreAttrs: true 
      });

      // ANA usa o termo "metereologicos" (com E)
      let registros = json?.NewDataSet?.DadosHidrometereologicos;

      if (!registros) {
        // Se for a última tentativa e não houver registros, retorna null
        if (i === tentativas - 1) return null;
        continue;
      }

      // Se vier só um registro, o parseStringPromise não cria array. Forçamos aqui.
      if (!Array.isArray(registros)) registros = [registros];

      const registrosValidos = [];

      registros.forEach((r) => {
        const dataHoraRaw = r.DataHora;
        const nivelRaw = r.Nivel;

        if (!dataHoraRaw || !nivelRaw || nivelRaw.trim() === "") return;

        // Converte "2024-03-12 10:00:00" para Date aceitável pelo JS
        const dt = new Date(dataHoraRaw.trim().replace(" ", "T"));
        const nivel = parseFloat(nivelRaw.replace(",", "."));

        if (!isNaN(dt.getTime()) && !isNaN(nivel)) {
          registrosValidos.push({ dt, nivel: nivel / 100 });
        }
      });

      if (registrosValidos.length === 0) continue;

      // Retorna o mais recente (Equivalente ao max do Python)
      const ultimo = registrosValidos.reduce((a, b) => (a.dt > b.dt ? a : b));

      return {
        data: ultimo.dt.toISOString().split("T")[0],
        hora: ultimo.dt.toTimeString().slice(0, 5),
        nivel: ultimo.nivel
      };

    } catch (err) {
      console.error(`Tentativa ${i+1} falhou para ${codigo}:`, err.message);
      if (i === tentativas - 1) return null;
      // Espera 1 segundo antes de tentar de novo (como o time.sleep do seu robô)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

export async function GET() {
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({ error: "Erro banco" }, { status: 500 });

  const resultados = [];

  // Na Vercel Free, vamos processar em pequenos lotes ou limitar
  // para não estourar os 10 segundos de execução.
  for (const estacao of estacoes) {
    const dados = await capturarANA(estacao.codigo_estacao);
    if (dados) {
      resultados.push({
        estacao_id: estacao.id,
        ...dados
      });
    }
  }

  return NextResponse.json(resultados);
}
