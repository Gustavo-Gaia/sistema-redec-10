/* app/(sistema)/equipe/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Componentes do Módulo
import Indicadores from "./componentes/Indicadores"
import BlocoComando from "./componentes/BlocoComando"
import ListaAdministrativo from "./componentes/ListaAdministrativo"
import DrawerMilitar from "./componentes/DrawerMilitar"

// Ícones e UI
import { Users, Plus, RefreshCw } from "lucide-react"

export default function EquipePage() {
  // ESTADOS PRINCIPAIS
  const [militares, setMilitares] = useState([])
  const [afastamentos, setAfastamentos] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  // ESTADOS DE INTERFACE
  const [militarSelecionado, setMilitarSelecionado] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // 🔥 BUSCA DE DADOS (ORQUESTRADA)
  async function carregarDados() {
    try {
      setLoading(true)

      // 1. Buscar Militares Ativos
      const { data: mData } = await supabase
        .from("equipe")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true })

      // 2. Buscar Afastamentos (somente os que impactam o presente/futuro)
      const { data: aData } = await supabase
        .from("equipe_afastamentos")
        .select("*")

      // 3. Buscar Configuração de Comando
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

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white font-medium shadow-2xl z-[100] transition-all animate-bounce ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER PRINCIPAL (PADRÃO REDEC) */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Gestão de Efetivo</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Painel de Prontidão Operacional</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Controle em tempo real da unidade REDEC 10 - Norte</p>
          </div>
          
          <button 
            onClick={carregarDados}
            className={`p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        {/* Detalhe estético de fundo */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* 📊 INDICADORES (TOTAL, ATIVOS, FORA) */}
      <Indicadores militares={militares} afastamentos={afastamentos} />

      {/* 🧭 PAINEL OPERACIONAL (DIVIDIDO EM COMANDO E ADM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA DO COMANDO (4 colunas) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase px-2">Cadeia de Comando</h2>
          <BlocoComando 
            config={config} 
            militares={militares} 
            afastamentos={afastamentos}
            onSelect={(m) => {
              setMilitarSelecionado(m)
              setDrawerOpen(true)
            }}
          />
        </div>

        {/* COLUNA ADMINISTRATIVA (8 colunas) */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase px-2">Efetivo Administrativo</h2>
          <ListaAdministrativo 
            militares={militares} 
            config={config} 
            afastamentos={afastamentos}
            onSelect={(m) => {
              setMilitarSelecionado(m)
              setDrawerOpen(true)
            }}
          />
        </div>
      </div>

      {/* ➕ BOTÃO FLUTUANTE ADICIONAR MILITAR */}
      <button
        onClick={() => {
          setMilitarSelecionado(null)
          setDrawerOpen(true)
        }}
        className="fixed bottom-10 right-8 bg-slate-900 hover:bg-blue-700 text-white w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group z-40"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* 📱 DRAWER DE EDIÇÃO / CADASTRO */}
      {drawerOpen && (
        <DrawerMilitar
          militar={militarSelecionado}
          afastamentos={afastamentos.filter(a => a.equipe_id === militarSelecionado?.id)}
          onClose={() => {
            setDrawerOpen(false)
            setMilitarSelecionado(null)
          }}
          onSaved={() => {
            carregarDados()
            showToast(militarSelecionado ? "Dados atualizados" : "Militar cadastrado")
          }}
        />
      )}

    </div>
  )
}
