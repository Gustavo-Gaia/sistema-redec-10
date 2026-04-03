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
    const resp = await fetch("https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1", {
      headers: { 
        'accept': '*/*', 
        'Identificador': process.env.ANA_IDENTIFICADOR, 
        'Senha': process.env.ANA_SENHA 
      },
      cache: "no-store",
    });
    const json = await resp.json();
    return json?.items?.tokenautenticacao || null;
  } catch (err) { return null; }
}

async function processarEstacao(codigo, token, horaRef) {
  // Buscamos um range maior para garantir que o JSON tenha os dois dias
  const url = `https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1` +
              `?C%C3%B3digo%20da%20Esta%C3%A7%C3%A3o=${codigo}` +
              `&Tipo%20Filtro%20Data=DATA_LEITURA` +
              `&Range%20Intervalo%20de%20busca=DIAS_3`;

  try {
    const resp = await fetch(url, {
      headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` },
      cache: "no-store",
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const items = json?.items || [];
    if (items.length === 0) return null;

    // Criamos a base de hoje (ex: 03/04/2026 04:00)
    const agora = new Date();
    const baseHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), parseInt(horaRef), 0, 0);

    const chaves = ["ref", "h4", "h8", "h12"];
    const resultado = {};

    [0, 4, 8, 12].forEach((sub, i) => {
      // Cálculo exato do alvo
      const alvo = new Date(baseHoje.getTime());
      alvo.setHours(alvo.getHours() - sub);

      // Criamos strings de busca para comparar texto (mais seguro que objeto Date para o 'ontem')
      const diaBusca = String(alvo.getDate()).padStart(2, '0');
      const mesBusca = String(alvo.getMonth() + 1).padStart(2, '0');
      const anoBusca = alvo.getFullYear();
      const horaBusca = String(alvo.getHours()).padStart(2, '0');
      
      // Formato esperado no JSON da ANA: "DD/MM/YYYY HH:"
      const prefixoBusca = `${diaBusca}/${mesBusca}/${anoBusca} ${horaBusca}:`;

      // Filtramos no JSON os itens que batem com esse dia e essa hora específica
      const filtrados = items.filter(m => m.Data_Hora_Medicao.startsWith(prefixoBusca));

      if (filtrados.length > 0) {
        // Ordenamos por Data_Hora_Medicao para pegar o minuto mais alto (mais próximo da hora cheia)
        filtrados.sort((a, b) => b.Data_Hora_Medicao.localeCompare(a.Data_Hora_Medicao));
        
        const m = filtrados[0];
        resultado[chaves[i]] = {
          nivel: parseFloat(m.Cota_Adotada) / 100,
          hora: m.Data_Hora_Medicao.split(' ')[1].substring(0, 5)
        };
      } else {
        // Se falhou por texto, fazemos uma última tentativa via objeto Date (fallback)
        const alvoTime = alvo.getTime();
        const margem = 60 * 60 * 1000;
        
        const fallback = items.find(m => {
          const mDate = new Date(m.Data_Hora_Medicao.replace(" ", "T")).getTime();
          return mDate <= alvoTime && mDate >= (alvoTime - margem);
        });

        if (fallback) {
          resultado[chaves[i]] = {
            nivel: parseFloat(fallback.Cota_Adotada) / 100,
            hora: fallback.Data_Hora_Medicao.split(' ')[1].substring(0, 5)
          };
        } else {
          resultado[chaves[i]] = null;
        }
      }
    });

    return resultado;
  } catch (err) { return null; }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const horaRef = searchParams.get("hora") || "08";

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ debug: "Erro Token" });

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id, codigo_estacao")
    .eq("fonte", "ANA")
    .eq("ativo", true);

  if (!estacoes) return NextResponse.json({});

  const resultados = {};
  for (const estacao of estacoes) {
    const dados = await processarEstacao(estacao.codigo_estacao, token, horaRef);
    if (dados) { resultados[estacao.id] = dados; }
    await new Promise(r => setTimeout(r, 150));
  }

  return NextResponse.json(resultados);
}
