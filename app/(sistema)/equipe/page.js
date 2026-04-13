/* app/(sistema)/equipe/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { verificarSeAtivo } from "./componentes/utils"

// Componentes do Módulo
import Indicadores from "./componentes/Indicadores"
import BlocoComando from "./componentes/BlocoComando"
import ListaAdministrativo from "./componentes/ListaAdministrativo"
import DrawerMilitar from "./componentes/DrawerMilitar"
import TabelaEfetivo from "./componentes/TabelaEfetivo" // Criaremos a seguir
import MuralExCoordenadores from "./componentes/MuralExCoordenadores" // Criaremos a seguir

// Ícones e UI
import { Users, Plus, RefreshCw, LayoutDashboard, Shield, History, ClipboardList } from "lucide-react"

export default function EquipePage() {
  // ESTADOS PRINCIPAIS
  const [militares, setMilitares] = useState([])
  const [afastamentos, setAfastamentos] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  // NAVEGAÇÃO POR ABAS (prontidao | efetivo | mural)
  const [abaAtiva, setAbaAtiva] = useState("prontidao")

  // ESTADOS DE INTERFACE
  const [militarSelecionado, setMilitarSelecionado] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function carregarDados() {
    try {
      setLoading(true)
      
      // Buscamos todos para poder filtrar ativos/inativos no frontend via utils
      const { data: mData } = await supabase
        .from("equipe")
        .select("*")
        .order("ordem", { ascending: true })

      const { data: aData } = await supabase
        .from("equipe_afastamentos")
        .select("*")

      const { data: cData } = await supabase
        .from("equipe_config")
        .select("*")
        .single()

      setMilitares(mData || [])
      setAfastamentos(aData || [])
      setConfig(cData || null)
    } catch (error) {
      console.error("Erro ao carregar equipe:", error)
      showToast("Erro ao carregar dados", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // Militares que aparecem no painel operacional (Ativos e sem data de saída vencida)
  const militaresAtivos = militares.filter(m => verificarSeAtivo(m))

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      
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
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Gestão de Efetivo</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase">REDEC 10 - Norte</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Controle de Prontidão e Histórico de Comando</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setMilitarSelecionado(null); setDrawerOpen(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" /> Novo Militar
            </button>
            <button 
              onClick={carregarDados}
              className={`p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-200/50 w-fit rounded-2xl">
        {[
          { id: "prontidao", label: "Prontidão", icon: LayoutDashboard },
          { id: "efetivo", label: "Efetivo Geral", icon: ClipboardList },
          { id: "mural", label: "Mural de Ex-Coords", icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              abaAtiva === tab.id 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:bg-white/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="animate-in fade-in duration-500">
        
        {/* ABA 1: PRONTIDÃO (O seu painel original) */}
        {abaAtiva === "prontidao" && (
          <div className="space-y-6">
            <Indicadores militares={militaresAtivos} afastamentos={afastamentos} />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Comando Atual</h2>
                <BlocoComando 
                  config={config} 
                  militares={militaresAtivos} 
                  afastamentos={afastamentos}
                  onSelect={(m) => { setMilitarSelecionado(m); setDrawerOpen(true); }}
                />
              </div>
              <div className="lg:col-span-8 space-y-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Efetivo Administrativo</h2>
                <ListaAdministrativo 
                  militares={militaresAtivos} 
                  config={config} 
                  afastamentos={afastamentos}
                  onSelect={(m) => { setMilitarSelecionado(m); setDrawerOpen(true); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: EFETIVO GERAL (Tabela com dados sensíveis: CPF, RG, Datas) */}
        {abaAtiva === "efetivo" && (
          <TabelaEfetivo 
            militares={militares} 
            onEdit={(m) => { setMilitarSelecionado(m); setDrawerOpen(true); }} 
          />
        )}

        {/* ABA 3: MURAL DE EX-COORDENADORES */}
        {abaAtiva === "mural" && (
          <MuralExCoordenadores />
        )}

      </div>

      {/* DRAWER LATERAL (Sempre disponível) */}
      {drawerOpen && (
        <DrawerMilitar
          militar={militarSelecionado}
          afastamentos={afastamentos.filter(a => a.equipe_id === militarSelecionado?.id)}
          militares={militares} // Passamos todos para lógica de cargo
          onClose={() => { setDrawerOpen(false); setMilitarSelecionado(null); }}
          onSaved={() => { carregarDados(); showToast(militarSelecionado ? "Atualizado com sucesso" : "Cadastrado com sucesso"); }}
        />
      )}

    </div>
  )
}
