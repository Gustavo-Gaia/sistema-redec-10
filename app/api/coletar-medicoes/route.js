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

    // ===============================
    // 1️⃣ CARREGAR ESTAÇÕES
    // ===============================

    const { data: estacoes } = await supabase
      .from("estacoes")
      .select("id, fonte, codigo_estacao")
      .eq("ativo", true);

    if (!estacoes) {
      return NextResponse.json({ erro: "Nenhuma estação encontrada" });
    }

    // mapa rápido
    const mapaFonte = {};
    const mapaCodigo = {};

    estacoes.forEach((e) => {
      mapaFonte[e.id] = e.fonte;
      mapaCodigo[e.codigo_estacao] = e.id;
    });

    // ===============================
    // 2️⃣ BUSCAR DADOS DAS APIS
    // ===============================

    const respAna = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ana`);
    const dadosAna = await respAna.json();

    const respInea = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/inea`);
    const dadosInea = await respInea.json();

    const medicoes = [...dadosAna, ...dadosInea];

    let inseridos = 0;
    let ignorados = 0;

    // ===============================
    // 3️⃣ INSERIR MEDIÇÕES
    // ===============================

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

        // duplicata
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
      erro: "Falha na coleta"
    }, { status: 500 });

  }

}
