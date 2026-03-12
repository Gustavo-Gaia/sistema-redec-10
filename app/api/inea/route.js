/* app/api/inea/route.js */

export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import * as cheerio from "cheerio"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function capturarINEA(codigo) {

  const url =
    `https://alertadecheias.inea.rj.gov.br/alertadecheias/${codigo}.html`

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml",
      "Cache-Control": "no-cache"
    },
    cache: "no-store"
  })

  const html = await response.text()

  const $ = cheerio.load(html)

  const tabela = $("#Table")

  if (!tabela.length) return null

  const registros = []

  tabela.find("tr").each((i, el) => {

    const cols = $(el).find("td")

    if (cols.length < 8) return

    const dataHoraTxt = $(cols[0]).text().trim()
    const nivelTxt = $(cols[7]).text().trim()

    if (!dataHoraTxt || !nivelTxt) return

    try {

      const [dataTxt, horaTxt] = dataHoraTxt.split(" ")

      const [dia, mes, ano] = dataTxt.split("/")

      const dt = new Date(`${ano}-${mes}-${dia}T${horaTxt}`)

      const nivel = parseFloat(
        nivelTxt.replace(",", ".")
      )

      registros.push({
        dt,
        nivel
      })

    } catch {}

  })

  if (!registros.length) return null

  const ultimo = registros.reduce((a, b) =>
    a.dt > b.dt ? a : b
  )

  return {
    data: ultimo.dt.toISOString().slice(0,10),
    hora: ultimo.dt.toISOString().slice(11,16),
    nivel: ultimo.nivel
  }

}

export async function GET() {

  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("id,codigo_estacao")
    .eq("fonte","INEA")
    .eq("ativo",true)

  const resultados = []

  for (const estacao of estacoes) {

    try {

      const dados = await capturarINEA(
        estacao.codigo_estacao
      )

      if (!dados) continue

      resultados.push({
        estacao_id: estacao.id,
        ...dados
      })

    } catch (err) {

      console.log(
        "Erro INEA:",
        estacao.codigo_estacao
      )

    }

  }

  return NextResponse.json(resultados)

}
