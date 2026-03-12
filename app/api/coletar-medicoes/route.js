/* app/api/coletar-medicoes/route.js */
/* api de captura automática com cron */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {

  try {

    const medicoes = await req.json();

    let inseridos = 0;
    let ignorados = 0;

    for (const m of medicoes) {

      const dataHora = `${m.data} ${m.hora}`;

      // =========================
      // BUSCAR FONTE DA ESTAÇÃO
      // =========================

      let fonte = m.fonte;

      if (!fonte) {

        const { data: estacao } = await supabase
          .from("estacoes")
          .select("fonte")
          .eq("id", m.estacao_id)
          .single();

        fonte = estacao?.fonte || "COMDEC";

      }

      // =========================
      // INSERT
      // =========================

      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: dataHora,
          nivel: m.nivel,
          abaixo_regua: m.abaixo_regua || false,
          fonte: fonte
        });

      if (error) {

        if (error.code === "23505") {
          ignorados++;
        } else {
          console.log(error);
        }

      } else {

        inseridos++;

      }

    }

    return NextResponse.json({
      inseridos,
      ignorados
    });

  } catch (err) {

    console.log(err);

    return NextResponse.json({
      erro: "Falha ao salvar medições"
    }, { status: 500 });

  }

}
