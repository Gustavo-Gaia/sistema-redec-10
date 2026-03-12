/* app/api/inea/route.js */

export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import cheerio from "cheerio"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id,codigo_estacao")
    .eq("fonte", "INEA")
    .eq("ativo", true)

  const resultados = []

  for (const estacao of estacoes) {

    try {

      const url =
        `https://alertadecheias.inea.rj.gov.br/alertadecheias/${estacao.codigo_estacao}.html`

      const response = await fetch(url)

      const html = await response.text()

      const $ = cheerio.load(html)

      let ultimo = null

      $("table tr").each((i, el) => {

        const cols = $(el).find("td")

        if (cols.length < 8) return

        const dataHora = $(cols[0]).text().trim()
        const nivelTxt = $(cols[7]).text().trim()

        if (!dataHora || !nivelTxt) return

        const partes = dataHora.split(" ")

        if (partes.length < 2) return

        const data = partes[0].split("/").reverse().join("-")
        const hora = partes[1]

        const nivel = parseFloat(
          nivelTxt.replace(",", ".")
        )

        ultimo = {
          data,
          hora,
          nivel
        }

      })

      if (!ultimo) continue

      resultados.push({
        estacao_id: estacao.id,
        data: ultimo.data,
        hora: ultimo.hora,
        nivel: ultimo.nivel
      })

    } catch (err) {

      console.log("Erro INEA:", estacao.codigo_estacao)

    }

  }

  return NextResponse.json(resultados)

}
