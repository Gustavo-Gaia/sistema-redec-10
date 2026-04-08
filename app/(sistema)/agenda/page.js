/*  app/(sistema)/agenda/page.js */

"use client"

import { useState } from "react"

import HeaderAgenda from "./componentes/HeaderAgenda"
import CalendarGrid from "./componentes/CalendarGrid"
import ModalEvento from "./componentes/ModalEvento"

import { Plus } from "lucide-react"

export default function AgendaPage() {
  const [dataAtual, setDataAtual] = useState(new Date())

  const [modalOpen, setModalOpen] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)

  return (
    <div className="p-6 space-y-6">

      {/* HEADER PADRÃO (igual container) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-2xl text-white">
        <h1 className="text-2xl font-bold">
          Agenda Operacional
        </h1>
      </div>

      {/* HEADER DO CALENDÁRIO */}
      <HeaderAgenda
        dataAtual={dataAtual}
        setDataAtual={setDataAtual}
      />

      {/* GRID */}
      <CalendarGrid
        dataAtual={dataAtual}
        eventos={[]} // vazio por enquanto
        onSelectEvento={(ev) => {
          setEventoSelecionado(ev)
          setModalOpen(true)
        }}
      />

      {/* BOTÃO FLUTUANTE (igual container) */}
      <button
        onClick={() => {
          setEventoSelecionado(null)
          setModalOpen(true)
        }}
        className="fixed bottom-20 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50"
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
        />
      )}

    </div>
  )
}
