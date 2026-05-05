/* app/(sistema)/municipios/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// COMPONENTES
import ListaMunicipios from "./componentes/ListaMunicipios"
import DrawerMunicipio from "./componentes/DrawerMunicipio"
import ListaEventos from "./componentes/eventos/ListaEventos"

// ICONES
import { 
  Plus, 
  RefreshCw, 
  LayoutDashboard, 
  AlertTriangle 
} from "lucide-react"

export default function MunicipiosPage() {

  // ===============================
  // ESTADOS
  // ===============================
  const [municipios, setMunicipios] = useState([])
  const [eventos, setEventos] = useState([])
  const [eventosMunicipios, setEventosMunicipios] = useState([])

  const [loading, setLoading] = useState(true)

  const [abaAtiva, setAbaAtiva] = useState("painel")

  const [municipioSelecionado, setMunicipioSelecionado] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [toast, setToast] = useState(null)

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ===============================
  // CARREGAR DADOS
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

      setMunicipios(mData || [])
      setEventos(eData || [])
      setEventosMunicipios(emData || [])

    } catch (error) {
      console.error(error)
      showToast("Erro ao carregar dados", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // ===============================
  // AUXILIAR
  // ===============================
  function getEventosDoMunicipio(municipioId) {
    const vinculos = eventosMunicipios.filter(
      (em) => em.municipio_id === municipioId
    )

    return vinculos
      .map((v) => eventos.find((e) => e.id === v.evento_id))
      .filter(Boolean)
  }

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50 pb-24">

      {/* ================= TOAST ================= */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white font-medium shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ================= HEADER NOVO ================= */}
      <div className="relative rounded-3xl overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-red-500/90 via-red-600/80 to-red-700/90" />
        <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />

        <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between md:items-center gap-6 text-white">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                Municípios
              </span>
            </div>

            <h1 className="text-3xl font-black uppercase">
              Gestão Municipal
            </h1>

            <p className="text-white/70 text-sm mt-1 italic">
              Monitoramento, eventos e documentação
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={carregarDados}
              className={`p-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 backdrop-blur-md transition-all ${
                loading ? "animate-spin" : ""
              }`}
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
          </div>

        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border shadow-sm w-fit">
        {[
          { id: "painel", label: "Painel Geral", icon: LayoutDashboard },
          { id: "eventos", label: "Eventos", icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase transition-all ${
              abaAtiva === tab.id
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= CONTEÚDO ================= */}
      <div className="animate-in fade-in duration-500">

        {/* PAINEL */}
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

        {/* EVENTOS (AGORA REAL) */}
        {abaAtiva === "eventos" && (
          <ListaEventos municipios={municipios} />
        )}

      </div>

      {/* ================= FAB ================= */}
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
