/* app/(sistema)/configuracoes/componentes/Solicitacoes.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Check, X, AlertCircle } from "lucide-react"

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [acaoLoading, setAcaoLoading] = useState(null)

  async function carregarSolicitacoes() {
    setLoading(true)

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("cadastro_pendente", true)
      .order("criado_em", { ascending: false })

    if (!error && data) {
      setSolicitacoes(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    carregarSolicitacoes()
  }, [])

  async function handleAprovar(id) {
    setAcaoLoading(id)

    const { error } = await supabase
      .from("usuarios")
      .update({
        ativo: true,
        cadastro_pendente: false
      })
      .eq("id", id)

    if (!error) {
      // Remove da listagem visualmente após aprovar
      setSolicitacoes(prev => prev.filter(u => u.id !== id))
    } else {
      alert("Erro ao aprovar usuário.")
    }

    setAcaoLoading(null)
  }

  async function handleRecusar(id) {
    if (!confirm("Tem certeza que deseja recusar e excluir esta solicitação de cadastro?")) return

    setAcaoLoading(id)

    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id)

    if (!error) {
      setSolicitacoes(prev => prev.filter(u => u.id !== id))
    } else {
      alert("Erro ao recusar/excluir usuário.")
    }

    setAcaoLoading(null)
  }

  return (
    <div className="space-y-4">

      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <AlertCircle className="text-amber-500" size={24} />
          Solicitações de Acesso Pendentes
        </h2>

        <p className="text-slate-500 text-sm mt-1">
          Aprove ou recuse novos cadastros de acesso ao sistema
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500 text-sm animate-pulse">
            Carregando solicitações...
          </p>
        ) : solicitacoes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium text-sm">
            Nenhuma solicitação de acesso pendente no momento.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {solicitacoes.map((user) => (
              <div
                key={user.id}
                className="p-4 flex justify-between items-center hover:bg-slate-50 transition"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    {user.email}
                  </p>

                  <p className="text-sm text-slate-500 mt-0.5">
                    RG: {user.rg || "-"} • Órgão: {user.orgao || "-"}
                  </p>

                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    Pendente de Liberação
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={acaoLoading !== null}
                    onClick={() => handleAprovar(user.id)}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition active:scale-95 disabled:opacity-50"
                    title="Aprovar Cadastro"
                  >
                    <Check size={20} />
                  </button>

                  <button
                    disabled={acaoLoading !== null}
                    onClick={() => handleRecusar(user.id)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition active:scale-95 disabled:opacity-50"
                    title="Recusar e Excluir"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
