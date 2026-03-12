/* app/api/coletar-medicoes/route.js */
/* api de captura automática com cron */

export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {

  try {

    const resp = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ana`);
    const dadosAna = await resp.json();

    const resp2 = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/inea`);
    const dadosInea = await resp2.json();

    const medicoes = [...dadosAna, ...dadosInea];

    for (const m of medicoes) {

      const dataHora = `${m.data} ${m.hora}`;

      await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: dataHora,
          nivel: m.nivel,
          fonte: m.fonte
        });

    }

    return NextResponse.json({
      status: "ok",
      total: medicoes.length
    });

  } catch (err) {

    return NextResponse.json({
      erro: "falha na coleta"
    });

  }

}
