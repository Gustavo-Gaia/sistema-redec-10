/* app/api/limpar-medicoes/route.js */
/* API para limpeza segura de medições */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()

    const periodo = body.periodo || "30"
    const confirmacao = body.confirmacao

    // =========================
    // 🔒 VALIDAÇÃO DE SEGURANÇA
    // =========================
    if (confirmacao !== "DELETAR") {
      return NextResponse.json(
        { error: "Confirmação inválida" },
        { status: 400 }
      )
    }

    // =========================
    // 📅 CALCULAR DATA LIMITE
    // =========================
    let dataLimite = null

    if (periodo !== "all") {
      const dias = parseInt(periodo)

      if (isNaN(dias)) {
        return NextResponse.json(
          { error: "Período inválido" },
          { status: 400 }
        )
      }

      dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - dias)
    }

    // =========================
    // 🔍 CONTAR REGISTROS ANTES
    // =========================
    let queryCount = supabase
      .from("medicoes")
      .select("*", { count: "exact", head: true })

    if (dataLimite) {
      queryCount = queryCount.lt("data_hora", dataLimite.toISOString())
    }

    const { count, error: countError } = await queryCount

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      )
    }

    if (!count || count === 0) {
      return NextResponse.json({
        sucesso: true,
        removidos: 0,
        mensagem: "Nenhum registro para remover"
      })
    }

    // =========================
    // 🗑️ EXECUTAR DELETE
    // =========================
    let queryDelete = supabase.from("medicoes").delete()

    if (dataLimite) {
      queryDelete = queryDelete.lt("data_hora", dataLimite.toISOString())
    }

    const { error: deleteError } = await queryDelete

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    // =========================
    // ✅ RESPOSTA FINAL
    // =========================
    return NextResponse.json({
      sucesso: true,
      removidos: count,
      mensagem: `${count} registros removidos com sucesso`
    })

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Erro interno na limpeza" },
      { status: 500 }
    )
  }
}
