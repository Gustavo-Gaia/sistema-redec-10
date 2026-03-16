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
  ReferenceLine,
  Area,
  AreaChart
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


  if (!estacao) return null


  const cota = estacao.nivel_transbordo

  const alerta = cota ? (cota * 0.85).toFixed(2) : null
  const transbordo = cota
  const extremo = cota ? (cota * 1.2).toFixed(2) : null


  return (

    <div className="bg-white border rounded-xl shadow-sm p-5 md:p-6">

      <div className="flex items-center justify-between mb-4">

        <h3 className="text-lg font-bold text-slate-800">
          Evolução do Nível do Rio
        </h3>

        <span className="text-xs text-slate-400">
          Últimas medições
        </span>

      </div>


      <div className="w-full h-72 md:h-80">

        <ResponsiveContainer>

          <AreaChart data={dados}>

            <defs>

              {/* degradê do rio */}

              <linearGradient id="colorNivel" x1="0" y1="0" x2="0" y2="1">

                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>

                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>

              </linearGradient>

            </defs>


            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="hora"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}
              formatter={(value) => `${value} m`}
            />


            {/* LINHA ALERTA */}

            {alerta && (

              <ReferenceLine
                y={alerta}
                stroke="#facc15"
                strokeDasharray="6 6"
                label="Alerta (85%)"
              />

            )}


            {/* LINHA TRANSBORDO */}

            {transbordo && (

              <ReferenceLine
                y={transbordo}
                stroke="#ef4444"
                strokeDasharray="6 6"
                label="Transbordo"
              />

            )}


            {/* LINHA EXTREMO */}

            {extremo && (

              <ReferenceLine
                y={extremo}
                stroke="#9333ea"
                strokeDasharray="6 6"
                label="Extremo"
              />

            )}


            {/* ÁREA DO RIO */}

            <Area
              type="monotone"
              dataKey="nivel"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#colorNivel)"
              dot={false}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}
