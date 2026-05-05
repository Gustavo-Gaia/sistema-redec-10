/* app/(sistema)/municipios/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Componentes (vamos criar depois)
import ListaMunicipios from "./componentes/ListaMunicipios"
import DrawerMunicipio from "./componentes/DrawerMunicipio"

// Ícones padrão do seu sistema
import { 
  Plus, 
  RefreshCw, 
  LayoutDashboard, 
  AlertTriangle 
} from "lucide-react"

export default function MunicipiosPage() {

  // ===============================
  // ESTADOS PRINCIPAIS (DADOS)
  // ===============================
  const [municipios, setMunicipios] = useState([])
  const [eventos, setEventos] = useState([])
  const [eventosMunicipios, setEventosMunicipios] = useState([])
  const [dadosEventos, setDadosEventos] = useState([])

  const [loading, setLoading] = useState(true)

  // ===============================
  // ESTADOS DE UI
  // ===============================
  const [abaAtiva, setAbaAtiva] = useState("painel")

  const [municipioSelecionado, setMunicipioSelecionado] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [toast, setToast] = useState(null)

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ===============================
  // 🔄 CARREGAR DADOS
  // ===============================
  async function carregarDados() {
    try {
      setLoading(true)

      const { data: mData } = await supabase
        .from("municipios")
        .select("*")
        .order("nome", { ascending: true })

      const { data: eData } = await supabase
        .from("eventos")
        .select("*")
        .order("created_at", { ascending: false })

      const { data: emData } = await supabase
        .from("eventos_municipios")
        .select("*")

      const { data: deData } = await supabase
        .from("dados_eventos_municipios")
        .select("*")

      setMunicipios(mData || [])
      setEventos(eData || [])
      setEventosMunicipios(emData || [])
      setDadosEventos(deData || [])

    } catch (error) {
      console.error("Erro ao carregar municípios:", error)
      showToast("Erro ao carregar dados", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // ===============================
  // 📊 FUNÇÕES AUXILIARES
  // ===============================
  function getEventosDoMunicipio(municipioId) {
    const vinculos = eventosMunicipios.filter(em => em.municipio_id === municipioId)
    return vinculos.map(v => eventos.find(e => e.id === v.evento_id)).filter(Boolean)
  }

  // ===============================
  // 🎨 RENDER
  // ===============================
  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50 pb-24">

      {/* ================= TOAST ================= */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white font-medium shadow-2xl z-[100] transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-orange-200 text-xs font-bold uppercase tracking-widest">
                Gestão de Municípios
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight uppercase leading-none">
              REDEC 10 - Norte
            </h1>

            <p className="text-slate-400 text-sm mt-1 font-medium italic">
              Monitoramento e apoio municipal
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={carregarDados}
              className={`p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 w-fit rounded-2xl border border-slate-200">
        {[
          { id: "painel", label: "Painel Geral", icon: LayoutDashboard },
          { id: "eventos", label: "Eventos", icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all ${
              abaAtiva === tab.id 
                ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" 
                : "text-slate-500 hover:bg-white/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= CONTEÚDO ================= */}
      <div className="animate-in fade-in duration-500">

        {/* ===== PAINEL ===== */}
        {abaAtiva === "painel" && (
          <ListaMunicipios
            municipios={municipios}
            eventos={eventos}
            eventosMunicipios={eventosMunicipios}
            getEventosDoMunicipio={getEventosDoMunicipio}
            onSelect={(m) => {
              setMunicipioSelecionado(m)
              setDrawerOpen(true)
            }}
          />
        )}

        {/* ===== EVENTOS ===== */}
        {abaAtiva === "eventos" && (
          <div className="space-y-4">

            <div className="text-center py-12">
              <AlertTriangle size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                Lista de eventos será implementada no próximo passo
              </p>
            </div>

          </div>
        )}

      </div>

      {/* ================= BOTÃO FLUTUANTE ================= */}
      <button 
        onClick={() => {
          setMunicipioSelecionado(null)
          setDrawerOpen(true)
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-600 hover:scale-110 active:scale-90 transition-all z-50 group border-4 border-white"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* ================= DRAWER ================= */}
      {drawerOpen && (
        <DrawerMunicipio
          municipio={municipioSelecionado}
          eventos={eventos}
          eventosMunicipios={eventosMunicipios}
          dadosEventos={dadosEventos}
          onClose={() => {
            setDrawerOpen(false)
            setMunicipioSelecionado(null)
          }}
          onSaved={() => {
            carregarDados()
            showToast(
              municipioSelecionado 
                ? "Município atualizado" 
                : "Município criado"
            )
          }}
        />
      )}

    </div>
  )
}
