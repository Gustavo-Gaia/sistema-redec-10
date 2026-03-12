
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
    console.log("🚀 [ROBÔ] Iniciando ciclo de captura:", new Date().toLocaleString("pt-BR"));

    // 1. CARREGAR ESTAÇÕES ATIVAS (Mapeamento de segurança)
    const { data: estacoes, error: errorEst } = await supabase
      .from("estacoes")
      .select("id, fonte")
      .eq("ativo", true);

    if (errorEst) throw new Error("Erro ao consultar estações no banco.");

    // Usamos um Map para garantir consistência entre chaves numéricas e string
    const mapaFontes = new Map();
    estacoes?.forEach((e) => mapaFontes.set(Number(e.id), e.fonte || "COMDEC"));

    // 2. BUSCAR DADOS (ANA e INEA)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const resultados = await Promise.allSettled([
      fetch(`${baseUrl}/api/ana`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${baseUrl}/api/inea`, { cache: 'no-store' }).then(r => r.json())
    ]);

    // Consolidar medições (filtrando apenas as bem-sucedidas)
    const medicoes = resultados
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value || []);

    if (medicoes.length === 0) {
      return NextResponse.json({ status: "aviso", message: "Nenhum dado coletado." });
    }

    // 3. PROCESSAR E INSERIR
    let stats = { inseridos: 0, ignorados: 0, erros: 0 };

    for (const m of medicoes) {
      if (!m.estacao_id) continue;

      const idEstacao = Number(m.estacao_id);
      
      // A lógica de prioridade de fonte agora é estrita:
      // 1º: Fonte vinda da API | 2º: Fonte salva na tabela estações | 3º: Padrão 'COMDEC'
      const fonteFinal = m.fonte ?? mapaFontes.get(idEstacao) ?? "COMDEC";

      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: idEstacao,
          data_hora: `${m.data} ${m.hora}`,
          nivel: m.nivel,
          fonte: fonteFinal, // Nunca será null/undefined
          abaixo_regua: Boolean(m.abaixo_regua)
        });

      if (error) {
        error.code === "23505" ? stats.ignorados++ : stats.erros++;
      } else {
        stats.inseridos++;
      }
    }

    console.log(`✅ Ciclo finalizado. Stats:`, stats);
    return NextResponse.json({ status: "sucesso", ...stats });

  } catch (err) {
    console.error("🚨 Erro no Robô:", err.message);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
