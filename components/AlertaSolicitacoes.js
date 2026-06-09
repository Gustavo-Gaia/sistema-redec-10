/* components/AlertaSolicitacoes.js */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AlertaSolicitacoes() {
  const router = useRouter()
  const [totalPendentes, setTotalPendentes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function contarPendentes() {
      // Traz o count direto do banco de forma leve usando head: true
      const { count, error } = await supabase
        .from("usuarios")
        .select("*", { count: "exact", head: true })
        .eq("ativo", false)

      if (!error && count !== null) {
        setTotalPendentes(count)
      }
      setLoading(false)
    }

    contarPendentes()

    // Ouve em tempo real (Realtime) se um novo usuário se cadastrar
    const canal = supabase
      .channel("usuarios_pendentes")
      .on("postgres_changes", { event: "*", schema: "public", table: "usuarios" }, () => {
        contarPendentes()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  if (loading) return null

  // Trata a gramática de forma exata (01 Cadastro, 02 Cadastros, nenhum...)
  const renderTexto = () => {
    if (totalPendentes === 0) return "Nenhum cadastro pendente"
    if (totalPendentes === 1) return "01 cadastro pendente"
    return `${String(totalPendentes).padStart(2, "0")} cadastros pendentes`
  }

  return (
    <button
      onClick={() => router.push("/configuracoes")}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all active:scale-95 shadow-sm uppercase tracking-wide
        ${totalPendentes > 0 
          ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" 
          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
        }`}
    >
      {/* SINALIZADOR VISUAL (Bolinha que pisca se houver pendência) */}
      <div className="relative flex h-2 w-2 items-center justify-center">
        {totalPendentes > 0 ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </>
        ) : (
          <span className="h-2 w-2 rounded-full bg-slate-400"></span>
        )}
      </div>
      
      <span>{renderTexto()}</span>
    </button>
  )
}
