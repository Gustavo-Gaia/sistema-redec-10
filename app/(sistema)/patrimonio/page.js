/* app/(sistema)/patrimonio/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Componentes
import CardPatrimonio from "./componentes/CardPatrimonio"
import ModalPatrimonio from "./componentes/ModalPatrimonio"
import IndicadoresPatrimonio from "./componentes/IndicadoresPatrimonio"

// Ícones
import {
  Plus,
  RefreshCw,
  Package,
  Search,
  Landmark,
  ShieldCheck
} from "lucide-react"

export default function PatrimonioPage() {

  const [bens, setBens] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroCondicao, setFiltroCondicao] = useState("Todos") // Novo estado de filtro
  const [itemSelecionado, setItemSelecionado] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // =============================
  // TOAST
  // =============================
  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // =============================
  // FETCH
  // =============================
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
      console.error(error)
      showToast("Erro ao carregar patrimônio", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // ==========================================================
  // 🔍 FILTROS COMBINADOS + ORDENAÇÃO DE PRIORIDADE DINÂMICA
  // ==========================================================
  const bensFiltrados = bens
    .filter((bem) => {
      const matchesBusca = 
        bem.nome_bem?.toLowerCase().includes(busca.toLowerCase()) ||
        bem.num_patrimonial?.toLowerCase().includes(busca.toLowerCase()) ||
        bem.localizacao?.toLowerCase().includes(busca.toLowerCase());
      
      const matchesCondicao = filtroCondicao === "Todos" || bem.condicao === filtroCondicao;

      return matchesBusca && matchesCondicao;
    })
    .sort((a, b) => {
      // Define a ordem desejada por pesos
      const pesos = {
        "Em Uso": 1,
        "Acautelado": 2,
        "Armazenado": 3,
        "Inservível": 4,
        "Baixa Definitiva": 5
      };

      const pesoA = pesos[a.condicao] || 6;
      const pesoB = pesos[b.condicao] || 6;

      // Se as condições forem iguais, ordena por ordem alfabética do nome do bem
      if (pesoA === pesoB) {
        return (a.nome_bem || "").localeCompare(b.nome_bem || "");
      }

      return pesoA - pesoB;
    });

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-slate-100/60 p-6 pb-24 space-y-6">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold text-white animate-in fade-in slide-in-from-top-4 ${toast.type === "error" ? "bg-red-500" : "bg-emerald-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER COMPACTO */}
      <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/40 bg-gradient-to-br from-amber-100 via-yellow-50 to-white p-5 shadow-sm">
        
        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

          {/* ESQUERDA - Título e U.A lado a lado */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/10">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-amber-800">
                Bens Patrimoniais
              </h1>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/70 border border-white shadow-sm backdrop-blur-sm">
              <Landmark className="w-4 h-4 text-amber-700" />
              <div className="leading-tight">
                <p className="text-[8px] uppercase tracking-widest font-black text-slate-500">U.A</p>
                <p className="text-sm font-black text-slate-800">16.01.1046</p>
              </div>
            </div>
          </div>

          {/* DIREITA - Busca e Reload */}
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="relative group w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar patrimônio..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full h-11 rounded-2xl border border-white bg-white/80 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:ring-2 focus:ring-amber-300 focus:bg-white placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={carregarDados}
              className={`h-11 w-11 flex items-center justify-center rounded-2xl bg-white/80 border border-white shadow-sm transition-all hover:bg-white active:scale-95 ${loading ? "animate-spin" : ""}`}
            >
              <RefreshCw className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* INDICADORES COM FILTRO */}
      <IndicadoresPatrimonio 
        bens={bens} 
        setFiltroCondicao={setFiltroCondicao} // Nome corrigido
        filtroCondicao={filtroCondicao}       // Nome corrigido
      />

      {/* LISTA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              {filtroCondicao === "Todos" ? "Inventário Completo" : `Filtrando: ${filtroCondicao}`}
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black">
            {bensFiltrados.length} registros
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {bensFiltrados.map((bem) => (
              <CardPatrimonio
                key={bem.id}
                bem={bem}
                onClick={() => {
                  setItemSelecionado(bem)
                  setModalOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setItemSelecionado(null)
          setModalOpen(true)
        }}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 hover:bg-amber-600 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* MODAL */}
      {modalOpen && (
        <ModalPatrimonio
          bem={itemSelecionado}
          onClose={() => {
            setModalOpen(false)
            setItemSelecionado(null)
          }}
          onSaved={() => {
            carregarDados()
            showToast(itemSelecionado ? "Patrimônio atualizado" : "Patrimônio cadastrado")
          }}
        />
      )}
    </div>
  )
}
