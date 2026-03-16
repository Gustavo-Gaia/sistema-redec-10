/* app/api/ultima-medicao/route.js */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {

  const { searchParams } = new URL(req.url)

  const estacaoId = searchParams.get("id")

  const { data, error } = await supabase
    .from("medicoes")
    .select("*")
    .eq("estacao_id", estacaoId)
    .order("data_hora", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message })
  }

  return NextResponse.json(data)
}
