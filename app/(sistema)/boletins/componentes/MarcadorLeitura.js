/* app/(sistema)/boletins/componentes/MarcadorLeitura.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { BookOpen, Calendar, RefreshCcw } from "lucide-react"
import { toast } from "react-hot-toast"
import { exibirDataFormatada } from "./utils"

export default function MarcadorLeitura() {
  const [marcadores, setMarcadores] = useState([])
  const [loading, setLoading] = useState(true)

  async function carregarMarcadores() {
    const { data, error } = await supabase.from("controle_leitura_boletins").select("*")
    if (!error) setMarcadores(data)
    setLoading(false)
  }

  useEffect(() => {
    carregarMarcadores()
  }, [])

  async function atualizarData(tipo, novaData) {
    try {
      const { error } = await supabase
        .from("controle_leitura_boletins")
        .upsert({ tipo_orgao: tipo, visto_ate: novaData }, { onConflict: "tipo_orgao" })

      if (error) throw error
      toast.success(`Leitura ${tipo} atualizada!`)
      carregarMarcadores()
    } catch (error) {
      toast.error("Erro ao atualizar marcador")
    }
  }

  if (loading) return <div className="animate-pulse h-10 w-48 bg-slate-100 rounded-xl" />

  return (
    <div className="flex gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
      {["SEDEC", "DGDEC"].map((tipo) => {
        const m = marcadores.find((item) => item.tipo_orgao === tipo)
        return (
          <div key={tipo} className="flex flex-col px-3 py-1 border-r last:border-0 border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
              Visto {tipo}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">
                {m ? exibirDataFormatada(m.visto_ate) : "---"}
              </span>
              <input
                type="date"
                className="w-4 h-4 opacity-0 absolute cursor-pointer"
                onChange={(e) => atualizarData(tipo, e.target.value)}
              />
              <Calendar size={14} className="text-blue-500 cursor-pointer" />
            </div>
          </div>
        )
      })}
      <div className="flex items-center px-2">
        <BookOpen size={18} className="text-slate-300" />
      </div>
    </div>
  )
}
