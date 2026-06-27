/* app/(sistema)/monitoramento/abas/incendios/FiltrosIncendio.js */

"use client"

import { Flame, Calendar, MapPin, Eye } from "lucide-react"

import {
  useMonitoramentoIncendios
} from "./MonitoramentoIncendiosContext"

const meses = [
  { value: 0, nome: "Todos" },
  { value: 1, nome: "Janeiro" },
  { value: 2, nome: "Fevereiro" },
  { value: 3, nome: "Março" },
  { value: 4, nome: "Abril" },
  { value: 5, nome: "Maio" },
  { value: 6, nome: "Junho" },
  { value: 7, nome: "Julho" },
  { value: 8, nome: "Agosto" },
  { value: 9, nome: "Setembro" },
  { value: 10, nome: "Outubro" },
  { value: 11, nome: "Novembro" },
  { value: 12, nome: "Dezembro" }
]

export default function FiltrosIncendio() {

  const {
    filtros,
    setFiltros,
    municipiosDisponiveis,
    anosDisponiveis,
    ocorrenciasFiltradas
  } = useMonitoramentoIncendios()

  function alterarFiltro(campo, valor) {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">

      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-red-600" size={20} />

        <h3 className="font-bold text-slate-800">
          Filtros de Monitoramento
        </h3>

        <span className="ml-auto text-sm text-slate-500">
          {ocorrenciasFiltradas.length} ocorrências encontradas
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* ANO */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-2">
            <Calendar size={14} />
            Ano
          </label>

          <select
            value={filtros.ano}
            onChange={(e) =>
              alterarFiltro(
                "ano",
                Number(e.target.value)
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              p-3
              text-sm
              font-medium
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          >
            <option value={0}>Todos</option>

            {anosDisponiveis.map((ano) => (
              <option
                key={ano}
                value={ano}
              >
                {ano}
              </option>
            ))}
          </select>
        </div>

        {/* MÊS */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-2">
            <Calendar size={14} />
            Mês
          </label>

          <select
            value={filtros.mes}
            onChange={(e) =>
              alterarFiltro(
                "mes",
                Number(e.target.value)
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              p-3
              text-sm
              font-medium
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          >
            {meses.map((mes) => (
              <option
                key={mes.value}
                value={mes.value}
              >
                {mes.nome}
              </option>
            ))}
          </select>
        </div>

        {/* MUNICÍPIO */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-2">
            <MapPin size={14} />
            Município
          </label>

          <select
            value={filtros.municipio}
            onChange={(e) =>
              alterarFiltro(
                "municipio",
                e.target.value
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              p-3
              text-sm
              font-medium
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          >
            <option value="">
              Todos
            </option>

            {municipiosDisponiveis.map((municipio) => (
              <option
                key={municipio}
                value={municipio}
              >
                {municipio}
              </option>
            ))}
          </select>
        </div>

        {/* VISUALIZAÇÃO */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase mb-2">
            <Eye size={14} />
            Visualização
          </label>

          <select
            value={filtros.visualizacao}
            onChange={(e) =>
              alterarFiltro(
                "visualizacao",
                e.target.value
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              p-3
              text-sm
              font-medium
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          >
            <option value="pontos">
              Pontos
            </option>

            <option value="heatmap">
              Heatmap
            </option>

            <option value="ambos">
              Ambos
            </option>
          </select>
        </div>

      </div>

    </div>
  )
}
