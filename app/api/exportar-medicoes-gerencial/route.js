/* app/api/exportar-medicoes-gerencial/route.js */

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase" // ✅ CORRIGIDO: Agora utiliza o acesso centralizado

export async function GET(req) {
  try {

    const { searchParams } = new URL(req.url)
    const periodo = searchParams.get("periodo") || "30"

    const PAGE_SIZE = 1000
    let from = 0
    let todasMedicoes = []
    let continuar = true

    // =========================
    // 🔁 LOOP PAGINAÇÃO
    // =========================
    while (continuar) {

      let query = supabase
        .from("medicoes")
        .select("estacao_id, data_hora, nivel, fonte, abaixo_regua")
        .order("data_hora", { ascending: true })
        .range(from, from + PAGE_SIZE - 1)

      if (periodo !== "all") {
        const dias = parseInt(periodo)
        const dataLimite = new Date()
        dataLimite.setDate(dataLimite.getDate() - dias)

        query = query.gte("data_hora", dataLimite.toISOString())
      }

      const { data, error } = await query

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (data.length === 0) {
        continuar = false
      } else {
        todasMedicoes = [...todasMedicoes, ...data]

        if (data.length < PAGE_SIZE) {
          continuar = false
        } else {
          from += PAGE_SIZE
        }
      }
    }

    if (todasMedicoes.length === 0) {
      return new NextResponse("Sem dados", { status: 200 })
    }

    // =========================
    // 📍 ESTAÇÕES
    // =========================
    const { data: estacoes } = await supabase
      .from("estacoes")
      .select("id, municipio")

    const mapa = {}
    estacoes.forEach(e => {
      mapa[e.id] = e.municipio
    })

    // =========================
    // 📄 CSV FORMATADO
    // =========================
    const header = [
      "Estação",
      "Data",
      "Hora",
      "Nível",
      "Fonte",
      "Observação"
    ]

    const rows = todasMedicoes.map(m => {

      const d = new Date(m.data_hora)

      return [
        mapa[m.estacao_id] || m.estacao_id,
        d.toLocaleDateString("pt-BR"),
        d.toLocaleTimeString("pt-BR"),
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
