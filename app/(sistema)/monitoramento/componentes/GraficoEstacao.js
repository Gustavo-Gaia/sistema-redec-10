/* app/(sistema)/monitoramento/componentes/GraficoEstacao.js */

"use client"

import { useEffect, useState } from "react"

import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ReferenceArea
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

          nivel: m.abaixo_regua ? null : Number(m.nivel)

        }))

      setDados(formatado)

    }

    carregar()

  }, [estacao])


  if (!estacao) return null


  const cota = Number(estacao.nivel_transbordo)

  const alerta = cota ? cota * 0.85 : null
  const transbordo = cota || null
  const extremo = cota ? cota * 1.2 : null


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

              <linearGradient id="colorNivel" x1="0" y1="0" x2="0" y2="1">

                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>

                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>

              </linearGradient>

            </defs>


            {/* ZONAS DE RISCO */}

            {alerta && (
              <ReferenceArea y1={0} y2={alerta} fill="#22c55e" fillOpacity={0.08}/>
            )}

            {alerta && transbordo && (
              <ReferenceArea y1={alerta} y2={transbordo} fill="#facc15" fillOpacity={0.08}/>
            )}

            {transbordo && extremo && (
              <ReferenceArea y1={transbordo} y2={extremo} fill="#ef4444" fillOpacity={0.08}/>
            )}

            {extremo && (
              <ReferenceArea y1={extremo} y2={extremo * 1.3} fill="#9333ea" fillOpacity={0.08}/>
            )}


            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="hora"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, extremo ? extremo * 1.3 : "auto"]}
            />


            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}
              formatter={(value) => `${value} m`}
            />


            {/* LINHAS DE REFERÊNCIA */}

            {alerta && (
              <ReferenceLine
                y={alerta}
                stroke="#facc15"
                strokeDasharray="6 6"
                strokeWidth={2}
                label="Alerta"
              />
            )}

            {transbordo && (
              <ReferenceLine
                y={transbordo}
                stroke="#ef4444"
                strokeDasharray="6 6"
                strokeWidth={2}
                label="Transbordo"
              />
            )}

            {extremo && (
              <ReferenceLine
                y={extremo}
                stroke="#9333ea"
                strokeDasharray="6 6"
                strokeWidth={2}
                label="Extremo"
              />
            )}


            {/* NÍVEL DO RIO */}

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
