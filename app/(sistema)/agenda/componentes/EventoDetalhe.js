/* app/(sistema)/agenda/componentes/EventoDetalhe.js */

"use client"

import { X, Pencil, Trash, Calendar } from "lucide-react"

export default function EventoDetalhe({ evento, onClose, onEdit, onDelete }) {

  if (!evento) return null

  function formatarData(data) {
    const d = new Date(data)

    return (
      d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }) +
      " às " +
      d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">

        {/* HEADER */}
        <div
          className="p-5 text-white"
          style={{ backgroundColor: evento.cor || "#3b82f6" }}
        >
          <div className="flex justify-between items-start">

            {/* TÍTULO */}
            <h2 className="text-xl font-bold leading-tight">
              {evento.titulo}
            </h2>

            <button
              onClick={onClose}
              className="hover:opacity-80 transition"
            >
              <X />
            </button>

          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="p-5 space-y-4 text-sm">

          {/* DESCRIÇÃO */}
          {evento.descricao && (
            <div className="text-gray-600">
              {evento.descricao}
            </div>
          )}

          {/* DATA */}
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={16} />
            <span>
              <strong>Dia(s):</strong> {formatarData(evento.data_inicio)}
            </span>
          </div>

        </div>

        {/* AÇÕES */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">

          <button
            onClick={onDelete}
            className="text-red-600 flex items-center gap-1 hover:opacity-80 transition"
          >
            <Trash size={16} />
            Excluir
          </button>

          <button
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
          >
            <Pencil size={16} />
            Editar
          </button>

        </div>

      </div>
    </div>
  )
}
