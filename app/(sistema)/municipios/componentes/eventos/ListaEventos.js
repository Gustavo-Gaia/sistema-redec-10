/* app/(sistema)/municipios/componentes/eventos/ListaEventos.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Calendar, MapPin } from "lucide-react"
import ModalEvento from "./ModalEvento"

export default function ListaEventos({ municipios }) {

  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)

  async function carregarEventos() {
    setLoading(true)

    const { data } = await supabase
      .from("eventos")
      .select(`
        *,
        eventos_municipios (
          municipio_id,
          municipios (nome)
        )
      `)
      .order("data_inicio", { ascending: false })

    setEventos(data || [])
    setLoading(false)
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

  return (
    <div className="space-y-6">

      {/* BOTÃO */}
      <div className="flex justify-end">
        <button
          onClick={abrirNovo}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={16} />
          Novo Evento
        </button>
      </div>

      {/* LISTA */}
      {loading ? (
        <p className="text-center text-slate-400">Carregando...</p>
      ) : (
        <div className="grid gap-4">

          {eventos.map((ev) => (
            <div
              key={ev.id}
              onClick={() => editarEvento(ev)}
              className="p-5 bg-white rounded-2xl border hover:border-blue-300 cursor-pointer transition-all shadow-sm"
            >
              <h3 className="font-black text-slate-800 uppercase">
                {ev.titulo}
              </h3>

              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Calendar size={12} />
                {ev.data_inicio || "-"} até {ev.data_fim || "-"}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {ev.eventos_municipios?.map((m, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold flex items-center gap-1"
                  >
                    <MapPin size={10} />
                    {m.municipios?.nome}
                  </span>
                ))}
              </div>
            </div>
          ))}

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
