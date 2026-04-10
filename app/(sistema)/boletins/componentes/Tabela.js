/* app/(sistema)/boletins/componentes/Tabela.js */

"use client"

import { useState } from "react" // Importado para controlar o loading por item
import { Star, Clock, Pencil, Copy, Search } from "lucide-react" // Search adicionado!
import { toast } from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { calcularStatusPrazo, exibirDataFormatada } from "./utils"

export default function Tabela({ dados, loading, abaAtiva, onEdit, onRefresh }) {
  // Estado para controlar quais itens estão sendo processados (evita cliques múltiplos)
  const [loadingIds, setLoadingIds] = useState([])

  const handleCopiar = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto)
      toast.success("Número copiado!", { duration: 1500 })
    } catch (err) {
      toast.error("Erro ao copiar número")
    }
  }

  const toggleEspecial = async (item) => {
    // Se o item já estiver processando, ignora o novo clique
    if (loadingIds.includes(item.id)) return

    const novoValor = !item.acompanhamento_especial
    
    // Adiciona o ID à lista de carregamento
    setLoadingIds(prev => [...prev, item.id])
    
    try {
      const { error } = await supabase
        .from("documentos_administrativos")
        .update({ acompanhamento_especial: novoValor })
        .eq("id", item.id)
      
      if (error) throw error
      
      // Comunica ao pai que o dado mudou
      onRefresh(item.id, novoValor) 
      
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar status")
    } finally {
      // Remove o ID da lista de carregamento após terminar
      setLoadingIds(prev => prev.filter(id => id !== item.id))
    }
  }

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-slate-400 font-medium italic">Carregando registros...</span>
    </div>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-400 uppercase text-[11px] font-black tracking-widest border-b border-slate-200">
            <th className="px-6 py-4 w-10 text-center">⭐</th>
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
            const isProcessing = loadingIds.includes(item.id)
            
            return (
              <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                {/* Estrela com trava contra múltiplos cliques */}
                <td className="px-6 py-4 text-center">
                  <button 
                    disabled={isProcessing}
                    onClick={() => toggleEspecial(item)}
                    className={`transform active:scale-125 transition-transform outline-none ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Marcar como especial"
                    aria-pressed={item.acompanhamento_especial}
                  >
                    <Star 
                      size={18} 
                      className={`transition-all duration-200 ${
                        item.acompanhamento_especial 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-slate-200 group-hover:text-slate-300"
                      } ${isProcessing ? 'animate-pulse' : ''}`} 
                    />
                  </button>
                </td>

                {/* Número + Copiar */}
                <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200/50">
                      {item.numero}
                    </span>
                    <button 
                      onClick={() => handleCopiar(item.numero)} 
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all text-slate-300"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                  {exibirDataFormatada(item.data_registro)}
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-relaxed max-w-md">
                    {item.assunto}
                  </p>
                </td>

                {abaAtiva === "sei" && (
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {item.destino_remetente || <span className="text-slate-300">---</span>}
                  </td>
                )}

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`
                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                    ${status === 'vencido' ? 'bg-red-100 text-red-700 border border-red-200' : 
                      status === 'alerta' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                      status === 'normal' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                      'bg-slate-100 text-slate-400 border border-slate-200'}
                  `}>
                    <Clock size={12} />
                    {item.prazo ? exibirDataFormatada(item.prazo) : "Sem Prazo"}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <button 
                      onClick={() => onEdit(item)} 
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {dados.length === 0 && !loading && (
        <div className="py-24 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">Nenhum registro encontrado.</p>
        </div>
      )}
    </div>
  )
}
