
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
    console.log("🚀 [ROBÔ] Iniciando ciclo de captura automática...");

    // 1. CARREGAR ESTAÇÕES ATIVAS PARA O MAPA DE SEGURANÇA
    const { data: estacoes, error: errorEst } = await supabase
      .from("estacoes")
      .select("id, fonte")
      .eq("ativo", true);

    if (errorEst) throw new Error("Falha ao acessar tabela de estações");

    // Criamos um mapa de fontes: { "101": "ANA", "102": "INEA" }
    const mapaFontes = {};
    estacoes.forEach((e) => {
      mapaFontes[String(e.id)] = e.fonte;
    });

    // 2. EXECUTAR CAPTURAS EM PARALELO (Otimização de tempo)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    let medicoesColetadas = [];

    try {
      const [dadosAna, dadosInea] = await Promise.all([
        fetch(`${baseUrl}/api/ana`, { cache: 'no-store' }).then(res => res.json()).catch(() => []),
        fetch(`${baseUrl}/api/inea`, { cache: 'no-store' }).then(res => res.json()).catch(() => [])
      ]);

      medicoesColetadas = [...dadosAna, ...dadosInea];
    } catch (e) {
      console.log("⚠️ Erro ao chamar APIs internas:", e.message);
    }

    if (medicoesColetadas.length === 0) {
      return NextResponse.json({ status: "vazio", message: "Nenhum dado novo nas APIs" });
    }

    console.log(`📊 Processando ${medicoesColetadas.length} potenciais medições...`);

    let inseridos = 0;
    let ignorados = 0;
    let erros = 0;

    // 3. LOOP DE SALVAMENTO NO BANCO
    for (const m of medicoesColetadas) {
      if (!m.estacao_id) continue;

      const dataHoraStr = `${m.data} ${m.hora}`;
      
      // LÓGICA ANTI-NULL: 
      // Tenta m.fonte (vinda da API) -> Tenta mapaFontes (vinda do banco) -> Fallback "SISTEMA"
      const fonteFinal = m.fonte || mapaFontes[String(m.estacao_id)] || "COMDEC";

      const { error: errorInsert } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: parseInt(m.estacao_id),
          data_hora: dataHoraStr,
          nivel: m.nivel,
          fonte: fonteFinal, 
          abaixo_regua: m.abaixo_regua || false
        });

      if (errorInsert) {
        if (errorInsert.code === "23505") {
          // Registro já existe (Unique Constraint: estacao_id + data_hora)
          ignorados++;
        } else {
          console.log(`❌ Erro na estação ${m.estacao_id}:`, errorInsert.message);
          erros++;
        }
      } else {
        inseridos++;
      }
    }

    // 4. ATUALIZAR STATUS (Opcional: Você pode adicionar aqui a chamada para o seu Form do Google se desejar)

    console.log(`✅ Ciclo finalizado: ${inseridos} novos, ${ignorados} duplicados, ${erros} erros.`);

    return NextResponse.json({
      status: "sucesso",
      estatisticas: {
        total_processado: medicoesColetadas.length,
        inseridos,
        ignorados,
        erros
      }
    });

  } catch (err) {
    console.error("🚨 Erro Crítico no Robô:", err.message);
    return NextResponse.json({ error: "Erro interno no processamento" }, { status: 500 });
  }
}
