/* app/(sistema)/viaturas/componentes/TimelineMultas.js */

"use client"

import { FileWarning, Trash2, Pencil, Calendar, Car } from "lucide-react"

export default function TimelineMultas({
  multas,
  onDelete,
  onEdit
}) {

  function formatarData(dataISO) {
    if (!dataISO) return "Data não informada"

    try {
      const [ano, mes, dia] = dataISO.split("-")
      return `${dia}/${mes}/${ano}`
    } catch {
      return "Data inválida"
    }
  }

  function formatarValor(valor) {
    if (!valor) return "R$ 0,00"
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border overflow-hidden flex flex-col h-full">

      {/* HEADER */}
      <div className="bg-slate-50 border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">
          Multas
        </h2>

        <span className="text-xs font-bold px-2 py-1 bg-slate-200 rounded-full">
          {multas.length} registros
        </span>
      </div>

      {/* LISTA */}
      <div className="p-4 space-y-3 overflow-y-auto">

        {multas.length === 0 && (
          <div className="text-center py-10">
            <FileWarning className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-slate-500 text-sm italic">
              Nenhuma multa registrada.
            </p>
          </div>
        )}

        {multas.map((m) => (
          <div
            key={m.id}
            className="group border rounded-2xl p-4 hover:shadow-md transition"
          >
            <div className="flex gap-4">

              {/* ÍCONE */}
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <FileWarning size={20} />
              </div>

              {/* CONTEÚDO */}
              <div className="flex-1">

                <div className="text-xs text-slate-400 flex gap-2 items-center">
                  <Calendar size={12} />
                  {formatarData(m.data_infracao)}
                  {m.hora && ` - ${m.hora}`}
                </div>

                <h3 className="font-bold text-slate-800">
                  {formatarValor(m.valor)}
                </h3>

                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Car size={14} />
                  {m.viaturas?.prefixo || "—"}
                </p>

                <div className="text-sm mt-2 space-y-1">
                  <p><strong>Local:</strong> {m.local || "-"}</p>
                  <p><strong>Órgão:</strong> {m.orgao || "-"}</p>
                  <p><strong>Status:</strong> {m.status || "-"}</p>
                </div>

                {m.observacao && (
                  <p className="text-xs mt-2 italic bg-slate-50 p-2 rounded">
                    "{m.observacao}"
                  </p>
                )}
              </div>

              {/* AÇÕES */}
              <div className="flex flex-col gap-1">
                <button onClick={() => onEdit(m)}>
                  <Pencil size={18} />
                </button>
                <button onClick={() => onDelete(m.id)}>
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
