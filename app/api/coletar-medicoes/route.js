
/* captura automática de medições - usado pelo cron */

/* app/api/coletar-medicoes/route.js */
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    console.log("🚀 Iniciando coleta automática...");

    // 1. CARREGAR ESTAÇÕES E CRIAR MAPA DE FONTES
    const { data: estacoes, error: errorEst } = await supabase
      .from("estacoes")
      .select("id, fonte")
      .eq("ativo", true);

    if (errorEst) throw new Error("Erro ao carregar estações do banco");

    // Criamos o mapa garantindo que a chave seja String para evitar erro de busca
    const mapaFontes = {};
    estacoes.forEach((e) => {
      mapaFontes[String(e.id)] = e.fonte;
    });

    // 2. BUSCAR MEDIÇÕES NAS APIS (ANA e INEA)
    // Dica: Use Promise.all para ganhar velocidade
    let medicoes = [];
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    try {
      const [respAna, respInea] = await Promise.all([
        fetch(`${baseUrl}/api/ana`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
        fetch(`${baseUrl}/api/inea`, { cache: 'no-store' }).then(r => r.json()).catch(() => [])
      ]);
      
      medicoes = [...respAna, ...respInea];
    } catch (e) {
      console.log("⚠️ Falha ao obter dados das APIs:", e.message);
    }

    console.log(`📊 Total de medições recebidas para processar: ${medicoes.length}`);

    let inseridos = 0;
    let ignorados = 0;

    // 3. SALVAR MEDIÇÕES
    for (const m of medicoes) {
      if (!m.estacao_id) continue;

      const dataHora = `${m.data} ${m.hora}`;
      
      // Busca a fonte no mapa usando o ID convertido para string
      // Se não encontrar no mapa, usa a fonte vinda da API ou 'SISTEMA' como último recurso
      const fonteFinal = mapaFontes[String(m.estacao_id)] || m.fonte || "SISTEMA";

      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: dataHora,
          nivel: m.nivel,
          fonte: fonteFinal, // Agora garantido que não será NULL
          abaixo_regua: m.abaixo_regua || false
        });

      if (error) {
        if (error.code === "23505") { // Erro de duplicidade (Unique Constraint)
          ignorados++;
        } else {
          console.log(`❌ Erro ID ${m.estacao_id}:`, error.message);
        }
      } else {
        inseridos++;
      }
    }

    console.log(`✅ Ciclo Finalizado. Inseridos: ${inseridos} | Ignorados: ${ignorados}`);

    return NextResponse.json({ status: "ok", inseridos, ignorados });

  } catch (err) {
    console.log("🚨 Erro Crítico no Robô:", err.message);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
