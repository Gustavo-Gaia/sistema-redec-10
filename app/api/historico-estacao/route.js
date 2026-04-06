/* app/api/historico-estacao/route.js */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic";

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

  try {
    let query = supabase
      .from("medicoes")
      .select("nivel, data_hora, abaixo_regua")
      .eq("estacao_id", estacaoId)
      .order("data_hora", { ascending: false })

    const agora = new Date()
    
    // Filtros de tempo
    if (periodo === "24h") {
      const dataCorte = new Date(agora.getTime() - (24 * 60 * 60 * 1000)).toISOString()
      query = query.gte("data_hora", dataCorte).limit(200) // Limite de segurança
    } 
    else if (periodo === "7d") {
      const dataCorte = new Date(agora.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString()
      query = query.gte("data_hora", dataCorte).limit(400)
    } 
    else if (periodo === "30d") {
      const dataCorte = new Date(agora.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString()
      query = query.gte("data_hora", dataCorte).limit(800)
    }
    else {
      // Caso seja "total", limitamos a 1000 para não quebrar o front-end
      query = query.limit(1000)
    }

    let { data, error } = await query

    if (error) throw error

    // Fallback amigável
    if (!data || data.length === 0) {
      const { data: fallback } = await supabase
        .from("medicoes")
        .select("nivel, data_hora, abaixo_regua")
        .eq("estacao_id", estacaoId)
        .order("data_hora", { ascending: false })
        .limit(10)
      
      return NextResponse.json(fallback || [])
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error("Erro API Historico:", error)
    return NextResponse.json({ error: "Erro interno ao buscar dados" }, { status: 500 })
  }
}
