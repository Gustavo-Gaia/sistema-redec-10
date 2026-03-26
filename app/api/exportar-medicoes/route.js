/* app/api/exportar-medicoes/route.js */ /* exporta nas configurações para fazer backup */

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

    let query = supabase.from("medicoes").select("*")

    // =========================
    // 📅 FILTRO POR PERÍODO
    // =========================
    if (periodo !== "all") {
      const dias = parseInt(periodo)
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - dias)

      query = query.gte("data_hora", dataLimite.toISOString())
    }

    const { data, error } = await query.order("data_hora", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // =========================
    // 📭 SEM DADOS
    // =========================
    if (!data || data.length === 0) {
      return new NextResponse("Sem dados para exportar", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      })
    }

    // =========================
    // 📄 CSV
    // =========================
    const header = Object.keys(data[0]).join(",")

    const rows = data.map(obj =>
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
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
