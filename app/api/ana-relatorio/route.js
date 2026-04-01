/* app/api/ana-relatorio/route.js */

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ==========================================
// FORMATAR DATA PARA PADRÃO ANA (DD/MM/AAAA)
// ==========================================
function formatarDataANA(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ==========================================
// GERAR HORÁRIOS ALVO (REF, -4h, -8h, -12h)
// ==========================================
function gerarHorariosAlvo(horaRef) {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(parseInt(horaRef));

  return [0, 4, 8, 12].map((sub) => {
    const d = new Date(base);
    d.setHours(d.getHours() - sub);
    return d;
  });
}

// ==========================================
// EXTRAIR MEDIÇÕES DO XML (COM CORREÇÃO DE DATA)
// ==========================================
function extrairMedicoes(xml) {
  const regex = /<DataHora>(.*?)<\/DataHora>[\s\S]*?<Nivel>(.*?)<\/Nivel>/g;
  let match;
  const lista = [];

  while ((match = regex.exec(xml)) !== null) {
    const dataHoraStr = match[1].trim(); 
    const nivel = parseFloat(match[2]);

    if (!dataHoraStr || isNaN(nivel)) continue;

    // Correção de Fuso: Transforma "01/04/2026 20:00:00" em um Date objeto real
    // Isso evita que a Vercel mude o horário por estar em servidor internacional
    const [dataPart, horaPart] = dataHoraStr.split(" ");
    const [dia, mes, ano] = dataPart.split("/");
    const dt = new Date(`${ano}-${mes}-${dia}T${horaPart}`);

    lista.push({
      datetime: dt,
      nivel: nivel / 100 // Converte para metros
    });
  }
  return lista;
}

// ==========================================
// BUSCA VALOR COM JANELA RIGOROSA (2 HORAS)
// ==========================================
function getValorAteHorario(lista, alvo) {
  // Janela: Só aceitamos dados de até 2h antes do alvo até 30min depois
  // Se o alvo é 08:00, aceitamos medições entre 06:00 e 08:30
  const limitePassado = new Date(alvo.getTime() - (120 * 60000)); 
  const limiteFuturo = new Date(alvo.getTime() + (30 * 60000));

  const filtrados = lista.filter(m => 
    m.datetime >= limitePassado && 
    m.datetime <= limiteFuturo
  );

  if (filtrados.length === 0) return null;

  // Ordena para pegar o que estiver MAIS PERTO do horário exato do alvo
  filtrados.sort((a, b) => {
    const diffA = Math.abs(a.datetime.getTime() - alvo.getTime());
    const diffB = Math.abs(b.datetime.getTime() - alvo.getTime());
    return diffA - diffB;
  });

  return filtrados[0];
}

// ==========================================
// PROCESSAR CADA ESTAÇÃO INDIVIDUALMENTE
// ==========================================
async function processarEstacao(codigo, horaRef) {
  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 3); // 3 dias de margem para o histórico

  const url = `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${codigo}&dataInicio=${formatarDataANA(inicio)}&dataFim=${formatarDataANA(hoje)}`;

  try {
    const resp = await fetch(url, { 
      headers: { "User-Agent": "Mozilla/5.0" }, 
      cache: "no-store" 
    });
    
    if (!resp.ok) return null;
    
    const xml = await resp.text();
    const medicoes = extrairMedicoes(xml);
    
    if (medicoes.length === 0) return null;

    const horarios = gerarHorariosAlvo(horaRef);
    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    horarios.forEach((alvo, i) => {
      const m = getValorAteHorario(medicoes, alvo);
      resultado[chaves[i]] = m ? { 
        nivel: m.nivel, 
        hora: m.datetime.toTimeString().slice(0, 5) 
      } : null;
    });

    return resultado;
  } catch (err) {
    console.error(`Erro na estação ${codigo}:`, err);
    return null;
  }
}

// ==========================================
// ROTA PRINCIPAL (GET)
// ==========================================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  // Busca estações da ANA no banco
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes || estacoes.length === 0) return NextResponse.json({});

  const resultados = {};

  // Executa as estações em sequência para evitar bloqueio da ANA
  for (const estacao of estacoes) {
    const dados = await processarEstacao(estacao.codigo_estacao, horaRef);
    if (dados) {
      resultados[estacao.id] = dados;
    }
  }

  return NextResponse.json(resultados);
}
