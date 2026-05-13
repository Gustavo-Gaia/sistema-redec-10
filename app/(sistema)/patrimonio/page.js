/* app/(sistema)/patrimonio/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Componentes
import CardPatrimonio from "./componentes/CardPatrimonio"
import ModalPatrimonio from "./componentes/ModalPatrimonio"
import IndicadoresPatrimonio from "./componentes/IndicadoresPatrimonio"

// Ícones
import { Plus, RefreshCw, Search, Landmark, Package } from "lucide-react"

export default function PatrimonioPage() {
  const [bens, setBens] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [itemSelecionado, setItemSelecionado] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  async function carregarDados() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("patrimonio")
        .select("*")
        .order("nome_bem", { ascending: true })

      if (error) throw error
      setBens(data || [])
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const bensFiltrados = bens.filter(bem =>
    bem.nome_bem?.toLowerCase().includes(busca.toLowerCase()) ||
    bem.num_patrimonial?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="p-6 space-y-8 min-h-screen bg-white pb-24">
      
      {/* HEADER LIMPO E PROFISSIONAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase">
            Bens Patrimoniais
          </h1>
          <div className="flex items-center gap-2 mt-1 text-slate-500">
            <Landmark size={16} className="text-amber-500" />
            <span className="text-xs font-bold tracking-widest uppercase">
              U.A. <span className="text-slate-900 font-black">16.01.1046</span>
              <span className="mx-2 text-slate-300">|</span> 
              REDEC 10 - NORTE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquisar tombo ou nome..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button 
            onClick={carregarDados}
            className={`p-2.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-slate-200 ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* ÁREA DE INDICADORES */}
      <div className="bg-slate-50/50 p-4 rounded-[2rem]">
        <IndicadoresPatrimonio bens={bens} />
      </div>

      {/* LISTAGEM DE BENS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 text-slate-400">
          <div className="flex items-center gap-2">
            <Package size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Inventário Geral
            </span>
          </div>
          <span className="text-[10px] font-bold">
            {bensFiltrados.length} ITENS ENCONTRADOS
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-slate-50 rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bensFiltrados.map((bem) => (
              <CardPatrimonio 
                key={bem.id} 
                bem={bem} 
                onClick={() => { setItemSelecionado(bem); setModalOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* BOTÃO FLUTUANTE ADICIONAR */}
      <button 
        onClick={() => { setItemSelecionado(null); setModalOpen(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center hover:bg-amber-600 hover:scale-110 active:scale-95 transition-all z-50 border-2 border-white"
      >
        <Plus size={28} />
      </button>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {modalOpen && (
        <ModalPatrimonio
          bem={itemSelecionado}
          onClose={() => { setModalOpen(false); setItemSelecionado(null); }}
          onSaved={carregarDados}
        />
      )}
    </div>
  )
}
