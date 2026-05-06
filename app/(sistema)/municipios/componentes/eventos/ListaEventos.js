/* app/(sistema)/municipios/componentes/eventos/ListaEventos.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Calendar, 
  MapPin, 
  Edit3, 
  Trash2,
  Eye
} from "lucide-react"

import ModalEvento from "./ModalEvento"

export default function ListaEventos({ municipios }) {

  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)

  // =============================
  // FETCH (AGORA COM DADOS HUMANOS)
  // =============================
  async function carregarEventos() {
    setLoading(true)

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

    if (error) {
      console.error(error)
      alert("Erro ao carregar eventos")
    }

    setEventos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    carregarEventos()
  }, [])

  // =============================
  // AÇÕES
  // =============================
  function abrirNovo() {
    setEventoSelecionado(null)
    setModalOpen(true)
  }

  function editarEvento(ev) {
    setEventoSelecionado(ev)
    setModalOpen(true)
  }

  async function excluirEvento(id) {
    if (!confirm("Excluir este evento?")) return

    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Erro ao excluir")
    } else {
      carregarEventos()
    }
  }

  // =============================
  // HELPERS
  // =============================
  function formatarData(data) {
    if (!data) return "-"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  function nomesMunicipios(ev) {
    if (ev.fora_area) return "Fora da área da REDEC"

    const lista = ev.eventos_municipios?.map(m => m.municipios?.nome)
    if (!lista || lista.length === 0) return "REDEC / Geral"

    return lista.join(", ")
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

  // =============================
  // UI
  // =============================
  return (
    <div className="space-y-6">

      {/* BOTÃO */}
      <div className="flex justify-end">
        <button
          onClick={abrirNovo}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl"
        >
          Novo Evento
        </button>
      </div>

      {/* LISTA */}
      {loading ? (
        <p className="text-center text-slate-400">Carregando...</p>
      ) : eventos.length === 0 ? (
        <div className="text-center py-10 border rounded-2xl text-slate-400">
          Nenhum evento cadastrado
        </div>
      ) : (
        <div className="space-y-4">

          {eventos.map((ev) => {

            const isAnormal = ev.tipo_registro === "ANORMALIDADE"
            const totais = calcularTotais(ev)

            return (
              <div
                key={ev.id}
                className={`
                  relative p-5 rounded-2xl border bg-white transition-all
                  hover:shadow-lg cursor-pointer
                  ${isAnormal 
                    ? "border-red-200 bg-red-50/40" 
                    : "border-slate-200"}
                `}
              >

                {/* FAIXA LATERAL */}
                {isAnormal && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-l-2xl" />
                )}

                <div className="flex justify-between items-start gap-4">

                  {/* CONTEÚDO */}
                  <div
                    className="flex-1"
                    onClick={() => editarEvento(ev)}
                  >

                    {/* BADGES */}
                    <div className="flex gap-2 mb-2 flex-wrap">

                      <span className={`
                        text-[10px] px-2 py-1 rounded-full font-bold
                        ${isAnormal 
                          ? "bg-red-600 text-white" 
                          : "bg-slate-200 text-slate-600"}
                      `}>
                        {ev.tipo_registro}
                      </span>

                      {ev.tipo_atividade && (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
                          {ev.tipo_atividade}
                        </span>
                      )}

                    </div>

                    {/* TÍTULO */}
                    <h3 className="font-bold text-lg text-slate-800">
                      {ev.titulo}
                    </h3>

                    {/* 🔥 DADOS HUMANOS */}
                    {isAnormal && (
                      <div className="flex gap-4 mt-3 border-t border-red-100 pt-3 text-[11px] font-bold text-red-700">
                        <div>
                          <span className="opacity-60">AFETADOS:</span> {totais.afetados}
                        </div>
                        <div>
                          <span className="opacity-60">MORTOS:</span> {totais.mortos}
                        </div>
                      </div>
                    )}

                    {/* INFO */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">

                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatarData(ev.data_inicio)}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {nomesMunicipios(ev)}
                      </span>

                      {ev.protocolo_s2id && (
                        <span className="flex items-center gap-1 text-amber-600 font-mono">
                          <Eye size={12} />
                          {ev.protocolo_s2id}
                        </span>
                      )}

                    </div>

                  </div>

                  {/* AÇÕES */}
                  <div className="flex gap-2">

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        editarEvento(ev)
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        excluirEvento(ev.id)
                      }}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

              </div>
            )
          })}

        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <ModalEvento
          evento={eventoSelecionado}
          municipios={municipios}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            carregarEventos()
            setModalOpen(false)
          }}
        />
      )}

    </div>
  )
}
