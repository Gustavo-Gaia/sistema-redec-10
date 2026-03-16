/* app/(sistema)/monitoramento/componentes/CardEstacao.js */
"use client"

import { useEffect, useState, useMemo } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import { calcularSituacao } from "../utils/calcularSituacao"
import { Waves, Clock, Database, Activity, ShieldCheck } from "lucide-react"

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

  const { situacao, percentual, corHex } = useMemo(() => {
    if (!estacaoSelecionada) return { situacao: { texto: "—", cor: "bg-slate-200" }, percentual: 0, corHex: "#e2e8f0" }
    
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
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center text-slate-400">
        Selecione uma estação para monitorar.
      </div>
    )
  }

  const strokeDash = 364
  const offset = strokeDash - (Math.min(percentual, 120) / 120 * strokeDash)

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 p-6 md:p-10">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Activity size={14} className="animate-pulse" />
            Dados em Tempo Real
          </div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {estacaoSelecionada.municipio}
          </h3>
          <p className="text-xl text-slate-400 font-medium italic uppercase tracking-wide">
            {estacaoSelecionada.nome_rio || "—"}
          </p>
        </div>

        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-sm ${situacao.cor} text-white`}>
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="font-black uppercase tracking-widest text-xs">{situacao.texto}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-center">
        
        {/* GAUGE CIRCULAR - TEXTO SEPARADO DO SVG PARA NÃO SOBREPOR */}
        <div className="relative flex items-center justify-center w-44 h-44">
          <div 
            className="absolute inset-0 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: corHex }}
          />
          
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="88" cy="88" r="75" stroke="#f8fafc" strokeWidth="12" fill="transparent" />
            <circle
              cx="88" cy="88" r="75"
              stroke={corHex}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={471} // Ajustado para o novo raio de 75
              strokeDashoffset={471 - (Math.min(percentual, 120) / 120 * 471)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="flex items-baseline">
              <span className="text-4xl font-black text-slate-900 leading-none">{percentual.toFixed(0)}</span>
              <span className="text-lg font-bold text-slate-400 ml-0.5">%</span>
            </div>
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">
              Capacidade
            </span>
          </div>
        </div>

        {/* MÉTRICAS - FONTE DINÂMICA INTEGRADA */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <MetricCard 
            label="Nível Atual" 
            value={medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel}m` : "—"} 
            icon={<Waves className="text-blue-500" size={16} />}
            isMain={true}
          />
          <MetricCard 
            label="Cota Transbordo" 
            value={`${estacaoSelecionada.nivel_transbordo || "—"}m`} 
            icon={<Database className="text-slate-400" size={16} />}
          />
          <MetricCard 
            label="Última Leitura" 
            value={medicao?.data_hora ? new Date(medicao.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"} 
            icon={<Clock className="text-slate-400" size={16} />}
          />
          <MetricCard 
            label="Fonte da Estação" 
            value={estacaoSelecionada.fonte || "INEA"} 
            icon={<ShieldCheck className="text-green-500" size={16} />}
          />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon, isMain = false }) {
  return (
    <div className={`p-6 rounded-[1.8rem] border transition-all duration-300 ${isMain ? 'bg-blue-50/40 border-blue-100 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  )
}
