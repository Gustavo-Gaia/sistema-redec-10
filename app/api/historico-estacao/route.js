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

  const limit = searchParams.get("limit") || 100

  const { data, error } = await supabase
    .from("medicoes")
    .select("nivel, data_hora, abaixo_regua")
    .eq("estacao_id", estacaoId)
    .order("data_hora", { ascending: false })
    .limit(limit)

  if (error) {

    return NextResponse.json({
      error: error.message
    })

  }

  return NextResponse.json(data)

}
