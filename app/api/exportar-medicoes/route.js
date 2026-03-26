/* app/api/exportar-medicoes/route.js */ /* exporta nas configurações para fazer backup */

/* app/api/exportar-medicoes/route.js */
/* exportação com paginação completa (sem limite de 1000) */

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

    const PAGE_SIZE = 1000
    let allData = []
    let from = 0
    let to = PAGE_SIZE - 1
    let hasMore = true

    // =========================
    // 📅 DATA LIMITE
    // =========================
    let dataLimite = null

    if (periodo !== "all") {
      const dias = parseInt(periodo)
      dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - dias)
    }

    // =========================
    // 🔁 LOOP DE PAGINAÇÃO
    // =========================
    while (hasMore) {

      let query = supabase
        .from("medicoes")
        .select("*")
        .order("data_hora", { ascending: true })
        .range(from, to)

      if (dataLimite) {
        query = query.gte("data_hora", dataLimite.toISOString())
      }

      const { data, error } = await query

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (data && data.length > 0) {
        allData = allData.concat(data)
      }

      // Se veio menos que 1000, acabou
      if (!data || data.length < PAGE_SIZE) {
        hasMore = false
      } else {
        from += PAGE_SIZE
        to += PAGE_SIZE
      }
    }

    // =========================
    // 📭 SEM DADOS
    // =========================
    if (allData.length === 0) {
      return new NextResponse("Sem dados para exportar", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      })
    }

    // =========================
    // 📄 CSV
    // =========================
    const header = Object.keys(allData[0]).join(",")

    const rows = allData.map(obj =>
      Object.values(obj)
        .map(v => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )

    const csv = [header, ...rows].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=backup_${periodo}.csv`
      }
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
