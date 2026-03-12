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

    console.log("Cron executado:", new Date().toISOString());

    // ==========================
    // 1️⃣ CARREGAR ESTAÇÕES
    // ==========================

    const { data: estacoes, error } = await supabase
      .from("estacoes")
      .select("id, fonte")
      .eq("ativo", true);

    if (error) {
      console.log("Erro carregando estações:", error);
      return NextResponse.json({ erro: "erro estações" });
    }

    // mapa id → fonte
    const mapaFonte = {};

    estacoes.forEach((e) => {
      mapaFonte[e.id] = e.fonte;
    });

    console.log("Mapa de fontes:", mapaFonte);

    // ==========================
    // 2️⃣ BUSCAR APIS
    // ==========================

    const respAna = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ana`);
    const dadosAna = await respAna.json();

    const respInea = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/inea`);
    const dadosInea = await respInea.json();

    const medicoes = [...dadosAna, ...dadosInea];

    let inseridos = 0;
    let ignorados = 0;

    // ==========================
    // 3️⃣ SALVAR MEDIÇÕES
    // ==========================

    for (const m of medicoes) {

      const dataHora = `${m.data} ${m.hora}`;

      const fonte = mapaFonte[m.estacao_id] || "AUTO";

      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: dataHora,
          nivel: m.nivel,
          fonte: fonte,
          abaixo_regua: false
        });

      if (error) {

        if (error.code === "23505") {
          ignorados++;
        } else {
          console.log("Erro insert:", error);
        }

      } else {

        inseridos++;

      }

    }

    return NextResponse.json({
      status: "ok",
      inseridos,
      ignorados
    });

  } catch (err) {

    console.log("Erro cron:", err);

    return NextResponse.json({
      erro: "falha no cron"
    }, { status: 500 });

  }

}
