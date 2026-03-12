/* app/api/inea/route.js */

export const dynamic = "force-dynamic"

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {

  const { data: estacoes, error } = await supabase
    .from("estacoes")
    .select("*")
    .eq("fonte", "INEA")
    .eq("ativo", true)

  if (error) {
    return NextResponse.json({ error: error.message })
  }

  const resultados = []

  for (const estacao of estacoes) {

    try {

      const url =
        `https://alertadecheias.inea.rj.gov.br/alertadecheias/${estacao.codigo_estacao}.html`

      const response = await fetch(url)

      const html = await response.text()

      const $ = cheerio.load(html)

      const linhas = $("table tr")

      let registros = []

      linhas.each((i, el) => {

        const cols = $(el).find("td")

        if (cols.length >= 8) {

          const dataHora = $(cols[0]).text().trim()
          const nivelTxt = $(cols[7]).text().trim()

          if (!dataHora || !nivelTxt) return

          try {

            const partes = dataHora.split(" ")

            const data = partes[0].split("/").reverse().join("-")
            const hora = partes[1]

            const nivel = parseFloat(
              nivelTxt.replace(",", ".")
            )

            registros.push({
              data,
              hora,
              nivel
            })

          } catch {}

        }

      })

      if (registros.length === 0) continue

      const ultimo = registros[registros.length - 1]

      resultados.push({
        estacao_id: estacao.id,
        municipio: estacao.municipio,
        codigo_estacao: estacao.codigo_estacao,
        fonte: estacao.fonte,
        data: ultimo.data,
        hora: ultimo.hora,
        nivel: ultimo.nivel
      })

    } catch (err) {

      console.log("Erro INEA:", estacao.municipio)

    }

  }

  return NextResponse.json(resultados)

}
