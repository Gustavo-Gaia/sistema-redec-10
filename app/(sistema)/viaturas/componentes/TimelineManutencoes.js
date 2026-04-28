/* app/(sistema)/viaturas/componentes/TimelineManutencoes.js */

"use client"

import { Wrench, Trash2, Pencil, Calendar, Car } from "lucide-react"

export default function TimelineManutencoes({
  manutencoes,
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

  return (
    <div className="bg-white rounded-3xl shadow-sm border overflow-hidden flex flex-col h-full">

      {/* HEADER */}
      <div className="bg-slate-50 border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">
          Histórico de Manutenções
        </h2>

        <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded-full uppercase">
          {manutencoes.length} registros
        </span>
      </div>

      {/* LISTA */}
      <div className="p-4 space-y-3 overflow-y-auto">

        {manutencoes.length === 0 && (
          <div className="text-center py-10">
            <Wrench className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-slate-500 text-sm italic">
              Nenhuma manutenção registrada.
            </p>
          </div>
        )}

        {manutencoes.map((m) => (
          <div
            key={m.id}
            className="group bg-white border rounded-2xl p-4 hover:shadow-md transition"
          >
            <div className="flex items-start gap-4">

              {/* ÍCONE */}
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Wrench size={20} />
              </div>

              {/* CONTEÚDO */}
              <div className="flex-1">

                {/* DATA */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                  <Calendar size={12} />
                  {formatarData(m.data)}
                </div>

                {/* TÍTULO */}
                <h3 className="font-bold text-slate-800">
                  OS: {m.numero_os || "—"}
                </h3>

                {/* VIATURA */}
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Car size={14} />
                  {m.viaturas?.prefixo || "Viatura não encontrada"}
                </p>

                {/* INFO */}
                <div className="mt-2 text-sm text-slate-600 space-y-1">

                  <p>
                    <strong>Execução:</strong>{" "}
                    {m.execucao || "-"}
                  </p>

                  <p>
                    <strong>Odômetro:</strong>{" "}
                    {m.odometro || "-"} km
                  </p>

                  <p>
                    <strong>Motivo:</strong>{" "}
                    {m.motivo || "-"}
                  </p>

                </div>

                {/* OBS */}
                {m.observacao && (
                  <p className="mt-2 text-xs text-slate-500 italic bg-slate-50 p-2 rounded">
                    "{m.observacao}"
                  </p>
                )}
              </div>

              {/* AÇÕES */}
              <div className="flex flex-col gap-1">

                <button
                  onClick={() => onEdit(m)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => onDelete(m.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
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
