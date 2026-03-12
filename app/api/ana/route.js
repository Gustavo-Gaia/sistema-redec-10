/* app/api/ana/route.js */

export const dynamic = "force-dynamic"

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
        "https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos" +
        `?codEstacao=${estacao.codigo_estacao}` +
        `&dataInicio=${dataInicio}` +
        `&dataFim=${dataFim}`

      const response = await fetch(url)

      const xml = await response.text()

      const registros = [
        ...xml.matchAll(/<DataHora>(.*?)<\/DataHora>[\s\S]*?<Nivel>(.*?)<\/Nivel>/g)
      ]

      if (registros.length === 0) continue

      const ultimo = registros[registros.length - 1]

      const dataHora = ultimo[1]
      const nivelRaw = ultimo[2]

      const dt = new Date(dataHora)

      const data = dt.toISOString().slice(0, 10)
      const hora = dt.toISOString().slice(11, 16)

      const nivel = parseFloat(nivelRaw) / 100

      resultados.push({
        estacao_id: estacao.id,
        municipio: estacao.municipio,
        codigo_estacao: estacao.codigo_estacao,
        fonte: estacao.fonte,
        data,
        hora,
        nivel
      })

    } catch (err) {

      console.log("Erro ANA:", estacao.municipio)

    }

  }

  return NextResponse.json(resultados)

}
