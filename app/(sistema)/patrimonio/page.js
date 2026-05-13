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
  // ESTADOS PRINCIPAIS
  const [bens, setBens] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  
  // ESTADOS DE INTERFACE
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

  useEffect(() => {
    carregarDados()
  }, [])

  // Filtro de busca (Nome, Tombo ou Localização)
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

      {/* HEADER PRINCIPAL MODERNIZADO */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden border border-white/5">
        {/* Efeito de brilho de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-100 text-[10px] font-black uppercase tracking-[0.2em]">Carga & Patrimônio</span>
              </div>
              {/* DESTAQUE U.A. */}
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <Landmark className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">
                  U.A. <span className="text-white font-black">16.01.1046</span>
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic">
                REDEC 10 <span className="text-yellow-500 text-2xl not-italic ml-2">—</span> <span className="text-slate-300 font-light">NORTE</span>
              </h1>
              <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                Regional de Defesa Civil do Estado do Rio de Janeiro
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative group w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
              <input 
                type="text"
                placeholder="Filtrar por nome, tombo ou local..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:bg-slate-950 transition-all placeholder:text-slate-600 font-medium"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button 
              onClick={carregarDados}
              className={`p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-95 ${loading ? 'animate-spin' : ''}`}
              title="Atualizar Dados"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* INDICADORES ESTRATÉGICOS */}
      <IndicadoresPatrimonio bens={bens} />

      {/* ÁREA DE CONTEÚDO */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Package size={14} /> Inventário Nominal
          </h2>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md">
            {bensFiltrados.length} itens encontrados
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <>
            {bensFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {bensFiltrados.map((bem) => (
                  <CardPatrimonio 
                    key={bem.id} 
                    bem={bem} 
                    onClick={() => { setItemSelecionado(bem); setModalOpen(true); }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold italic text-sm">Nenhum bem localizado com os critérios informados.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* BOTÃO FLUTUANTE DE COMANDO */}
      <button 
        onClick={() => { setItemSelecionado(null); setModalOpen(true); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-yellow-500 hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500 relative z-10" />
      </button>

      {/* MODAL DE OPERAÇÃO */}
      {modalOpen && (
        <ModalPatrimonio
          bem={itemSelecionado}
          onClose={() => { setModalOpen(false); setItemSelecionado(null); }}
          onSaved={() => { carregarDados(); showToast(itemSelecionado ? "Item atualizado com sucesso" : "Novo bem registrado na carga"); }}
        />
      )}

    </div>
  )
}
