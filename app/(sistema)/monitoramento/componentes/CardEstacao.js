/* app/(sistema)/monitoramento/componentes/CardEstacao.js */
"use client"

import { useMonitoramento } from "../MonitoramentoContext"
import { Waves, Clock, Database, Activity, ShieldCheck } from "lucide-react"

export default function CardEstacao() {
  const { estacaoAtual } = useMonitoramento()

  // 1. Estado Vazio: Caso nenhuma estação esteja selecionada
  if (!estacaoAtual) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center text-slate-400">
        Selecione uma estação para monitorar.
      </div>
    )
  }

  const { situacao, percentual, medicao } = estacaoAtual

  const coresHex = {
    "Normal": "#10b981",
    "Alerta": "#facc15",
    "Transbordo": "#ef4444",
    "Extremo": "#9333ea",
    "Abaixo da régua": "#64748b",
    "Sem cota de transbordo": "#94a3b8"
  }

  const corHex = coresHex[situacao.texto] || "#3b82f6"
  const circunferencia = 471
  
  // ✅ CORREÇÃO LÓGICA: O Gauge deve preencher até 100%. 
  // Se o rio transbordar (ex: 120%), o círculo deve continuar cheio, não resetar.
  const valorParaGauge = Math.min(Math.max(percentual, 0), 100)
  const offset = circunferencia - (valorParaGauge / 100 * circunferencia)

  // 2. Formatador de Tempo: Transforma o ISO do banco em algo legível
  const formatarDataHora = (isoString) => {
    if (!isoString) return { data: "--/--", hora: "--:--" }
    const d = new Date(isoString)
    return {
      data: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const leitura = formatarDataHora(medicao?.data_hora)

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 p-6 md:p-10">
      
      {/* CABEÇALHO COM STATUS PULSANTE */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Activity size={14} className="animate-pulse" />
            Dados em Tempo Real
          </div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">
            {estacaoAtual.municipio}
          </h3>
          <p className="text-xl text-slate-400 font-medium italic uppercase">
            {estacaoAtual.rios?.nome || "—"}
          </p>
        </div>

        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-sm ${situacao.cor} text-white`}>
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="font-black uppercase tracking-widest text-xs">{situacao.texto}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-center">
        
        {/* 3. GAUGE CIRCULAR (O "Termômetro" do Rio) */}
        <div className="relative flex items-center justify-center w-44 h-44">
          <div className="absolute inset-0 rounded-full blur-3xl opacity-10" style={{ backgroundColor: corHex }} />
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="88" cy="88" r="75" stroke="#f8fafc" strokeWidth="12" fill="transparent" />
            <circle
              cx="88" cy="88" r="75"
              stroke={corHex} strokeWidth="12" fill="transparent"
              strokeDasharray={circunferencia}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="flex items-baseline">
              <span className="text-4xl font-black text-slate-900">{percentual > 0 ? percentual.toFixed(0) : "0"}</span>
              <span className="text-lg font-bold text-slate-400 ml-0.5">%</span>
            </div>
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">Capacidade</span>
          </div>
        </div>

        {/* 4. GRID DE MÉTRICAS */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <MetricCard 
            label="Nível Atual" 
            value={medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel}m` : "—"} 
            icon={<Waves className="text-blue-500" size={16} />}
            isMain={true}
          />
          <MetricCard 
            label="Cota Transbordo" 
            value={`${estacaoAtual.nivel_transbordo || "—"}m`} 
            icon={<Database className="text-slate-400" size={16} />}
          />
          
          <MetricCard 
            label="Última Leitura" 
            value={
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{leitura.hora}</span>
                <span className="text-sm font-bold text-slate-400">{leitura.data}</span>
              </div>
            } 
            icon={<Clock className="text-slate-400" size={16} />}
          />

          <MetricCard 
            label="Fonte da Estação" 
            value={estacaoAtual.fonte || "—"} 
            icon={<ShieldCheck className="text-green-500" size={16} />}
          />
        </div>
      </div>
    </div>
  )
}

// 5. Sub-componente para os cards menores (Evita repetição de código)
function MetricCard({ label, value, icon, isMain = false }) {
  return (
    <div className={`p-6 rounded-[1.8rem] border transition-all duration-300 ${isMain ? 'bg-blue-50/40 border-blue-100 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-900 tracking-tight">
        {value}
      </div>
    </div>
  )
}
