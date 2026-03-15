/* app/api/robo-coleta/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {

  try {

    console.log("===== INICIANDO COLETA AUTOMÁTICA =====");

    // =========================
    // BUSCAR ANA + INEA EM PARALELO
    // =========================

    const [respAna, respInea] = await Promise.all([

      fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/ana`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(20000)
        }
      ),

      fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/inea`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(20000)
        }
      )

    ]);

    const dadosAna = await respAna.json();
    const dadosInea = await respInea.json();

    console.log("Medições ANA:", dadosAna.length);
    console.log("Medições INEA:", dadosInea.length);

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

    console.log("Total medições capturadas:", medicoes.length);

    if (medicoes.length === 0) {

      return NextResponse.json({
        sucesso: true,
        mensagem: "Nenhuma medição encontrada"
      });

    }

    // =========================
    // SALVAR NO BANCO
    // =========================

    const respSalvar = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/salvar-medicoes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(medicoes),
        signal: AbortSignal.timeout(20000)
      }
    );

    const resultado = await respSalvar.json();

    console.log("Resultado salvamento:", resultado);

    console.log("===== COLETA FINALIZADA =====");

    return NextResponse.json({
      sucesso: true,
      total_coletado: medicoes.length,
      ...resultado
    });

  } catch (err) {

    console.error("Erro no robô de coleta:", err);

    return NextResponse.json(
      {
        erro: "Falha na coleta automática",
        detalhes: err.message
      },
      { status: 500 }
    );

  }

}
