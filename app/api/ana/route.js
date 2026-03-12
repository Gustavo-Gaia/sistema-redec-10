/* app/api/ana/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseStringPromise } from "xml2js";

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// CAPTURAR ANA
// ============================

async function capturarANA(codigo) {

 const hoje = new Date()

 const dataFim = hoje.toLocaleDateString("pt-BR")

 const inicio = new Date()
 inicio.setDate(inicio.getDate() - 5)

 const dataInicio = inicio.toLocaleDateString("pt-BR")

 const url =
   "https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos" +
   `?codEstacao=${codigo}` +
   `&dataInicio=${dataInicio}` +
   `&dataFim=${dataFim}`

 try {

   const resp = await fetch(url)

   const xml = await resp.text()

   // remove namespaces (igual python)
   const xmlLimpo = xml
     .replace(/<\/?\w+:/g, "<")
     .replace(/xmlns(:\w+)?="[^"]*"/g, "")

   const json = await parseStringPromise(xmlLimpo)

   const registros =
     json?.NewDataSet?.DadosHidrometereologicos || []

   if (!registros.length) return null

   const registrosValidos = []

   registros.forEach((r) => {

     const dataHora = r.DataHora?.[0]
     const nivel = r.Nivel?.[0]

     if (!dataHora || !nivel) return

     const dt = new Date(dataHora)

     registrosValidos.push({
       dt,
       nivel: parseFloat(nivel) / 100
     })

   })

   if (!registrosValidos.length) return null

   // pega o mais recente
   registrosValidos.sort((a, b) => b.dt - a.dt)

   const ultimo = registrosValidos[0]

   const data = ultimo.dt.toISOString().split("T")[0]

   const hora = ultimo.dt.toTimeString().slice(0,5)

   return {
     data,
     hora,
     nivel: ultimo.nivel
   }

 } catch (err) {

   console.error("Erro ANA", codigo, err)
   return null

 }

}

// ============================
// API
// ============================

export async function GET() {

 const { data: estacoes } = await supabase
   .from("estacoes")
   .select("id, codigo_estacao")
   .eq("fonte", "ANA")
   .eq("ativo", true)

 if (!estacoes) return NextResponse.json([])

 const resultados = []

 for (const estacao of estacoes) {

   const dados = await capturarANA(estacao.codigo_estacao)

   if (dados) {

     resultados.push({
       estacao_id: estacao.id,
       data: dados.data,
       hora: dados.hora,
       nivel: dados.nivel
     })

   }

 }

 return NextResponse.json(resultados)

}
