/* app/(sistema)/monitoramento/componentes/GraficoEstacao.js */
"use client"

import { useEffect, useState, useMemo } from "react"
import {
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  ReferenceLine, Area, AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react"

export default function GraficoEstacao({ estacao }) {

  const [dados, setDados] = useState([])
  const [periodo, setPeriodo] = useState("24h")
  const [loading, setLoading] = useState(false)

  const filtros = {
    "24h": { label: "Últimas 24h" },
    "7d": { label: "Últimos 7 dias" },
    "30d": { label: "Últimos 30 dias" },
    "total": { label: "Histórico completo" }
  }

  useEffect(() => {
    if (!estacao) return

    async function carregar() {
      setLoading(true)

      try {
        const res = await fetch(
          `/api/historico-estacao?id=${estacao.id}&periodo=${periodo}`
        )

        const json = await res.json()

        const formatado = json.map((m) => {
          const dataObj = new Date(m.data_hora)

          return {
            labelEixo:
              periodo === "24h"
                ? dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                : dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),

            nivel: Number(m.nivel), // 🔥 SEM depender de abaixo_regua
            fullDate: dataObj.toLocaleString("pt-BR")
          }
        })

        setDados(formatado)

      } catch (err) {
        console.error("Erro ao carregar gráfico:", err)
      } finally {
        setLoading(false)
      }
    }

    carregar()

  }, [estacao, periodo])

  // 🔥 Tendência segura (ignora null/undefined)
  const tendencia = useMemo(() => {
    const validos = dados.filter(d => d.nivel !== null && d.nivel !== undefined)

    if (validos.length < 2) {
      return { icon: <Minus size={16}/>, texto: "Estável", cor: "text-slate-400" }
    }

    const ultimo = validos[validos.length - 1].nivel
    const anterior = validos[validos.length - 2].nivel

    if (ultimo > anterior) return { icon: <TrendingUp size={16}/>, texto: "Subindo", cor: "text-red-500" }
    if (ultimo < anterior) return { icon: <TrendingDown size={16}/>, texto: "Descendo", cor: "text-green-500" }

    return { icon: <Minus size={16}/>, texto: "Estável", cor: "text-slate-400" }
  }, [dados])

  if (!estacao) return null

  const cotaTransbordo = Number(estacao.nivel_transbordo)
  const cotaAlerta = cotaTransbordo ? cotaTransbordo * 0.85 : null
  const cotaExtremo = cotaTransbordo ? cotaTransbordo * 1.2 : null

  const renderLabel = (texto, valor, cor) => ({
    position: 'top',
    offset: 10,
    fill: cor,
    fontSize: 10,
    fontWeight: 900,
    value: `${texto} (${valor.toFixed(2)}m)`
  })

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl p-6 relative">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">

        <div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            Evolução do Nível
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {filtros[periodo].label}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">

          {/* BOTÕES */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {Object.keys(filtros).map((f) => (
              <button
                key={f}
                onClick={() => setPeriodo(f)}
                className={`
                  px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-colors
                  ${periodo === f
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'}
                `}
              >
                {f}
              </button>
            ))}
          </div>

          {/* TENDÊNCIA */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border ${tendencia.cor}`}>
            {tendencia.icon}
            <span className="text-xs font-black uppercase">{tendencia.texto}</span>
          </div>

        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-[2rem] z-10">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* GRÁFICO */}
      <div className="w-full h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados}>

            <defs>
              <linearGradient id="colorNivelFix" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="labelEixo"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              minTickGap={periodo === "24h" ? 30 : 50}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              domain={[
                0,
                (dataMax) => Math.max(dataMax || 0, cotaExtremo ? cotaExtremo * 1.1 : 5)
              ]}
            />

            <Tooltip content={<CustomTooltip />} />

            {cotaAlerta && (
              <ReferenceLine y={cotaAlerta} stroke="#facc15" strokeDasharray="5 5" label={renderLabel("Alerta", cotaAlerta, "#ca8a04")} />
            )}

            {cotaTransbordo && (
              <ReferenceLine y={cotaTransbordo} stroke="#ef4444" strokeDasharray="5 5" label={renderLabel("Transbordo", cotaTransbordo, "#b91c1c")} />
            )}

            {cotaExtremo && (
              <ReferenceLine y={cotaExtremo} stroke="#9333ea" strokeDasharray="5 5" label={renderLabel("Extremo", cotaExtremo, "#7e22ce")} />
            )}

            <Area
              type="monotone"
              dataKey="nivel"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorNivelFix)"
              animationDuration={800}
              connectNulls
            />

          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border p-3 rounded-xl shadow">
        <p className="text-[10px] font-bold text-slate-400">
          {payload[0].payload.fullDate}
        </p>
        <p className="text-lg font-black text-blue-600">
          {payload[0].value?.toFixed(2)} m
        </p>
      </div>
    )
  }
  return null
}
