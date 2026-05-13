/* app/(sistema)/patrimonio/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Componentes
import CardPatrimonio from "./componentes/CardPatrimonio"
import ModalPatrimonio from "./componentes/ModalPatrimonio"
import IndicadoresPatrimonio from "./componentes/IndicadoresPatrimonio"

// Ícones
import { Plus, RefreshCw, Search, Landmark, Package, ShieldCheck } from "lucide-react"

export default function PatrimonioPage() {
  const [bens, setBens] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [itemSelecionado, setItemSelecionado] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

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
      showToast("Erro ao carregar dados", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregarDados() }, [])

  const bensFiltrados = bens.filter(bem => 
    bem.nome_bem?.toLowerCase().includes(busca.toLowerCase()) ||
    bem.num_patrimonial?.toLowerCase().includes(busca.toLowerCase()) ||
    bem.localizacao?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 min-h-screen bg-white pb-24">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white font-medium shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 ${
          toast.type === "error" ? "bg-red-500" : "bg-amber-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER SUTIL COM DETALHES DOURADOS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-amber-700 text-[10px] font-black uppercase tracking-[0.3em]">Gestão de Carga</span>
          </div>

          <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-800">
            Bens Patrimoniais
          </h1>
          
          {/* DESTAQUE U.A. MINIMALISTA */}
          <div className="flex items-center gap-2 text-slate-500">
            <Landmark size={14} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              U.A. <span className="text-slate-900 font-black">16.01.1046</span>
              <span className="mx-2 text-slate-200">|</span>
              <span className="text-slate-400 font-medium">Regional de Defesa Civil 10</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text"
              placeholder="Filtrar patrimônio..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 font-medium text-slate-700"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button 
            onClick={carregarDados}
            className={`p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-xl transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* INDICADORES (Cards menores e mais elegantes) */}
      <div className="py-2">
        <IndicadoresPatrimonio bens={bens} />
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-slate-400" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Listagem de Inventário</h2>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
            {bensFiltrados.length} itens encontrados
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
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

      {/* BOTÃO FLUTUANTE (Dourado sutil) */}
      <button 
        onClick={() => { setItemSelecionado(null); setModalOpen(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-amber-500 rounded-2xl shadow-2xl flex items-center justify-center hover:bg-amber-500 hover:text-white hover:scale-110 active:scale-95 transition-all z-50 border-4 border-white"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* MODAL */}
      {modalOpen && (
        <ModalPatrimonio
          bem={itemSelecionado}
          onClose={() => { setModalOpen(false); setItemSelecionado(null); }}
          onSaved={() => { carregarDados(); showToast(itemSelecionado ? "Atualizado com sucesso" : "Bem cadastrado na carga"); }}
        />
      )}
    </div>
  )
}
