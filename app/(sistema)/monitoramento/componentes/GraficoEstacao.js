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

  // Configuração pragmática dos filtros
  const filtros = {
    "24h": { limit: 24, label: "Últimas 24h" },
    "7d": { limit: 168, label: "Últimos 7 dias" },
    "30d": { limit: 300, label: "Últimos 30 dias (Amostra)" }
  }

  useEffect(() => {
    if (!estacao) return
    async function carregar() {
      setLoading(true)
      try {
        const limit = filtros[periodo].limit
        const res = await fetch(`/api/historico-estacao?id=${estacao.id}&limit=${limit}`)
        const json = await res.json()
        
        const formatado = json.reverse().map((m) => {
          const dataObj = new Date(m.data_hora)
          return {
            // Se for 24h, mostra HH:mm. Se for mais, mostra DD/MM
            labelEixo: periodo === "24h" 
              ? dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
              : dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            nivel: m.abaixo_regua ? null : Number(m.nivel),
            fullDate: dataObj.toLocaleString("pt-BR")
          }
        })
        setDados(formatado)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [estacao, periodo])

  const tendencia = useMemo(() => {
    if (dados.length < 2) return { icon: <Minus size={16}/>, texto: "Estável", cor: "text-slate-400" }
    const ultimo = dados[dados.length - 1].nivel
    const anterior = dados[dados.length - 2].nivel
    if (ultimo > anterior) return { icon: <TrendingUp size={16}/>, texto: "Subindo", cor: "text-red-500" }
    if (ultimo < anterior) return { icon: <TrendingDown size={16}/>, texto: "Descendo", cor: "text-green-500" }
    return { icon: <Minus size={16}/>, texto: "Estável", cor: "text-slate-400" }
  }, [dados])

  if (!estacao) return null

  const cotaTransbordo = Number(estacao.nivel_transbordo)
  const cotaAlerta = cotaTransbordo ? cotaTransbordo * 0.85 : null
  const cotaExtremo = cotaTransbordo ? cotaTransbordo * 1.2 : null
  const ultimoNivel = dados.length > 0 ? dados[dados.length - 1].nivel : 0

  const renderLabel = (texto, valor, cor) => ({
    position: 'top',
    offset: 10,
    fill: cor,
    fontSize: 10,
    fontWeight: 900,
    className: "uppercase tracking-tighter",
    value: `${texto} (${valor.toFixed(2)}m)`
  })

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl p-6 transition-all duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Evolução Histórica
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filtros[periodo].label}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Botões de Filtro */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {Object.keys(filtros).map((f) => (
              <button
                key={f}
                onClick={() => setPeriodo(f)}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all 
                  ${periodo === f ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 ${tendencia.cor}`}>
            {tendencia.icon}
            <span className="text-xs font-black uppercase">{tendencia.texto}</span>
          </div>
        </div>
      </div>

      <div className={`w-full h-80 transition-opacity duration-300 ${loading ? 'opacity-30' : 'opacity-100'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
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
              domain={[0, (dataMax) => Math.max(dataMax, cotaExtremo ? cotaExtremo * 1.1 : 5)]}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />

            {cotaAlerta && <ReferenceLine y={cotaAlerta} stroke="#facc15" strokeDasharray="5 5" strokeWidth={2} label={renderLabel("Alerta", cotaAlerta, "#ca8a04")} />}
            {cotaTransbordo && <ReferenceLine y={cotaTransbordo} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} label={renderLabel("Transbordo", cotaTransbordo, "#b91c1c")} />}
            {cotaExtremo && <ReferenceLine y={cotaExtremo} stroke="#9333ea" strokeDasharray="5 5" strokeWidth={2} label={renderLabel("Extremo", cotaExtremo, "#7e22ce")} />}

            <Area
              type="monotone"
              dataKey="nivel"
              stroke="#2563eb"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorNivelFix)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {payload[0].payload.fullDate}
        </p>
        <p className="text-xl font-black text-blue-600 leading-none">
          {payload[0].value.toFixed(2)} <span className="text-sm">m</span>
        </p>
      </div>
    )
  }
  return null
}
