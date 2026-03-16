/* app/(sistema)/monitoramento/componentes/GraficoEstacao.js */
"use client"

import { useEffect, useState, useMemo } from "react"
import {
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, defs, linearGradient, stop
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function GraficoEstacao({ estacao }) {
  const [dados, setDados] = useState([])

  useEffect(() => {
    if (!estacao) return
    async function carregar() {
      const res = await fetch(`/api/historico-estacao?id=${estacao.id}&limit=100`)
      const json = await res.json()
      
      const formatado = json.reverse().map((m) => ({
        hora: new Date(m.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        nivel: m.abaixo_regua ? null : Number(m.nivel),
        timestamp: new Date(m.data_hora).getTime()
      }))
      setDados(formatado)
    }
    carregar()
  }, [estacao])

  // Lógica de Tendência
  const tendencia = useMemo(() => {
    if (dados.length < 2) return { icon: <Minus size={16}/>, texto: "Estável", cor: "text-slate-400" }
    const ultimo = dados[dados.length - 1].nivel
    const anterior = dados[dados.length - 2].nivel
    if (ultimo > anterior) return { icon: <TrendingUp size={16}/>, texto: "Subindo", cor: "text-red-500" }
    if (ultimo < anterior) return { icon: <TrendingDown size={16}/>, texto: "Descendo", cor: "text-green-500" }
    return { icon: <Minus size={16}/>, texto: "Estável", cor: "text-slate-400" }
  }, [dados])

  if (!estacao) return null

  const cota = Number(estacao.nivel_transbordo)
  const alerta = cota ? cota * 0.85 : null
  const ultimoNivel = dados.length > 0 ? dados[dados.length - 1].nivel : 0

  // Cores dinâmicas para o gradiente baseadas no status
  const corGrafico = ultimoNivel >= cota ? "#ef4444" : ultimoNivel >= alerta ? "#facc15" : "#3b82f6"

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 p-6">
      
      {/* HEADER DO GRÁFICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Evolução do Nível</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Últimas 100 leituras</p>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 ${tendencia.cor}`}>
            {tendencia.icon}
            <span className="text-xs font-black uppercase">{tendencia.texto}</span>
          </div>
          <div className="text-right">
            <span className="block text-xs font-black text-slate-400 uppercase tracking-tighter text-[9px]">Nível Atual</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{ultimoNivel?.toFixed(2)}m</span>
          </div>
        </div>
      </div>

      {/* ÁREA DO GRÁFICO */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNivel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={corGrafico} stopOpacity={0.3} />
                <stop offset="95%" stopColor={corGrafico} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="hora" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
              minTickGap={30}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              domain={[0, (dataMax) => Math.max(dataMax, cota * 1.2)]}
            />

            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
            />

            {/* Linhas de Referência Minimalistas */}
            {alerta && (
              <ReferenceLine y={alerta} stroke="#facc15" strokeDasharray="5 5" strokeWidth={1.5} label={{ position: 'right', value: 'ALERTA', fill: '#ca8a04', fontSize: 9, fontWeight: 900 }} />
            )}
            {cota && (
              <ReferenceLine y={cota} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} label={{ position: 'right', value: 'TRANSBORDO', fill: '#b91c1c', fontSize: 9, fontWeight: 900 }} />
            )}

            <Area
              type="monotone"
              dataKey="nivel"
              stroke={corGrafico}
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorNivel)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Tooltip Customizado Estilo Floating Card
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-xl shadow-slate-200/50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-blue-600 leading-none">
          {payload[0].value.toFixed(2)} <span className="text-sm">m</span>
        </p>
      </div>
    )
  }
  return null
}
