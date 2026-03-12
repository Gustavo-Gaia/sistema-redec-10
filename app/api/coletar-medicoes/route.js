
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

    // 1. BUSCA (Forçando sem cache)
    const [dadosAna, dadosInea] = await Promise.all([
      fetch(`${baseUrl}/api/ana?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/api/inea?t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()).catch(() => [])
    ]);

    // 2. PROCESSAMENTO (AQUI O SEGREDO: Injetar a fonte explicitamente)
    const registros = [
      ...dadosAna.map(m => ({
        estacao_id: m.estacao_id,
        data_hora: `${m.data} ${m.hora}:00`,
        nivel: parseFloat(m.nivel),
        fonte: "ANA", // <--- INJEÇÃO FORÇADA
        abaixo_regua: false
      })),
      ...dadosInea.map(m => ({
        estacao_id: m.estacao_id,
        data_hora: `${m.data} ${m.hora}:00`,
        nivel: parseFloat(m.nivel),
        fonte: "INEA", // <--- INJEÇÃO FORÇADA
        abaixo_regua: false
      }))
    ];

    // 3. GRAVAÇÃO BLINDADA
    let inseridos = 0;
    for (const reg of registros) {
      if (!reg.estacao_id || isNaN(reg.nivel)) continue;

      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: reg.estacao_id,
          data_hora: reg.data_hora,
          nivel: reg.nivel,
          fonte: reg.fonte, // <--- GARANTIDO QUE NÃO É NULL
          abaixo_regua: reg.abaixo_regua
        });

      if (!error) inseridos++;
    }

    return NextResponse.json({ status: "ok", inseridos });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
