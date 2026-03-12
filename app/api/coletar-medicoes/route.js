
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

    // FORÇAMOS A BUSCA SEM CACHE PARA PEGAR DADOS ATUAIS (18:45)
    const [dadosAna, dadosInea] = await Promise.all([
      fetch(`${baseUrl}/api/ana`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' } 
      }).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/api/inea`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' } 
      }).then(r => r.json()).catch(() => [])
    ]);

    // NORMALIZAÇÃO MANUAL (Garantindo a fonte aqui)
    const medicoes = [
      ...dadosAna.map(m => ({ 
        estacao_id: m.estacao_id, 
        data: m.data, 
        hora: m.hora, 
        nivel: m.nivel, 
        fonte: "ANA" 
      })),
      ...dadosInea.map(m => ({ 
        estacao_id: m.estacao_id, 
        data: m.data, 
        hora: m.hora, 
        nivel: m.nivel, 
        fonte: "INEA" 
      }))
    ];

    let inseridos = 0;
    for (const m of medicoes) {
      if (!m.estacao_id) continue;

      // INSERÇÃO DIRETA
      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: `${m.data} ${m.hora}`,
          nivel: m.nivel,
          fonte: m.fonte, // Agora vem do .map() acima, garantidamente "ANA" ou "INEA"
          abaixo_regua: false
        });

      if (!error) inseridos++;
    }

    return NextResponse.json({ status: "sucesso", total: inseridos });

  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
