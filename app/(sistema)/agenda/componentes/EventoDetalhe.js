/* app/(sistema)/agenda/componentes/EventoDetalhe.js */

"use client"

import { X, Pencil, Trash } from "lucide-react"

export default function EventoDetalhe({ evento, onClose, onEdit, onDelete }) {

  if (!evento) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div
          className="p-4 text-white"
          style={{ backgroundColor: evento.cor || "#3b82f6" }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs opacity-80">
                {evento.tipo || "ATIVIDADE"}
              </p>
              <h2 className="text-lg font-bold">
                {evento.titulo}
              </h2>
            </div>

            <button onClick={onClose}>
              <X />
            </button>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="p-4 space-y-3 text-sm">

          {evento.descricao && (
            <p className="text-gray-600">
              {evento.descricao}
            </p>
          )}

          <p>
            <strong>Data:</strong>{" "}
            {new Date(evento.data_inicio).toLocaleString()}
          </p>

        </div>

        {/* AÇÕES */}
        <div className="flex justify-between p-4 border-t">

          <button
            onClick={onDelete}
            className="text-red-600 flex items-center gap-1"
          >
            <Trash size={16} />
            Excluir
          </button>

          <button
            onClick={onEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"
          >
            <Pencil size={16} />
            Editar
          </button>

        </div>

      </div>
    </div>
  )
}
