/* app/(sistema)/patrimonio/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Componentes do Módulo
import CardPatrimonio from "./componentes/CardPatrimonio"
import ModalPatrimonio from "./componentes/ModalPatrimonio"
import IndicadoresPatrimonio from "./componentes/IndicadoresPatrimonio"

// Ícones e UI
import { Plus, RefreshCw, Package, Search, Landmark, ShieldCheck } from "lucide-react"

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
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50 pb-24">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white font-medium shadow-2xl z-[100] transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER PATRIMONIAL DOURADO */}
      <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 p-10 rounded-[2.5rem] text-slate-900 shadow-xl relative overflow-hidden border-b-4 border-amber-700/20">
        {/* Pattern de fundo sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[80px] -mr-32 -mt-32 rounded-full" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-amber-900" />
              <span className="text-amber-900/70 text-[11px] font-black uppercase tracking-[0.3em]">Módulo de Carga</span>
            </div>

            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-slate-900">
              Bens Patrimoniais
            </h1>
            
            {/* DESTAQUE U.A. */}
            <div className="flex items-center gap-3 mt-4 px-4 py-2 bg-slate-900/10 rounded-2xl w-fit backdrop-blur-sm border border-slate-900/5">
              <Landmark className="w-5 h-5 text-amber-900" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-amber-950/60 uppercase tracking-widest leading-none">Unidade Administrativa</span>
                <span className="text-lg font-black text-slate-900 leading-tight">16.01.1046</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative group w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-amber-950/50 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type="text"
                placeholder="Filtrar inventário..."
                className="w-full bg-white/40 border border-amber-900/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-amber-900/40 font-bold text-slate-900"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button 
              onClick={carregarDados}
              className={`p-4 bg-slate-900 text-yellow-500 rounded-2xl transition-all active:scale-95 shadow-lg ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* INDICADORES */}
      <IndicadoresPatrimonio bens={bens} />

      {/* ÁREA DE CONTEÚDO */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
            <Package size={14} /> listagem_nominal
          </h2>
          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-tighter">
            {bensFiltrados.length} registros
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-3xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {/* BOTÃO FLUTUANTE */}
      <button 
        onClick={() => { setItemSelecionado(null); setModalOpen(true); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-yellow-500 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-yellow-500 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* MODAL */}
      {modalOpen && (
        <ModalPatrimonio
          bem={itemSelecionado}
          onClose={() => { setModalOpen(false); setItemSelecionado(null); }}
          onSaved={() => { carregarDados(); showToast(itemSelecionado ? "Carga atualizada" : "Bem cadastrado com sucesso"); }}
        />
      )}
    </div>
  )
}
