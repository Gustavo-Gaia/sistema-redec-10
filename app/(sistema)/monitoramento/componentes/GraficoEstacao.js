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


  /* COMPONENTE DE LABEL CUSTOMIZADO */

  const LabelLinha = ({ value, viewBox, texto, cor }) => {

    const { x, width, y } = viewBox

    return (
      <g>
        <rect
          x={x + width - 90}
          y={y - 10}
          width="85"
          height="20"
          fill="white"
          rx="4"
        />
        <text
          x={x + width - 80}
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

            {/* DEGRADÊ DO RIO */}

            <defs>

              <linearGradient id="colorNivel" x1="0" y1="0" x2="0" y2="1">

                <stop
                  offset="5%"
                  stopColor="#2563eb"
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor="#2563eb"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>


            {/* GRID */}

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />


            {/* EIXOS */}

            <XAxis
              dataKey="hora"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, extremo ? extremo * 1.1 : "auto"]}
            />


            {/* TOOLTIP */}

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
                strokeWidth={2}
                label={(props) =>
                  <LabelLinha
                    {...props}
                    texto="ALERTA (85%)"
                    cor="#ca8a04"
                  />
                }
              />
            )}


            {/* LINHA TRANSBORDO */}

            {transbordo && (
              <ReferenceLine
                y={transbordo}
                stroke="#ef4444"
                strokeDasharray="6 6"
                strokeWidth={2}
                label={(props) =>
                  <LabelLinha
                    {...props}
                    texto="TRANSBORDO"
                    cor="#dc2626"
                  />
                }
              />
            )}


            {/* LINHA EXTREMO */}

            {extremo && (
              <ReferenceLine
                y={extremo}
                stroke="#9333ea"
                strokeDasharray="6 6"
                strokeWidth={2}
                label={(props) =>
                  <LabelLinha
                    {...props}
                    texto="EXTREMO"
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
              dot={false}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}
