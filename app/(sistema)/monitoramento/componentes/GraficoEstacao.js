/* app/(sistema)/monitoramento/componentes/GraficoEstacao.js */
"use client"

import { useEffect, useState, useMemo } from "react"
import {
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  ReferenceLine, Area, AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function GraficoEstacao({ estacao }) {
  const [dados, setDados] = useState([])

  useEffect(() => {
    if (!estacao) return
    async function carregar() {
      // Carrega as últimas 100 leituras para o histórico
      const res = await fetch(`/api/historico-estacao?id=${estacao.id}&limit=100`)
      const json = await res.json()
      
      const formatado = json.reverse().map((m) => ({
        // Formata a hora para exibir no eixo X
        hora: new Date(m.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        nivel: m.abaixo_regua ? null : Number(m.nivel),
        timestamp: new Date(m.data_hora).getTime() // Útil para ordenação se necessário
      }))
      setDados(formatado)
    }
    carregar()
  }, [estacao])

  // Lógica de Tendência (compara o último com o penúltimo registro)
  const tendencia = useMemo(() => {
    if (dados.length < 2) return { icon: <Minus size={16}/>, texto: "Estável", cor: "text-slate-400" }
    const ultimo = dados[dados.length - 1].nivel
    const anterior = dados[dados.length - 2].nivel
    if (ultimo > anterior) return { icon: <TrendingUp size={16}/>, texto: "Subindo", cor: "text-red-500" }
    if (ultimo < anterior) return { icon: <TrendingDown size={16}/>, texto: "Descendo", cor: "text-green-500" }
    return { icon: <Minus size={16}/>, texto: "Estável", cor: "text-slate-400" }
  }, [dados])

  if (!estacao) return null

  // Cálculos Hidrológicos
  const cotaTransbordo = Number(estacao.nivel_transbordo)
  const cotaAlerta = cotaTransbordo ? cotaTransbordo * 0.85 : null
  const cotaExtremo = cotaTransbordo ? cotaTransbordo * 1.2 : null
  const ultimoNivel = dados.length > 0 ? dados[dados.length - 1].nivel : 0

  // Gradiente Fixo Voltou (Cor Azul Padrão do Sistema)
  const corFixaGrafico = "#2563eb"

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 p-6">
      
      {/* HEADER DO GRÁFICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Evolução Histórica do Nível</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Últimas 100 leituras do sensor</p>
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
          <AreaChart data={dados} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <defs>
              {/* Gradiente Fixo para consistência visual */}
              <linearGradient id="colorNivelFix" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={corFixaGrafico} stopOpacity={0.3} />
                <stop offset="95%" stopColor={corFixaGrafico} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="hora" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
              minTickGap={25}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              // Garante que a cota extrema e um pouco acima estejam visíveis
              domain={[0, (dataMax) => Math.max(dataMax, cotaExtremo ? cotaExtremo * 1.1 : 0)]}
            />

            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
            />

            {/* Linhas de Referência Hidrológicas (Fixas no Layout) */}
            {cotaAlerta && (
              <ReferenceLine y={cotaAlerta} stroke="#facc15" strokeDasharray="5 5" strokeWidth={1.5}>
                <LabelLinha texto="ALERTA" cor="#ca8a04" value={`${cotaAlerta.toFixed(2)}m`} />
              </ReferenceLine>
            )}
            {cotaTransbordo && (
              <ReferenceLine y={cotaTransbordo} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5}>
                <LabelLinha texto="TRANSBORDO" cor="#b91c1c" value={`${cotaTransbordo.toFixed(2)}m`} />
              </ReferenceLine>
            )}
            {cotaExtremo && (
              <ReferenceLine y={cotaExtremo} stroke="#9333ea" strokeDasharray="5 5" strokeWidth={1.5}>
                <LabelLinha texto="EXTREMO" cor="#7e22ce" value={`${cotaExtremo.toFixed(2)}m`} />
              </ReferenceLine>
            )}

            <Area
              type="monotone"
              dataKey="nivel"
              stroke={corFixaGrafico}
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorNivelFix)" // Usando o gradiente fixo
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Sub-componente para os Tooltips flutuantes (Glassmorphism)
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

// Sub-componente para renderizar os labels Fixos sobre as linhas de referência
function LabelLinha({ texto, cor, value, viewBox }) {
  const { x, width } = viewBox;
  return (
    <text 
      x={x + width - 5} // Fixado na extrema direita do gráfico
      y={viewBox.y - 8} // Levemente acima da linha
      textAnchor="end" // Alinhado à direita
      fill={cor}
      className="text-[10px] font-black uppercase tracking-tighter"
    >
      {texto} ({value})
    </text>
  );
}
