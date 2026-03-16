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
  Dot
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


  /* CÁLCULOS HIDROLÓGICOS */

  const cota = Number(estacao.nivel_transbordo)

  const alerta = cota ? cota * 0.85 : null
  const transbordo = cota || null
  const extremo = cota ? cota * 1.2 : null


  const ultimoNivel =
    dados.length > 0 ? dados[dados.length - 1].nivel : null


  /* LABEL CUSTOMIZADO */

  const LabelLinha = ({ viewBox, texto, cor }) => {

    const { x, width, y } = viewBox

    return (

      <g>

        <rect
          x={x + width - 120}
          y={y - 10}
          width="115"
          height="20"
          fill="white"
          rx="4"
        />

        <text
          x={x + width - 110}
          y={y + 4}
          fill={cor}
          fontSize="11"
          fontWeight="600"
        >
          {texto}
        </text>

      </g>

    )

  }


  /* PONTO DESTACADO DO NÍVEL ATUAL */

  const CustomDot = (props) => {

    const { cx, cy, index } = props

    if (index !== dados.length - 1) return null

    return (

      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#2563eb"
        stroke="#ffffff"
        strokeWidth={2}
      />

    )

  }


  return (

    <div className="bg-white border rounded-xl shadow-sm p-5 md:p-6">

      <div className="flex items-center justify-between mb-4">

        <h3 className="text-lg font-bold text-slate-800">
          Evolução do Nível do Rio
        </h3>

        {ultimoNivel && (
          <span className="text-sm font-semibold text-blue-600">
            Nível atual: {ultimoNivel.toFixed(2)} m
          </span>
        )}

      </div>


      <div className="w-full h-72 md:h-80">

        <ResponsiveContainer>

          <AreaChart data={dados}>

            <defs>

              <linearGradient id="colorNivel" x1="0" y1="0" x2="0" y2="1">

                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />

                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />

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
              domain={[0, extremo ? extremo * 1.1 : "auto"]}
            />


            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}
              formatter={(value) => `${value} m`}
            />


            {/* ALERTA */}

            {alerta && (

              <ReferenceLine
                y={alerta}
                stroke="#facc15"
                strokeDasharray="6 6"
                strokeWidth={2}
                label={(props) =>
                  <LabelLinha
                    {...props}
                    texto={`ALERTA (${alerta.toFixed(2)} m)`}
                    cor="#ca8a04"
                  />
                }
              />

            )}


            {/* TRANSBORDO */}

            {transbordo && (

              <ReferenceLine
                y={transbordo}
                stroke="#ef4444"
                strokeDasharray="6 6"
                strokeWidth={2}
                label={(props) =>
                  <LabelLinha
                    {...props}
                    texto={`TRANSBORDO (${transbordo.toFixed(2)} m)`}
                    cor="#dc2626"
                  />
                }
              />

            )}


            {/* EXTREMO */}

            {extremo && (

              <ReferenceLine
                y={extremo}
                stroke="#9333ea"
                strokeDasharray="6 6"
                strokeWidth={2}
                label={(props) =>
                  <LabelLinha
                    {...props}
                    texto={`EXTREMO (${extremo.toFixed(2)} m)`}
                    cor="#7e22ce"
                  />
                }
              />

            )}


            {/* NÍVEL DO RIO */}

            <Area
              type="monotone"
              dataKey="nivel"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#colorNivel)"
              dot={<CustomDot />}
              isAnimationActive={true}
              animationDuration={800}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}
