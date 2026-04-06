/* app/api/salvar-medicoes/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // ✅ IMPORTAÇÃO CORRIGIDA: Usando o cliente único configurado

export async function POST(req) {

  try {

    const medicoes = await req.json();

    let inseridos = 0;
    let ignorados = 0;

    for (const m of medicoes) {

      const dataHora = `${m.data} ${m.hora}`;

      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: dataHora,
          nivel: m.nivel,
          fonte: m.fonte,
          abaixo_regua: m.abaixo_regua
        });

      if (error) {

        console.log("Erro ao inserir:", error);

        if (error.code === "23505") {
          ignorados++;
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

    console.log("Erro geral:", err);

    return NextResponse.json({
      erro: "Falha ao salvar medições"
    }, { status: 500 });

  }

}
