/* app/(sistema)/monitoramento/componentes/GraficoEstacao.js */

"use client"

import { useEffect, useState } from "react"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"

export default function GraficoEstacao({ estacao }) {

  const [dados, setDados] = useState([])

  useEffect(() => {

    if (!estacao) return

    async function carregar() {

      const res = await fetch(
        `/api/historico-estacao?id=${estacao.id}&limit=100`
      )

      const json = await res.json()

      const formatado = json
        .reverse()
        .map((m) => ({

          hora: new Date(m.data_hora).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          }),

          nivel: m.abaixo_regua ? null : m.nivel

        }))

      setDados(formatado)

    }

    carregar()

  }, [estacao])

  return (

    <div className="bg-white border rounded-xl shadow-sm p-5 md:p-6">

      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Evolução do Nível do Rio
      </h3>

      <div className="w-full h-72 md:h-80">

        <ResponsiveContainer>

          <LineChart data={dados}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="hora" tick={{ fontSize: 12 }} />

            <YAxis tick={{ fontSize: 12 }} />

            <Tooltip formatter={(value) => `${value} m`} />

            {/* LINHA DO RIO */}

            <Line
              type="monotone"
              dataKey="nivel"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
            />

            {/* COTA DE TRANSBORDO */}

            {estacao?.nivel_transbordo && (

              <ReferenceLine
                y={estacao.nivel_transbordo}
                stroke="#ef4444"
                strokeDasharray="6 6"
                label="Cota de Transbordo"
              />

            )}

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}
