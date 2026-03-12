
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
    console.log("🚀 [ROBÔ] Iniciando captura...");
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // 1. BUSCA PARALELA (Com tratamento de erro para não quebrar o processo)
    const [dadosAna, dadosInea] = await Promise.all([
      fetch(`${baseUrl}/api/ana`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/api/inea`, { cache: 'no-store' }).then(r => r.json()).catch(() => [])
    ]);

    // 2. NORMALIZAÇÃO ESTRITA
    // Aqui garantimos que a fonte seja atribuída a cada objeto individualmente
    const listaAna = dadosAna.map(m => ({ ...m, fonte_fixa: "ANA" }));
    const listaInea = dadosInea.map(m => ({ ...m, fonte_fixa: "INEA" }));
    const medicoes = [...listaAna, ...listaInea];

    if (medicoes.length === 0) {
      return NextResponse.json({ status: "vazio" });
    }

    let inseridos = 0;
    let ignorados = 0;

    // 3. INSERÇÃO BLINDADA
    for (const m of medicoes) {
      if (!m.estacao_id) continue;

      // Usamos a fonte_fixa que criamos acima. 
      // Se ela não existir, forçamos o valor 'SEM_FONTE'
      const valorFonte = m.fonte_fixa || "SEM_FONTE";

      const payload = {
        estacao_id: m.estacao_id,
        data_hora: `${m.data} ${m.hora}`,
        nivel: m.nivel,
        fonte: valorFonte,
        abaixo_regua: m.abaixo_regua || false
      };

      const { error } = await supabase.from("medicoes").insert(payload);

      if (error) {
        if (error.code === "23505") ignorados++;
        else console.log(`❌ Erro estação ${m.estacao_id}:`, error.message);
      } else {
        inseridos++;
      }
    }

    return NextResponse.json({ status: "sucesso", inseridos, ignorados });

  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
