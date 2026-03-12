/* app/api/inea/route.js */

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

      const linhas = $("#Table tr")

      let nivel = null

      linhas.each((i, el) => {

        const cols = $(el).find("td")

        if (cols.length >= 8) {

          const valor = $(cols[7]).text().trim()

          if (valor) {

            nivel = parseFloat(
              valor.replace(",", ".")
            )

          }

        }

      })

      if (nivel !== null) {

        resultados.push({
          estacao_id: estacao.id,
          municipio: estacao.municipio,
          nivel
        })

      }

    } catch (err) {

      console.log("Erro INEA:", estacao.municipio)

    }

  }

  return NextResponse.json(resultados)

}
