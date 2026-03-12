
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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // 1. BUSCA
    const [dadosAna, dadosInea] = await Promise.all([
      fetch(`${baseUrl}/api/ana`).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/api/inea`).then(r => r.json()).catch(() => [])
    ]);

    // 2. CONSTRUÇÃO COM GARANTIA DE OBJETO
    const medicoes = [
      ...dadosAna.map(m => ({
        estacao_id: m.estacao_id,
        data: m.data,
        hora: m.hora,
        nivel: m.nivel,
        abaixo_regua: m.abaixo_regua || false,
        fonte: "ANA"
      })),
      ...dadosInea.map(m => ({
        estacao_id: m.estacao_id,
        data: m.data,
        hora: m.hora,
        nivel: m.nivel,
        abaixo_regua: m.abaixo_regua || false,
        fonte: "INEA"
      }))
    ];

    let inseridos = 0;
    let ignorados = 0;

    // 3. INSERÇÃO COM DEBUG
    for (const m of medicoes) {
      if (!m.estacao_id) continue;

      const payload = {
        estacao_id: Number(m.estacao_id),
        data_hora: `${m.data} ${m.hora}`,
        nivel: m.nivel,
        fonte: m.fonte, 
        abaixo_regua: m.abaixo_regua
      };

      console.log("DEBUG - Payload sendo enviado ao Supabase:", payload);

      const { error } = await supabase
        .from("medicoes")
        .insert(payload);

      if (error) {
        if (error.code === "23505") ignorados++;
        else console.log(`❌ Erro na inserção (Estação ${m.estacao_id}):`, error);
      } else {
        inseridos++;
      }
    }

    return NextResponse.json({ status: "sucesso", inseridos, ignorados });

  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
