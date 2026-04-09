/* app/(sistema)/boletins/componentes/Tabela.js */

"use client"

import { Star, Clock, Pencil, Trash2, Copy, ExternalLink } from "lucide-react"
import { toast } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { calcularStatusPrazo, exibirDataFormatada } from "./utils"

export default function Tabela({ dados, loading, abaAtiva, onEdit, onRefresh }) {
  
  const handleCopiar = (texto) => {
    navigator.clipboard.writeText(texto)
    toast.success("Número copiado!")
  }

  const toggleEspecial = async (item) => {
    try {
      const { error } = await supabase
        .from("documentos_administrativos")
        .update({ acompanhamento_especial: !item.acompanhamento_especial })
        .eq("id", item.id)
      
      if (error) throw error
      onRefresh()
    } catch (error) {
      toast.error("Erro ao atualizar status")
    }
  }

  if (loading) return (
    <div className="p-20 text-center text-slate-400 font-medium italic animate-pulse">
      Carregando registros...
    </div>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-400 uppercase text-[11px] font-black tracking-widest border-b border-slate-200">
            <th className="px-6 py-4 w-10">⭐</th>
            <th className="px-6 py-4">{abaAtiva === "sei" ? "Nº do Processo" : "Boletim"}</th>
            <th className="px-6 py-4">Data</th>
            <th className="px-6 py-4 min-w-[300px]">Assunto</th>
            {abaAtiva === "sei" && <th className="px-6 py-4">Destino/Remetente</th>}
            <th className="px-6 py-4">Prazo</th>
            <th className="px-6 py-4 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dados.map((item) => {
            const status = calcularStatusPrazo(item.prazo)
            
            return (
              <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                {/* Estrela */}
                <td className="px-6 py-4">
                  <button onClick={() => toggleEspecial(item)}>
                    <Star 
                      size={18} 
                      className={item.acompanhamento_especial ? "fill-amber-400 text-amber-400" : "text-slate-200 group-hover:text-slate-300"} 
                    />
                  </button>
                </td>

                {/* Número + Copiar */}
                <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    {abaAtiva === "boletins" && (
                      <span className={`px-2 py-0.5 rounded text-[10px] ${item.tipo_orgao === 'SEDEC' ? 'bg-blue-100 text-blue-700' : 'bg-slate-700 text-white'}`}>
                        {item.tipo_orgao}
                      </span>
                    )}
                    {item.numero}
                    <button onClick={() => handleCopiar(item.numero)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all text-slate-400">
                      <Copy size={14} />
                    </button>
                  </div>
                </td>

                {/* Data */}
                <td className="px-6 py-4 text-sm text-slate-500">
                  {exibirDataFormatada(item.data_registro)}
                </td>

                {/* Assunto */}
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-relaxed">
                    {item.assunto}
                  </p>
                </td>

                {/* Destino (Apenas SEI) */}
                {abaAtiva === "sei" && (
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {item.destino_remetente || "-"}
                  </td>
                )}

                {/* Prazo com Status */}
                <td className="px-6 py-4">
                  <div className={`
                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tight
                    ${status === 'vencido' ? 'bg-red-100 text-red-700' : 
                      status === 'alerta' ? 'bg-amber-100 text-amber-700' : 
                      status === 'normal' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-slate-100 text-slate-400'}
                  `}>
                    <Clock size={12} />
                    {item.prazo ? exibirDataFormatada(item.prazo) : "Sem Prazo"}
                  </div>
                </td>

                {/* Ações */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Pencil size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {dados.length === 0 && (
        <div className="py-20 text-center text-slate-400 italic">
          Nenhum registro encontrado para os filtros selecionados.
        </div>
      )}
    </div>
  )
}
