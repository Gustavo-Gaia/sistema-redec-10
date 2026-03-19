/* app/api/historico-estacao/route.js */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {

  const { searchParams } = new URL(req.url)

  const estacaoId = searchParams.get("id")
  const periodo = searchParams.get("periodo") || "24h"

  if (!estacaoId) {
    return NextResponse.json({ error: "Estação não informada" }, { status: 400 })
  }

  let query

  try {

    // 🔥 CURTO PRAZO (dados brutos)
    if (periodo === "24h" || periodo === "7d") {

      const limit = periodo === "24h" ? 24 : 168

      const { data, error } = await supabase
        .from("medicoes")
        .select("nivel, data_hora, abaixo_regua")
        .eq("estacao_id", estacaoId)
        .order("data_hora", { ascending: false })
        .limit(limit)

      if (error) throw error

      return NextResponse.json(data)
    }

    // 🔥 LONGO PRAZO (dados agregados)
    if (periodo === "30d" || periodo === "total") {

      const { data, error } = await supabase
        .from("medicoes_diarias")
        .select("nivel, data, estacao_id")
        .eq("estacao_id", estacaoId)
        .order("data", { ascending: false })
        .limit(periodo === "30d" ? 30 : 1000)

      if (error) throw error

      // 🔄 Padronizar formato para o gráfico
      const formatado = data.map((m) => ({
        nivel: m.nivel,
        data_hora: m.data,
        abaixo_regua: false
      }))

      return NextResponse.json(formatado)
    }

    return NextResponse.json({ error: "Período inválido" }, { status: 400 })

  } catch (error) {

    return NextResponse.json({
      error: error.message
    }, { status: 500 })

  }

}
