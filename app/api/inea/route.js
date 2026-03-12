/* app/api/inea/route.js */

export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id,codigo_estacao")
    .eq("fonte","INEA")
    .eq("ativo",true)

  const resultados = []

  for (const estacao of estacoes) {

    try {

      const url =
        `https://alertadecheias.inea.rj.gov.br/ws/hidro/estacao/${estacao.codigo_estacao}`

      const response = await fetch(url)

      const json = await response.json()

      if (!json || !json.length) continue

      const ultimo = json[json.length - 1]

      const dataHora = new Date(ultimo.datahora)

      const data = dataHora.toISOString().slice(0,10)
      const hora = dataHora.toISOString().slice(11,16)

      const nivel = parseFloat(ultimo.nivel)

      resultados.push({
        estacao_id: estacao.id,
        data,
        hora,
        nivel
      })

    } catch (err) {

      console.log("Erro INEA:", estacao.codigo_estacao)

    }

  }

  return NextResponse.json(resultados)

}
