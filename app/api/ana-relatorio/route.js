export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

let globalToken = null;
let globalTokenExp = 0;

// ============================
// DIAGNÓSTICO DE AUTENTICAÇÃO
// ============================
async function getAuthToken() {
  const agora = Date.now();
  if (globalToken && agora < globalTokenExp) return { token: globalToken, cached: true };

  try {
    const resp = await fetch("https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1", {
      method: "GET",
      headers: {
        "Identificador": String(process.env.ANA_IDENTIFICADOR).trim(),
        "Senha": String(process.env.ANA_SENHA).trim(),
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    const json = await resp.json();

    if (!resp.ok || !json?.items?.tokenautenticacao) {
      return { 
        error: true, 
        status: resp.status, 
        resposta_ana: json, 
        config_env: { id: !!process.env.ANA_IDENTIFICADOR, senha: !!process.env.ANA_SENHA }
      };
    }

    globalToken = json.items.tokenautenticacao;
    globalTokenExp = agora + (50 * 60 * 1000);
    return { token: globalToken, cached: false };
  } catch (err) {
    return { error: true, msg: err.message };
  }
}

async function processarEstacao(codigo, horaRef, token) {
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1?CodigoDaEstacao=${codigo}&TipoFiltroData=DATA_LEITURA&RangeIntervaloDeBusca=DIAS_7`;

  try {
    const resp = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      cache: "no-store"
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json?.items || [];
    
    const medicoes = items.map(m => ({
      datetime: new Date(m.Data_Hora_Medicao.replace(" ", "T")),
      nivel: parseFloat(m.Cota_Adotada || m.Cota) / 100
    })).filter(m => !isNaN(m.nivel));

    if (medicoes.length === 0) return null;

    const base = new Date();
    base.setHours(parseInt(horaRef), 0, 0, 0);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      const alvo = new Date(base);
      alvo.setHours(alvo.getHours() - sub);
      const m = medicoes.filter(med => med.datetime <= alvo && med.datetime >= new Date(alvo.getTime() - 180 * 60000))
                        .sort((a, b) => b.datetime - a.datetime)[0];
      resultado[chaves[i]] = m ? { nivel: m.nivel, hora: m.datetime.toTimeString().slice(0, 5) } : null;
    });

    return resultado;
  } catch (err) { return null; }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const auth = await getAuthToken();
  if (auth.error) {
    return NextResponse.json({ diagnostico: "Falha na Autenticação", detalhes: auth }, { status: 401 });
  }

  // Busca no Supabase
  const { data: estacoes, error: dbError } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao, fonte, ativo")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (dbError) return NextResponse.json({ erro_banco: dbError });

  // --- TESTE DE QUANTIDADE ---
  if (!estacoes || estacoes.length === 0) {
    return NextResponse.json({ 
      aviso: "O banco de dados retornou zero estações",
      causa: "Verifique se a coluna 'fonte' no Supabase está como 'ANA' (maiúsculo) e 'ativo' está marcado.",
      sql_tentado: "fonte = ANA AND ativo = true"
    });
  }

  const resultados = {};
  for (let i = 0; i < estacoes.length; i += 5) {
    const grupo = estacoes.slice(i, i + 5);
    await Promise.all(grupo.map(async (e) => {
      const dados = await processarEstacao(e.codigo_estacao, horaRef, auth.token);
      if (dados) {
        resultados[e.id] = dados;
      }
    }));
    await new Promise(r => setTimeout(r, 300));
  }

  // Se após processar tudo continuar vazio, avisamos que a ANA não tinha dados
  if (Object.keys(resultados).length === 0) {
     return NextResponse.json({
       aviso: "Estações encontradas no banco, mas a ANA não retornou medições para elas.",
       estacoes_consultadas: estacoes.map(e => e.codigo_estacao),
       periodo: "Últimos 7 dias"
     });
  }

  return NextResponse.json(resultados);
}
