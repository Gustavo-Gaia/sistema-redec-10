/* app/(sistema)/monitoramento/componentes/CardEstacao.js */
"use client"

import { useEffect, useState, useMemo } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import { calcularSituacao } from "../utils/calcularSituacao"
import { FaClock, FaInfoCircle } from "react-icons/fa"

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

  if (!estacaoSelecionada) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 shadow-sm">
        Selecione uma estação para exibir o monitoramento.
      </div>
    )
  }

  const situacao = calcularSituacao(estacaoSelecionada, medicao)
  const cota = estacaoSelecionada.nivel_transbordo

  const percentual = useMemo(() => {
    if (medicao && !medicao.abaixo_regua && cota) {
      return (medicao.nivel / cota) * 100
    }
    return 0
  }, [medicao, cota])

  // Limpeza do Nome do Rio
  const nomeRio = estacaoSelecionada.nome_rio || estacaoSelecionada.rio_id || "—"

  // Cores do indicador circular por status
  const statusColors = {
    normal: "text-green-500",
    alerta: "text-yellow-400",
    transbordo: "text-red-500",
    extremo: "text-purple-600"
  }

  const corIndicador = statusColors[situacao.texto.toLowerCase()] || "text-slate-400"

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 md:p-8">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900">{estacaoSelecionada.municipio}</h3>
          <p className="text-sm italic text-slate-500 mt-1">{nomeRio}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${situacao.cor} text-white`}>
          {situacao.texto}
        </div>
      </div>

      {/* DASHBOARD PRINCIPAL */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        
        {/* INDICADOR CIRCULAR */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* CÍRCULO DE FUNDO */}
            <circle cx="64" cy="64" r="58" stroke="#e5e7eb" strokeWidth="8" fill="transparent" />
            {/* CÍRCULO DO NÍVEL */}
            <circle 
              cx="64" 
              cy="64" 
              r="58" 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="transparent" 
              strokeDasharray={364} 
              strokeDashoffset={364 - Math.min(percentual, 100) / 100 * 364} 
              className={corIndicador} 
              strokeLinecap="round"
            />
            {/* TICKS DE REFERÊNCIA */}
            <line x1="64" y1="6" x2="64" y2="0" stroke="#facc15" strokeWidth="2" transform="rotate(306 64 64)"/> {/* 85% */}
            <line x1="64" y1="6" x2="64" y2="0" stroke="#ef4444" strokeWidth="2" transform="rotate(360 64 64)"/> {/* 100% */}
            <line x1="64" y1="6" x2="64" y2="0" stroke="#9333ea" strokeWidth="2" transform="rotate(432 64 64)"/> {/* 120% */}
          </svg>
          <div className="absolute text-center">
            <span className="block text-2xl font-extrabold text-slate-900">{percentual.toFixed(0)}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">da cota</span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          {[
            { label: "Nível Atual", value: medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel} m` : "—", icon: <FaInfoCircle className="inline mr-1 text-slate-400"/> },
            { label: "Cota Limite", value: cota ? `${cota} m` : "—", icon: <FaInfoCircle className="inline mr-1 text-slate-400"/> },
            { label: "Fonte", value: "INEA", icon: <FaInfoCircle className="inline mr-1 text-slate-400"/> },
            { label: "Atualizado", value: medicao?.data_hora ? new Date(medicao.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--", icon: <FaClock className="inline mr-1 text-slate-400"/> }
          ].map((item, idx) => (
            <div key={idx} className="bg-gradient-to-b from-slate-50 to-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center">{item.icon}{item.label}</p>
              <p className="text-sm md:text-base font-bold text-slate-900 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
