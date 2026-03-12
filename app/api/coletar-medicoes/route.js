/* app/api/coletar-medicoes/route.js */
/* captura automática de medições - usado pelo cron */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {

  try {

    console.log("Iniciando coleta automática...");

    let inseridos = 0;
    let ignorados = 0;

    // ===============================
    // CARREGAR ESTAÇÕES
    // ===============================

    const { data: estacoes, error } = await supabase
      .from("estacoes")
      .select("id, fonte")
      .eq("ativo", true);

    if (error) {

      console.log("Erro ao carregar estações:", error);

      return NextResponse.json({
        erro: "Erro ao carregar estações"
      }, { status: 500 });

    }

    // ===============================
    // BUSCAR MEDIÇÕES NAS APIS
    // ===============================

    let medicoes = [];

    try {

      const respAna = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ana`);
      const dadosAna = await respAna.json();

      medicoes = [...medicoes, ...dadosAna];

    } catch (e) {

      console.log("Erro na API ANA:", e);

    }

    try {

      const respInea = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/inea`);
      const dadosInea = await respInea.json();

      medicoes = [...medicoes, ...dadosInea];

    } catch (e) {

      console.log("Erro na API INEA:", e);

    }

    console.log("Medições recebidas:", medicoes.length);

    // ===============================
    // MAPA DE FONTES DAS ESTAÇÕES
    // ===============================

    const mapaFontes = {};

    estacoes.forEach((e) => {

      mapaFontes[e.id] = e.fonte || "COMDEC";

    });

    // ===============================
    // SALVAR MEDIÇÕES
    // ===============================

    for (const m of medicoes) {

      if (!m.estacao_id) continue;

      const dataHora = `${m.data} ${m.hora}`;

      const fonte = m.fonte || mapaFontes[m.estacao_id] || "COMDEC";

      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: dataHora,
          nivel: m.nivel,
          fonte: fonte,
          abaixo_regua: m.abaixo_regua || false
        });

      if (error) {

        if (error.code === "23505") {

          ignorados++;

        } else {

          console.log("Erro ao inserir:", error);

        }

      } else {

        inseridos++;

      }

    }

    console.log("Inseridos:", inseridos);
    console.log("Ignorados:", ignorados);

    return NextResponse.json({
      status: "ok",
      inseridos,
      ignorados
    });

  } catch (err) {

    console.log("Erro geral:", err);

    return NextResponse.json({
      erro: "Falha na coleta automática"
    }, { status: 500 });

  }

}
