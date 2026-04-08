/*  app/(sistema)/agenda/page.js */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

import HeaderAgenda from "./componentes/HeaderAgenda"
import CalendarGrid from "./componentes/CalendarGrid"
import ModalEvento from "./componentes/ModalEvento"

import { Plus } from "lucide-react"

export default function AgendaPage() {
  const [dataAtual, setDataAtual] = useState(new Date())

  const [eventos, setEventos] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)

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

      {/* HEADER PADRÃO */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">
          Agenda Operacional
        </h1>
      </div>

      {/* HEADER CALENDÁRIO */}
      <HeaderAgenda
        dataAtual={dataAtual}
        setDataAtual={setDataAtual}
      />

      {/* CALENDÁRIO */}
      <CalendarGrid
        dataAtual={dataAtual}
        eventos={eventos}
        onSelectEvento={(ev) => {
          setEventoSelecionado(ev)
          setModalOpen(true)
        }}
      />

      {/* BOTÃO FLUTUANTE */}
      <button
        onClick={() => {
          setEventoSelecionado(null) // novo evento
          setModalOpen(true)
        }}
        className="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition"
      >
        <Plus />
      </button>

      {/* MODAL */}
      {modalOpen && (
        <ModalEvento
          evento={eventoSelecionado}
          onClose={() => {
            setModalOpen(false)
            setEventoSelecionado(null)
          }}
          onSaved={() => {
            buscarEventos() // 🔥 ATUALIZA AUTOMÁTICO
            showToast("Evento salvo com sucesso")
          }}
        />
      )}

    </div>
  )
}
