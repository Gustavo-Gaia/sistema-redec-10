/* app/(sistema)/boletins/componentes/MarcadorLeitura.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { BookOpen, Calendar, RefreshCcw, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { exibirDataFormatada } from "./utils"

export default function MarcadorLeitura() {
  const [marcadores, setMarcadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(null) // Armazena o tipo (SEDEC ou DGDEC) que está sendo salvo

  async function carregarMarcadores() {
    const { data, error } = await supabase.from("controle_leitura_boletins").select("*")
    if (!error) setMarcadores(data)
    setLoading(false)
  }

  useEffect(() => {
    carregarMarcadores()
  }, [])

  async function atualizarData(tipo, novaData) {
    if (!novaData) return
    
    setSalvando(tipo)
    try {
      const { error } = await supabase
        .from("controle_leitura_boletins")
        .upsert(
          { tipo_orgao: tipo, visto_ate: novaData }, 
          { onConflict: "tipo_orgao" }
        )

      if (error) throw error
      
      toast.success(`${tipo}: Leitura atualizada!`)
      await carregarMarcadores()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar marcador")
    } finally {
      setSalvando(null)
    }
  }

  if (loading) return <div className="animate-pulse h-12 w-64 bg-slate-100 rounded-2xl" />

  return (
    <div className="flex items-stretch gap-1 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
      {["SEDEC", "DGDEC"].map((tipo) => {
        const m = marcadores.find((item) => item.tipo_orgao === tipo)
        const isSaving = salvando === tipo

        return (
          <div 
            key={tipo} 
            className="flex flex-col px-4 py-1.5 border-r last:border-0 border-slate-100 min-w-[110px] hover:bg-slate-50 transition-colors rounded-xl relative"
          >
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Visto {tipo}
            </span>
            
            <div className="flex items-center justify-between gap-2 relative">
              <span className="text-sm font-bold text-slate-700">
                {m ? exibirDataFormatada(m.visto_ate) : "---"}
              </span>

              {/* O truque: Input por cima do ícone, mas invisível */}
              <div className="relative flex items-center justify-center">
                <input
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => atualizarData(tipo, e.target.value)}
                  disabled={isSaving}
                />
                
                {isSaving ? (
                  <Loader2 size={16} className="text-blue-500 animate-spin" />
                ) : (
                  <Calendar size={16} className="text-blue-500" />
                )}
              </div>
            </div>
          </div>
        )
      })}
      
      <div className="flex items-center px-3 bg-slate-50 rounded-xl ml-1">
        <BookOpen size={18} className="text-slate-400" />
      </div>
    </div>
  )
}
