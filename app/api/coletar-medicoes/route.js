
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

    // BUSCA
    const [dadosAna, dadosInea] = await Promise.all([
      fetch(`${baseUrl}/api/ana`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/api/inea`, { cache: 'no-store' }).then(r => r.json()).catch(() => [])
    ]);

    const medicoes = [
      ...dadosAna.map(m => ({ ...m, fonte: m.fonte || "ANA" })),
      ...dadosInea.map(m => ({ ...m, fonte: m.fonte || "INEA" }))
    ];

    for (const m of medicoes) {
      if (!m.estacao_id) continue;

      const payload = {
        estacao_id: m.estacao_id,
        data_hora: `${m.data} ${m.hora}`,
        nivel: m.nivel,
        fonte: m.fonte,
        abaixo_regua: m.abaixo_regua || false
      };

      // --- LOG CRUCIAL: Olhe isso no terminal da Vercel ---
      console.log("DADO ENVIADO AO SUPABASE:", JSON.stringify(payload));

      const { error } = await supabase.from("medicoes").insert(payload);

      if (error) console.log(`Erro estação ${m.estacao_id}:`, error.message);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
