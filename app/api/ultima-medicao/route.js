/* app/api/ultima-medicao/route.js */

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase" // ✅ IMPORTAÇÃO CORRIGIDA: Cliente único

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
