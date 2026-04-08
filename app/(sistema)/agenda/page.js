/* app/(sistema)/agenda/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

import HeaderAgenda from "./componentes/HeaderAgenda"
import CalendarGrid from "./componentes/CalendarGrid"
import ModalEvento from "./componentes/ModalEvento"
import EventoDetalhe from "./componentes/EventoDetalhe"

import { Plus } from "lucide-react"

export default function AgendaPage() {

  const [dataAtual, setDataAtual] = useState(new Date())

  const [eventos, setEventos] = useState([])

  // 🔥 NOVO: MODO (mes | semana)
  const [modo, setModo] = useState("mes")

  // MODAL
  const [modalOpen, setModalOpen] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)

  // DETALHE
  const [eventoDetalhe, setEventoDetalhe] = useState(null)

  const [toast, setToast] = useState(null)

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // 🔥 BUSCAR EVENTOS
  async function buscarEventos() {
    const { data, error } = await supabase
      .from("agenda_eventos")
      .select("*")
      .order("data_inicio", { ascending: true })

    if (error) {
      console.error(error)
      showToast("Erro ao buscar eventos", "error")
      return
    }

    setEventos(data || [])
  }

  useEffect(() => {
    buscarEventos()
  }, [])

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded-lg text-white z-50 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">
          Agenda Operacional
        </h1>
      </div>

      {/* 🔥 HEADER COM MODO */}
      <HeaderAgenda
        dataAtual={dataAtual}
        setDataAtual={setDataAtual}
        modo={modo}
        setModo={setModo}
      />

      {/* 🔥 CALENDÁRIO (AGORA DINÂMICO) */}
      <CalendarGrid
        dataAtual={dataAtual}
        eventos={eventos}
        modo={modo}
        onSelectEvento={(ev) => {
          setEventoDetalhe(ev)
        }}
      />

      {/* BOTÃO NOVO EVENTO */}
      <button
        onClick={() => {
          setEventoSelecionado(null)
          setModalOpen(true)
        }}
        className="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition"
      >
        <Plus />
      </button>

      {/* 🔥 DETALHE DO EVENTO */}
      {eventoDetalhe && (
        <EventoDetalhe
          evento={eventoDetalhe}
          onClose={() => setEventoDetalhe(null)}

          onEdit={() => {
            setEventoSelecionado(eventoDetalhe)
            setEventoDetalhe(null)
            setModalOpen(true)
          }}

          onDelete={async () => {
            if (!confirm("Deseja excluir este evento?")) return

            const { error } = await supabase
              .from("agenda_eventos")
              .delete()
              .eq("id", eventoDetalhe.id)

            if (error) {
              showToast("Erro ao excluir", "error")
              return
            }

            showToast("Evento excluído")
            setEventoDetalhe(null)
            buscarEventos()
          }}
        />
      )}

      {/* MODAL */}
      {modalOpen && (
        <ModalEvento
          evento={eventoSelecionado}
          onClose={() => {
            setModalOpen(false)
            setEventoSelecionado(null)
          }}
          onSaved={() => {
            buscarEventos()
            showToast("Evento salvo com sucesso")
          }}
        />
      )}

    </div>
  )
}
