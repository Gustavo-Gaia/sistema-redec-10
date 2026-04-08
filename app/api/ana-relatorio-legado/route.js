export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function formatarData(d) {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// ============================
// PARSE XML (VERSÃO REFEITA)
// ============================
function parseXML(xml) {
  // Dividimos pelo fechamento da tag para garantir que cada "pedaço" tenha os dados
  const blocos = xml.split("</DadosHidrometereologicos>");
  const medicoes = [];

  for (const bloco of blocos) {
    if (!bloco.includes("<DataHora>")) continue;

    try {
      // Extração manual mais robusta que o .match global
      const dataHora = bloco.split("<DataHora>")[1].split("</DataHora>")[0].trim();
      const nivelStr = bloco.split("<Nivel>")[1].split("</Nivel>")[0].trim();
      const nivel = parseFloat(nivelStr);

      if (dataHora && !isNaN(nivel)) {
        // Criamos o objeto de data. Ex: 2026-04-08T12:00:00
        const dt = new Date(dataHora.replace(" ", "T"));
        
        medicoes.push({
          datetime: dt,
          nivel: nivel / 100
        });
      }
    } catch (e) {
      continue; // Pula blocos malformados
    }
  }
  return medicoes;
}

// ============================
// EXTRAIR BLOCOS (JANELAS)
// ============================
function extrairBlocos(medicoes, horaRef, dataBase) {
  const resultado = {};
  const chaves = ["ref", "h4", "h8", "h12"];
  const atrasos = [0, 4, 8, 12];

  // Criamos a base (ex: 08:00:00)
  const base = new Date(dataBase);
  base.setHours(parseInt(horaRef), 0, 0, 0);

  atrasos.forEach((horasAtras, i) => {
    const alvo = new Date(base.getTime());
    alvo.setHours(alvo.getHours() - horasAtras);

    const inicioJanela = new Date(alvo.getTime() - (60 * 60000)); // 1 hora antes

    // Filtro: encontrar medições que encaixam na janela
    const naJanela = medicoes.filter(m => 
      m.datetime.getTime() > inicioJanela.getTime() && 
      m.datetime.getTime() <= alvo.getTime()
    );

    if (naJanela.length > 0) {
      // Pegar a mais recente da janela
      naJanela.sort((a, b) => b.datetime - a.datetime);
      const m = naJanela[0];
      resultado[chaves[i]] = {
        nivel: m.nivel.toFixed(2),
        hora: m.datetime.getHours().toString().padStart(2, "0") + ":" + 
              m.datetime.getMinutes().toString().padStart(2, "0")
      };
    } else {
      resultado[chaves[i]] = null;
    }
  });

  return resultado;
}

async function processarEstacao(codigo, horaRef) {
  const agora = new Date();
  
  // Define se a base é hoje ou ontem
  let dataBase = new Date(agora);
  if (parseInt(horaRef) > agora.getHours()) {
    dataBase.setDate(agora.getDate() - 1);
  }

  // Busca dados de 3 dias para ter margem
  const inicio = new Date(dataBase);
  inicio.setDate(dataBase.getDate() - 3);

  const url = `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${codigo}&dataInicio=${formatarData(inicio)}&dataFim=${formatarData(agora)}`;

  try {
    const resp = await fetch(url, { cache: "no-store" });
    const xml = await resp.text();
    const medicoes = parseXML(xml);

    if (medicoes.length === 0) return null;

    return { hoje: extrairBlocos(medicoes, horaRef, dataBase) };
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

  const resultados = {};
  for (const estacao of estacoes) {
    const dados = await processarEstacao(estacao.codigo_estacao, horaRef);
    if (dados) resultados[estacao.id] = dados;
    await new Promise(r => setTimeout(r, 150));
  }

  return NextResponse.json(resultados);
}
