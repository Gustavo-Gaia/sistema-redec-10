/* app/api/exportar-medicoes-gerencial/route.js */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  try {

    const { searchParams } = new URL(req.url)
    const periodo = searchParams.get("periodo") || "30"

    // =========================
    // 📥 BUSCAR MEDIÇÕES
    // =========================
    let query = supabase
      .from("medicoes")
      .select("estacao_id, data_hora, nivel, fonte, abaixo_regua")

    if (periodo !== "all") {
      const dias = parseInt(periodo)
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - dias)

      query = query.gte("data_hora", dataLimite.toISOString())
    }

    const { data: medicoes, error } = await query.order("data_hora", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!medicoes || medicoes.length === 0) {
      return new NextResponse("Sem dados", { status: 200 })
    }

    // =========================
    // 📍 BUSCAR ESTAÇÕES
    // =========================
    const { data: estacoes } = await supabase
      .from("estacoes")
      .select("id, municipio")

    const mapaEstacoes = {}

    estacoes.forEach(e => {
      mapaEstacoes[e.id] = e.municipio
    })

    // =========================
    // 📄 FORMATAR CSV
    // =========================
    const header = [
      "Estação",
      "Data",
      "Hora",
      "Nível",
      "Fonte",
      "Observação"
    ]

    const rows = medicoes.map(m => {

      const dataObj = new Date(m.data_hora)

      const data = dataObj.toLocaleDateString("pt-BR")
      const hora = dataObj.toLocaleTimeString("pt-BR")

      return [
        mapaEstacoes[m.estacao_id] || m.estacao_id,
        data,
        hora,
        m.nivel,
        m.fonte,
        m.abaixo_regua ? "A/R" : ""
      ]
        .map(v => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")

    })

    const csv = [header.join(","), ...rows].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=relatorio_${periodo}.csv`
      }
    })

  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
