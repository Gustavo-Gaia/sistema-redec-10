
/* captura automática de medições - usado pelo cron */

/* app/api/coletar-medicoes/route.js */
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
    console.log("🚀 [ROBÔ] Iniciando coleta direta por origem...");

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // 1. BUSCAR DADOS DE AMBAS AS FONTES
    // Usamos Promis.all para disparar as duas buscas simultaneamente
    const [dadosAna, dadosInea] = await Promise.all([
      fetch(`${baseUrl}/api/ana`).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/api/inea`).then(r => r.json()).catch(() => [])
    ]);

    // 2. ADICIONAR MARCADOR DE FONTE PARA CADA ORIGEM
    const medicoes = [
      ...dadosAna.map(m => ({ ...m, fonte: "ANA" })),
      ...dadosInea.map(m => ({ ...m, fonte: "INEA" }))
    ];

    if (medicoes.length === 0) {
      return NextResponse.json({ status: "vazio", message: "Nenhum dado retornado pelas APIs" });
    }

    let inseridos = 0;
    let ignorados = 0;

    // 3. INSERÇÃO NO BANCO
    for (const m of medicoes) {
      if (!m.estacao_id) continue;

      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: `${m.data} ${m.hora}`,
          nivel: m.nivel,
          fonte: m.fonte, // Agora é garantido: ANA ou INEA
          abaixo_regua: m.abaixo_regua || false
        });

      if (error) {
        if (error.code === "23505") ignorados++;
        else console.log(`❌ Erro na inserção (Estação ${m.estacao_id}):`, error.message);
      } else {
        inseridos++;
      }
    }

    console.log(`✅ Ciclo finalizado. Inseridos: ${inseridos} | Ignorados: ${ignorados}`);
    return NextResponse.json({ status: "sucesso", inseridos, ignorados });

  } catch (err) {
    console.error("🚨 Erro Crítico:", err);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
