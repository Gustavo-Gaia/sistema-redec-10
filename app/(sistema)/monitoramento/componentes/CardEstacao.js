/* app/(sistema)/monitoramento/componentes/CardEstacao.js */
"use client"

import { useEffect, useState, useMemo } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import { calcularSituacao } from "../utils/calcularSituacao"
import { Clock, Database, MapPin, Waves } from "lucide-react" // Assumindo Lucide React (padrão Next.js)

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

  // Cálculos Memoizados para Performance
  const { situacao, percentual, posicao, nomeRioLimpo } = useMemo(() => {
    if (!estacaoSelecionada) return {}
    
    const sit = calcularSituacao(estacaoSelecionada, medicao)
    const cota = estacaoSelecionada.nivel_transbordo
    const perc = (medicao && !medicao.abaixo_regua && cota) ? (medicao.nivel / cota) * 100 : 0
    
    // Limpeza inteligente do nome do Rio
    const rawRio = estacaoSelecionada.nome_rio || estacaoSelecionada.rio_id || "—"
    const limpo = rawRio.toString().replace(/^(rio\s+)/i, "")

    return {
      situacao: sit,
      percentual: perc,
      posicao: Math.min(perc, 120),
      nomeRioLimpo: limpo
    }
  }, [estacaoSelecionada, medicao])

  if (!estacaoSelecionada) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
        Selecione uma estação para iniciar o monitoramento em tempo real.
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 md:p-10 overflow-hidden">
      
      {/* CABEÇALHO PROFISSIONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {estacaoSelecionada.municipio}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-slate-500 italic">
            <Waves size={16} className="text-blue-500" />
            <span className="text-lg">Rio {nomeRioLimpo}</span>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 px-5 py-2 rounded-full border-2 ${situacao.cor.replace('bg-', 'border-').replace('-500', '-200')} ${situacao.cor.replace('bg-', 'bg-')}/10`}>
          <div className={`w-3 h-3 rounded-full animate-pulse ${situacao.cor}`} />
          <span className={`font-black uppercase tracking-tighter text-sm ${situacao.cor.replace('bg-', 'text-')}`}>
            {situacao.texto}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-center">
        
        {/* INDICADOR CIRCULAR COM TICKS */}
        <div className="relative group">
          <svg className="w-48 h-48 transform -rotate-90 drop-shadow-md">
            {/* Fundo do Trilho */}
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
            
            {/* Ticks de Referência (85%, 100%, 120%) */}
            {[85, 100].map((tick) => (
              <line
                key={tick}
                x1="184" y1="96" x2="196" y2="96"
                transform={`rotate(${(tick / 100) * 360} 96 96)`}
                stroke={tick === 100 ? "#ef4444" : "#eab308"}
                strokeWidth="3"
              />
            ))}

            {/* Barra de Progresso Sólida */}
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
              strokeDasharray={553} 
              strokeDashoffset={553 - (Math.min(percentual, 100) / 100 * 553)}
              className={`${situacao.cor.replace('bg-', 'text-')} transition-all duration-1000 ease-in-out`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-slate-900">{percentual.toFixed(0)}%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacidade</span>
          </div>
        </div>

        {/* MÉTRICAS COM PROFUNDIDADE */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <MetricBox 
            icon={<MapPin size={14}/>} 
            label="Nível Atual" 
            value={medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel} m` : "—"} 
            highlight 
          />
          <MetricBox 
            icon={<Database size={14}/>} 
            label="Cota de Transbordo" 
            value={`${estacaoSelecionada.nivel_transbordo || "—"} m`} 
          />
          <MetricBox 
            icon={<Clock size={14}/>} 
            label="Última Leitura" 
            value={medicao?.data_hora ? new Date(medicao.data_hora).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "--:--"} 
          />
          <MetricBox 
            icon={<Database size={14}/>} 
            label="Fonte de Dados" 
            value="INEA / Governo RJ" 
          />
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-100 flex justify-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Sistema Integrado de Monitoramento REDEC 10
        </p>
      </div>
    </div>
  )
}

// Sub-componente para manter o código limpo
function MetricBox({ label, value, icon, highlight = false }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${highlight ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-1 text-slate-400">
        {icon}
        <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
      </div>
      <p className={`text-xl font-black ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  )
}
