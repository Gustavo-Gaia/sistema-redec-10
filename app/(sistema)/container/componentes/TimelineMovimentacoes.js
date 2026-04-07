/* app/(sistema)/container/componentes/TimelineMovimentacoes.js */

"use client"

import { Package, Truck, Paperclip, Trash2, Pencil } from "lucide-react"
import { useState } from "react"

export default function TimelineMovimentacoes({
  movimentacoes,
  onDelete,
  onEdit
}) {
  const [preview, setPreview] = useState(null)

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">

        <h2 className="text-lg font-semibold">
          Movimentações
        </h2>

        {movimentacoes.length === 0 && (
          <p className="text-gray-500 text-sm">
            Nenhuma movimentação registrada.
          </p>
        )}

        <div className="space-y-4">
          {movimentacoes.map((mov) => {
            const isEntrada = mov.tipo === "ENTRADA"

            return (
              <div
                key={mov.id}
                className="flex items-start gap-4 border-b pb-4 group hover:bg-gray-50 p-2 rounded-lg transition"
              >
                {/* Ícone */}
                <div
                  className={`p-2 rounded-full ${
                    isEntrada ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {isEntrada ? (
                    <Package className="text-green-600" size={18} />
                  ) : (
                    <Truck className="text-red-600" size={18} />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    {new Date(mov.data_hora).toLocaleString()}
                  </p>

                  <p className="font-medium">
                    {mov.origem_destino} — {mov.viatura}
                  </p>

                  <p className="text-sm text-gray-600">
                    Guia: {mov.guia}
                  </p>

                  <p className="text-sm">
                    Colchões: {isEntrada ? "+" : "-"}{mov.colchao_qtd} | Kits: {isEntrada ? "+" : "-"}{mov.kit_dorm_qtd}
                  </p>

                  {/* PDF */}
                  {mov.arquivo_url && (
                    <button
                      onClick={() => setPreview(mov.arquivo_url)}
                      className="flex items-center gap-1 text-blue-600 text-sm mt-1 hover:underline"
                    >
                      <Paperclip size={14} />
                      Visualizar documento
                    </button>
                  )}

                  {mov.observacao && (
                    <p className="text-xs text-gray-500 mt-1">
                      {mov.observacao}
                    </p>
                  )}
                </div>

                {/* AÇÕES */}
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                  
                  <button
                    onClick={() => onEdit(mov)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(mov.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 🔥 MODAL DE PREVIEW PDF */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] p-4 relative">

            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <iframe
              src={preview}
              className="w-full h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}
