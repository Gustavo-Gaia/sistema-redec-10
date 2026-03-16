/* app/(sistema)/monitoramento/componentes/CardEstacao.js */
"use client"

import { useEffect, useState, useMemo } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import { calcularSituacao } from "../utils/calcularSituacao"
import { Waves, Clock, Database, MapPin, Activity } from "lucide-react"

export default function CardEstacao() {
  const { estacaoSelecionada } = useMonitoramento()
  const [medicao, setMedicao] = useState(null)

  useEffect(() => {
    if (!estacaoSelecionada) return
    async function carregar() {
      const res = await fetch(`/api/historico-estacao?id=${estacaoSelecionada.id}&limit=1`)
      const dados = await res.json()
      setMedicao(dados?.[0] || null)
    }
    carregar()
  }, [estacaoSelecionada])

  // Cálculos e cores memoizados para performance
  const { situacao, percentual, corHex } = useMemo(() => {
    if (!estacaoSelecionada) return {}
    
    const sit = calcularSituacao(estacaoSelecionada, medicao)
    const cota = estacaoSelecionada.nivel_transbordo
    const perc = (medicao && !medicao.abaixo_regua && cota) ? (medicao.nivel / cota) * 100 : 0
    
    const cores = {
      "Normal": "#10b981",
      "Alerta": "#facc15",
      "Transbordo": "#ef4444",
      "Extremo": "#9333ea"
    }

    return { 
      situacao: sit, 
      percentual: perc, 
      corHex: cores[sit.texto] || "#3b82f6"
    }
  }, [estacaoSelecionada, medicao])

  if (!estacaoSelecionada) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-400">
        Selecione uma estação para ativar o monitoramento.
      </div>
    )
  }

  const strokeDash = 364
  const offset = strokeDash - (Math.min(percentual, 120) / 120 * strokeDash)

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-6 md:p-10 transition-all duration-500 hover:shadow-slate-300/50">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Activity size={14} className="animate-pulse" />
            Dados em Tempo Real
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {estacaoSelecionada.municipio}
          </h3>
          <p className="text-lg text-slate-400 font-medium italic">
            {/* Trazendo o nome exatamente como está no banco (ex: "Rio Muriaé") */}
            {estacaoSelecionada.nome_rio || estacaoSelecionada.rio_id || "—"}
          </p>
        </div>

        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-sm transition-colors duration-500 ${situacao.cor} text-white`}>
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="font-black uppercase tracking-widest text-xs">{situacao.texto}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-center">
        
        {/* GAUGE CIRCULAR */}
        <div className="relative group">
          {/* Aura de status ao fundo */}
          <div 
            className="absolute inset-0 rounded-full blur-3xl opacity-15 transition-all duration-1000"
            style={{ backgroundColor: corHex }}
          />
          
          <svg className="w-44 h-44 transform -rotate-90 relative z-10">
            <circle cx="64" cy="64" r="58" stroke="#f8fafc" strokeWidth="10" fill="transparent" />
            <circle
              cx="64" cy="64" r="58"
              stroke={corHex}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={strokeDash}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
              style={{ filter: `drop-shadow(0 0 4px ${corHex}66)` }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="flex items-baseline">
              <span className="text-4xl font-black text-slate-900">{percentual.toFixed(0)}</span>
              <span className="text-sm font-bold text-slate-400 ml-0.5">%</span>
            </div>
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-0.5 text-center px-4">
              Capacidade da Cota
            </span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <MetricCard 
            label="Nível Atual" 
            value={medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel}m` : "—"} 
            icon={<Waves className="text-blue-500" size={16} />}
            isMain={true}
          />
          <MetricCard 
            label="Transbordo" 
            value={`${estacaoSelecionada.nivel_transbordo || "—"}m`} 
            icon={<Database className="text-slate-400" size={16} />}
          />
          <MetricCard 
            label="Leitura" 
            value={medicao?.data_hora ? new Date(medicao.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"} 
            icon={<Clock className="text-slate-400" size={16} />}
          />
          <MetricCard 
            label="Status" 
            value="Estável" 
            icon={<div className="w-2 h-2 rounded-full bg-green-500" />}
          />
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">
        <span>Fonte: INEA / ANA</span>
        <span>REDEC 10 - ESTADO DO RIO DE JANEIRO</span>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon, isMain = false }) {
  return (
    <div className={`p-5 rounded-[1.5rem] border transition-all duration-300 hover:shadow-md ${isMain ? 'bg-blue-50/40 border-blue-100' : 'bg-slate-50/50 border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  )
}
