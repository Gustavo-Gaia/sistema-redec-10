
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
    console.log("🚀 [ROBÔ] Iniciando coleta forçada em tempo real...");
    
    // Adicionamos um timestamp na URL para garantir quebra de cache da Vercel
    const timestamp = Date.now();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // 1. BUSCA SEM CACHE
    const [dadosAna, dadosInea] = await Promise.all([
      fetch(`${baseUrl}/api/ana?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/api/inea?t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()).catch(() => [])
    ]);

    // 2. NORMALIZAÇÃO ROBUSTA
    // Aqui garantimos que todos os campos necessários existam no objeto
    const medicoes = [
      ...dadosAna.map(m => ({
        estacao_id: m.estacao_id,
        data_hora: `${m.data} ${m.hora}`,
        nivel: m.nivel,
        fonte: "ANA",
        abaixo_regua: false
      })),
      ...dadosInea.map(m => ({
        estacao_id: m.estacao_id,
        data_hora: `${m.data} ${m.hora}`,
        nivel: m.nivel,
        fonte: "INEA",
        abaixo_regua: false
      }))
    ];

    if (medicoes.length === 0) {
      return NextResponse.json({ status: "vazio", message: "Nenhum dado novo" });
    }

    let inseridos = 0;
    let ignorados = 0;

    // 3. INSERÇÃO BLINDADA
    for (const m of medicoes) {
      if (!m.estacao_id || !m.data_hora) continue;

      // Inserção explícita
      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: m.data_hora,
          nivel: m.nivel,
          fonte: m.fonte, 
          abaixo_regua: m.abaixo_regua
        });

      if (error) {
        if (error.code === "23505") ignorados++;
        else console.error(`❌ Erro Estação ${m.estacao_id}:`, error.message);
      } else {
        inseridos++;
      }
    }

    console.log(`✅ Coleta finalizada: ${inseridos} inseridos.`);
    return NextResponse.json({ status: "sucesso", inseridos, ignorados });

  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
