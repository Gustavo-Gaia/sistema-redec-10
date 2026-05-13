/* app/(sistema)/patrimonio/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Componentes que criaremos nos próximos passos
import CardPatrimonio from "./componentes/CardPatrimonio"
import ModalPatrimonio from "./componentes/ModalPatrimonio"
import IndicadoresPatrimonio from "./componentes/IndicadoresPatrimonio"

// Ícones
import { Plus, RefreshCw, Package, Search } from "lucide-react"

export default function PatrimonioPage() {
  // ESTADOS
  const [bens, setBens] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  
  // INTERFACE
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
      showToast("Erro ao carregar patrimônio", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // Filtro de busca simples
  const bensFiltrados = bens.filter(bem => 
    bem.nome_bem?.toLowerCase().includes(busca.toLowerCase()) ||
    bem.num_patrimonial?.includes(busca)
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

      {/* HEADER PRINCIPAL */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-200 text-xs font-bold uppercase tracking-widest">Gestão de Bens</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Patrimônio REDEC 10</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium italic">Controle de Inventário e Carga</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar bem ou tombo..."
                className="bg-white/10 border border-white/20 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-64"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button 
              onClick={carregarDados}
              className={`p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* INDICADORES (Cards pequenos de resumo) */}
      <IndicadoresPatrimonio bens={bens} />

      {/* GRID DE BENS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
        {loading ? (
          <p className="text-slate-400 font-medium">Carregando inventário...</p>
        ) : (
          bensFiltrados.map((bem) => (
            <CardPatrimonio 
              key={bem.id} 
              bem={bem} 
              onClick={() => { setItemSelecionado(bem); setModalOpen(true); }}
            />
          ))
        )}
      </div>

      {/* BOTÃO FLUTUANTE (Novo Bem) */}
      <button 
        onClick={() => { setItemSelecionado(null); setModalOpen(true); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-yellow-500 hover:scale-110 active:scale-90 transition-all z-50 group border-4 border-white"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {modalOpen && (
        <ModalPatrimonio
          bem={itemSelecionado}
          onClose={() => { setModalOpen(false); setItemSelecionado(null); }}
          onSaved={() => { carregarDados(); showToast(itemSelecionado ? "Item atualizado" : "Novo bem cadastrado"); }}
        />
      )}

    </div>
  )
}
