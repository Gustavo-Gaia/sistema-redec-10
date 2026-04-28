/* app/(sistema)/viaturas/page.js */

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus } from "lucide-react"

export default function ViaturasPage() {
  const [viaturas, setViaturas] = useState([])
  const [loading, setLoading] = useState(true)

  async function buscarViaturas() {
    setLoading(true)

    const { data, error } = await supabase
      .from("viaturas")
      .select("*")
      .order("prefixo")

    if (error) {
      console.error("Erro ao buscar viaturas:", error)
    } else {
      setViaturas(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    buscarViaturas()
  }, [])

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">Gestão de Viaturas</h1>
        <p className="text-sm opacity-80">
          Cadastro e controle da frota operacional
        </p>
      </div>

      {/* LISTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {loading && (
          <p className="text-slate-500">Carregando...</p>
        )}

        {!loading && viaturas.length === 0 && (
          <p className="text-slate-500">Nenhuma viatura cadastrada.</p>
        )}

        {viaturas.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-lg transition"
          >
            <h2 className="text-lg font-bold text-slate-800">
              {v.prefixo}
            </h2>

            <p className="text-sm text-slate-500">
              {v.marca} {v.modelo}
            </p>

            <div className="mt-3 text-sm">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                v.situacao === "OPERANTE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {v.situacao}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Placa: {v.placa || "-"}
            </p>
          </div>
        ))}
      </div>

      {/* BOTÃO FLUTUANTE */}
      <button
        className="fixed bottom-20 right-6 bg-slate-700 text-white p-4 rounded-full shadow-lg"
      >
        <Plus />
      </button>

    </div>
  )
}
