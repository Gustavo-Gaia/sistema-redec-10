/* app/(sistema)/municipios/componentes/eventos/ListaEventos.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Calendar, 
  MapPin, 
  Edit3, 
  Trash2,
  Eye,
  Plus
} from "lucide-react"

import ModalEvento from "./ModalEvento"

// Recebemos onDelete e onRefresh do componente pai (page.js)
export default function ListaEventos({ municipios, onDelete, onRefresh }) {

  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)

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

  function abrirNovo() {
    setEventoSelecionado(null)
    setModalOpen(true)
  }

  function editarEvento(ev) {
    setEventoSelecionado(ev)
    setModalOpen(true)
  }

  // Modificado para usar a função que vem do page.js
  async function confirmarExclusao(id) {
    if (onDelete) {
      await onDelete(id) // Chama a função do pai
      carregarEventos()  // Atualiza a lista local
    }
  }

  function formatarData(data) {
    if (!data) return "-"
    // Ajuste para evitar que a data mude por causa do fuso horário
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

      <div className="flex justify-between items-center">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Registros Recentes</h2>
        <button
          onClick={abrirNovo}
          className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold uppercase text-xs tracking-widest bg-white">
          Nenhum evento cadastrado na REDEC 10
        </div>
      ) : (
        <div className="grid gap-4">
          {eventos.map((ev) => {
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
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => editarEvento(ev)}>
                    
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                        isAnormal ? "bg-red-600 text-white" : "bg-slate-900 text-white"
                      }`}>
                        {ev.tipo_registro}
                      </span>

                      {ev.tipo_atividade && (
                        <span className="text-[9px] px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-black uppercase tracking-tighter">
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
                          <Eye size={14} />
                          S2ID: {ev.protocolo_s2id}
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
            if (onRefresh) onRefresh() // Avisa o page.js que algo mudou
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
