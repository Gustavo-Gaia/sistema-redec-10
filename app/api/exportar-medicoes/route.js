/* app/api/exportar-medicoes/route.js */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Cliente admin (usa service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {

    // 🔹 Define corte (90 dias)
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - 90)

    // 🔹 Busca dados antigos
    const { data, error } = await supabase
      .from("medicoes")
      .select("*")
      .lt("data_hora", dataLimite.toISOString())

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 🔹 Converter para CSV
    const header = Object.keys(data[0] || {}).join(",")

    const rows = data.map(obj =>
      Object.values(obj)
        .map(v => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )

    const csv = [header, ...rows].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=backup_medicoes.csv"
      }
    })

  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
