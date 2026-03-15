/* app/api/robo-coleta/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {

  try {

    // =========================
    // BUSCAR ANA
    // =========================

    const respAna = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/ana`,
      { cache: "no-store" }
    );

    const dadosAna = await respAna.json();

    // =========================
    // BUSCAR INEA
    // =========================

    const respInea = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/inea`,
      { cache: "no-store" }
    );

    const dadosInea = await respInea.json();

    // =========================
    // JUNTAR DADOS
    // =========================

    const medicoes = [...dadosAna, ...dadosInea].map((m) => ({
      estacao_id: m.estacao_id,
      data: m.data,
      hora: m.hora,
      nivel: m.nivel,
      fonte: m.fonte,
      abaixo_regua: false
    }));

    // =========================
    // SALVAR
    // =========================

    const respSalvar = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/salvar-medicoes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(medicoes)
      }
    );

    const resultado = await respSalvar.json();

    return NextResponse.json({
      sucesso: true,
      total: medicoes.length,
      ...resultado
    });

  } catch (err) {

    console.log("Erro no robô:", err);

    return NextResponse.json({
      erro: "Falha na coleta automática"
    }, { status: 500 });

  }

}

