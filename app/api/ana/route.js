/* app/api/ana/route.js */

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {

  const { data: estacoes, error } = await supabase
    .from("estacoes")
    .select("*")
    .eq("fonte", "ANA")
    .eq("ativo", true)

  if (error) {
    return NextResponse.json({ error: error.message })
  }

  const resultados = []

  for (const estacao of estacoes) {

    try {

      const hoje = new Date()
      const inicio = new Date()

      inicio.setDate(hoje.getDate() - 5)

      const dataInicio = inicio.toLocaleDateString("pt-BR")
      const dataFim = hoje.toLocaleDateString("pt-BR")

      const url =
        `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?` +
        `codEstacao=${estacao.codigo_estacao}&dataInicio=${dataInicio}&dataFim=${dataFim}`

      const response = await fetch(url)

      const xml = await response.text()

      const match = xml.match(/<Nivel>(.*?)<\/Nivel>/g)

      if (!match) continue

      const ultimo = match[match.length - 1]

      const nivel = parseFloat(
        ultimo.replace("<Nivel>", "").replace("</Nivel>", "")
      ) / 100

      resultados.push({
        estacao_id: estacao.id,
        municipio: estacao.municipio,
        nivel
      })

    } catch (err) {

      console.log("Erro ANA:", estacao.municipio)

    }

  }

  return NextResponse.json(resultados)

}
