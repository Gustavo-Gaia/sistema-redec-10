/* app/(sistema)/container/componentes/TimelineMovimentacoes.js */

import { Package, Truck, Paperclip } from "lucide-react"

export default function TimelineMovimentacoes({ movimentacoes }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">

      <h2 className="text-lg font-semibold">
        Movimentações
      </h2>

      <div className="space-y-4">
        {movimentacoes.map((mov) => {
          const isEntrada = mov.tipo === "ENTRADA"

          return (
            <div
              key={mov.id}
              className="flex items-start gap-4 border-b pb-4"
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
                  <a
                    href={mov.arquivo_url}
                    target="_blank"
                    className="flex items-center gap-1 text-blue-600 text-sm mt-1"
                  >
                    <Paperclip size={14} />
                    Ver documento
                  </a>
                )}

                {mov.observacao && (
                  <p className="text-xs text-gray-500 mt-1">
                    {mov.observacao}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
