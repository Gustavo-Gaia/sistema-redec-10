/* app/(sistema)/municipios/componentes/eventos/ListaEventos.js */

"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Calendar, 
  MapPin, 
  Edit3, 
  Trash2,
  Eye,
  Plus,
  Filter,
  ListChecks,
  Globe,
  AlertTriangle,
  Building2
} from "lucide-react"

import ModalEvento from "./ModalEvento"

export default function ListaEventos({ municipios, onDelete, onRefresh }) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)

  // ESTADOS DOS FILTROS
  const [filtroTipo, setFiltroTipo] = useState("TODOS") // TODOS, ROTINA, ANORMALIDADE
  const [filtroCategoria, setFiltroCategoria] = useState("TODOS") // TODOS, MUNICIPIO, REDEC

  async function carregarEventos() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("eventos")
        .select(`
          *,
          eventos_municipios (
            id,
            municipio_id,
            municipios (nome),
            eventos_dados (
              afetados,
              mortos,
              desalojados,
              desabrigados,
              desaparecidos
            )
          )
        `)
        .order("data_inicio", { ascending: false })

      if (error) throw error
      setEventos(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarEventos()
  }, [])

  // LÓGICA DE FILTRAGEM
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(ev => {
      const bateTipo = filtroTipo === "TODOS" || ev.tipo_registro === filtroTipo
      const bateCategoria = filtroCategoria === "TODOS" || ev.categoria === filtroCategoria
      return bateTipo && bateCategoria
    })
  }, [eventos, filtroTipo, filtroCategoria])

  function abrirNovo() {
    setEventoSelecionado(null)
    setModalOpen(true)
  }

  function editarEvento(ev) {
    setEventoSelecionado(ev)
    setModalOpen(true)
  }

  async function confirmarExclusao(id) {
    if (onDelete) {
      await onDelete(id)
      carregarEventos()
    }
  }

  function formatarData(data) {
    if (!data) return "-"
    const d = new Date(data)
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
    return d.toLocaleDateString("pt-BR")
  }

  function nomesMunicipios(ev) {
    if (ev.fora_area) return "FORA DA ÁREA DA REDEC"
    const lista = ev.eventos_municipios?.map(m => m.municipios?.nome)
    if (!lista || lista.length === 0) return "REDEC / GERAL"
    return lista.join(", ").toUpperCase()
  }

  function calcularTotais(ev) {
    return ev.eventos_municipios?.reduce((acc, item) => {
      const dados = item.eventos_dados?.[0]
      if (!dados) return acc
      acc.afetados += dados.afetados || 0
      acc.mortos += dados.mortos || 0
      return acc
    }, { afetados: 0, mortos: 0 }) || { afetados: 0, mortos: 0 }
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER E FILTROS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Registros Recentes</h2>
          <button
            onClick={abrirNovo}
            className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} /> Novo Evento
          </button>
        </div>

        {/* BARRA DE FILTROS DESIGN BONITÃO */}
        <div className="bg-white p-4 rounded-[2rem] border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
            {[
              { id: "TODOS", label: "Todos", icon: ListChecks },
              { id: "ROTINA", label: "Rotina", icon: Globe },
              { id: "ANORMALIDADE", label: "Anormalidade", icon: AlertTriangle },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setFiltroTipo(t.id)
                  if (t.id === "ANORMALIDADE") setFiltroCategoria("TODOS")
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                  filtroTipo === t.id 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {/* SUB-FILTRO DE CATEGORIA (ESCONDIDO EM ANORMALIDADE) */}
          {filtroTipo !== "ANORMALIDADE" && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Origem:</span>
              {[
                { id: "TODOS", label: "Geral", icon: ListChecks },
                { id: "MUNICIPIO", label: "Municípios", icon: MapPin },
                { id: "REDEC", label: "REDEC", icon: Building2 },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFiltroCategoria(c.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
                    filtroCategoria === c.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  <c.icon size={12} /> {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold uppercase text-[10px] tracking-widest bg-white space-y-3">
          <Filter className="mx-auto opacity-20" size={40} />
          <p>Nenhum registro encontrado para este filtro.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {eventosFiltrados.map((ev) => {
            const isAnormal = ev.tipo_registro === "ANORMALIDADE"
            const totais = calcularTotais(ev)

            return (
              <div
                key={ev.id}
                className={`
                  relative p-6 rounded-[2rem] border-2 bg-white transition-all
                  hover:shadow-xl group
                  ${isAnormal ? "border-red-100 hover:border-red-200" : "border-slate-100 hover:border-slate-200"}
                `}
              >
                {/* ... conteúdo do card (mesmo que você já tinha) ... */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => editarEvento(ev)}>
                    
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                        isAnormal ? "bg-red-600 text-white" : "bg-slate-900 text-white"
                      }`}>
                        {ev.tipo_registro}
                      </span>
                      
                      {/* Badge de Categoria para facilitar identificação visual */}
                      <span className="text-[9px] px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-black uppercase tracking-tighter border border-slate-200">
                        {ev.categoria}
                      </span>

                      {ev.tipo_atividade && (
                        <span className="text-[9px] px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-black uppercase tracking-tighter border border-blue-100">
                          {ev.tipo_atividade}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-lg text-slate-800 uppercase leading-tight mb-4">
                      {ev.titulo}
                    </h3>

                    {isAnormal && (
                      <div className="flex gap-6 mb-4 bg-red-50 p-4 rounded-2xl border border-red-100 w-fit">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-red-400 uppercase">Afetados</span>
                          <span className="text-sm font-black text-red-700">{totais.afetados}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-red-400 uppercase">Mortos</span>
                          <span className="text-sm font-black text-red-700">{totais.mortos}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        {formatarData(ev.data_inicio)}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-300" />
                        {nomesMunicipios(ev)}
                      </span>
                      {ev.protocolo_s2id && (
                        <span className="flex items-center gap-2 text-amber-500">
                          <Eye size={14} /> S2ID: {ev.protocolo_s2id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); editarEvento(ev); }}
                      className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmarExclusao(ev.id); }}
                      className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <ModalEvento
          evento={eventoSelecionado}
          municipios={municipios}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            carregarEventos()
            if (onRefresh) onRefresh()
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
