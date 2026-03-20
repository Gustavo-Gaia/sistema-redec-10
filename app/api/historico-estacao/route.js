/* app/api/historico-estacao/route.js */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const estacaoId = searchParams.get("id")
  const periodo = searchParams.get("periodo") || "24h"

  if (!estacaoId) {
    return NextResponse.json({ error: "Estação não informada" }, { status: 400 })
  }

  try {
    // 🔥 CURTO PRAZO (24h e 7d)
    // Mudamos de LIMIT para janelas de TEMPO reais para não "esconder" dados manuais
    if (periodo === "24h" || periodo === "7d") {
      const horas = periodo === "24h" ? 24 : 168
      const dataCorte = new Date(Date.now() - horas * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from("medicoes")
        .select("nivel, data_hora, abaixo_regua")
        .eq("estacao_id", estacaoId)
        .gte("data_hora", dataCorte) // 🚀 Pega TUDO do período, sem travar em 24 registros
        .order("data_hora", { ascending: false })

      if (error) throw error

      // Fallback: Se a estação é manual e não teve leitura nas últimas 24h, 
      // pegamos as últimas 5 para o gráfico não ficar vazio.
      if (data.length === 0 && periodo === "24h") {
        const { data: fallback } = await supabase
          .from("medicoes")
          .select("nivel, data_hora, abaixo_regua")
          .eq("estacao_id", estacaoId)
          .order("data_hora", { ascending: false })
          .limit(10)
        return NextResponse.json(fallback || [])
      }

      return NextResponse.json(data)
    }

    // 🔥 LONGO PRAZO (30d ou Total)
    if (periodo === "30d" || periodo === "total") {
      // 1. Busca os dados agregados (diários)
      const { data: diarios, error: errDiario } = await supabase
        .from("medicoes_diarias")
        .select("nivel, data, estacao_id")
        .eq("estacao_id", estacaoId)
        .order("data", { ascending: false })
        .limit(periodo === "30d" ? 30 : 1000)

      if (errDiario) throw errDiario

      // 2. 💡 O SEGREDO: Busca a última medição real (manual ou robô) 
      // para garantir que o nível atual (ex: 5.35m) apareça no gráfico de 30 dias hoje
      const { data: ultimaReal } = await supabase
        .from("medicoes")
        .select("nivel, data_hora")
        .eq("estacao_id", estacaoId)
        .order("data_hora", { ascending: false })
        .limit(1)

      let formatado = diarios.map((m) => ({
        nivel: m.nivel,
        data_hora: m.data,
        abaixo_regua: false
      }))

      // 3. Mescla o dado atual no topo do histórico de 30 dias
      if (ultimaReal && ultimaReal.length > 0) {
        const dadoAtual = {
          nivel: ultimaReal[0].nivel,
          data_hora: ultimaReal[0].data_hora,
          abaixo_regua: false
        }
        
        // Evita duplicar se o dado diário já for de hoje
        const hojeISO = new Date().toISOString().split('T')[0]
        const jaTemHoje = formatado.some(d => d.data_hora.includes(hojeISO))
        
        if (!jaTemHoje) {
          formatado.unshift(dadoAtual)
        }
      }

      return NextResponse.json(formatado)
    }

    return NextResponse.json({ error: "Período inválido" }, { status: 400 })

  } catch (error) {
    console.error("Erro API Historico:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
