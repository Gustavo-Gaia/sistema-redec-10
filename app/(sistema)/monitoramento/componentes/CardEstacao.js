/* app/(sistema)/monitoramento/componentes/CardEstacao.js */
"use client"

import { useEffect, useState } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import { calcularSituacao } from "../utils/calcularSituacao"

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
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
        Selecione uma estação para exibir o monitoramento.
      </div>
    )
  }

  const situacao = calcularSituacao(estacaoSelecionada, medicao)
  const cota = estacaoSelecionada.nivel_transbordo
  const percentual = (medicao && !medicao.abaixo_regua && cota) ? (medicao.nivel / cota) * 100 : 0
  
  // Limpeza do Nome do Rio
  const nomeRio = estacaoSelecionada.nome_rio || estacaoSelecionada.rio_id || "—"

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
      
      {/* CABEÇALHO */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900">{estacaoSelecionada.municipio}</h3>
          <p className="text-slate-500 font-medium">{nomeRio}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${situacao.cor} text-white shadow-sm`}>
          {situacao.texto}
        </div>
      </div>

      {/* DASHBOARD PRINCIPAL */}
      <div className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* INDICADOR VISUAL (Substituindo a régua antiga) */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
              strokeDasharray={364} 
              strokeDashoffset={364 - (Math.min(percentual, 100) / 100 * 364)}
              className={situacao.cor.replace('bg-', 'text-')}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="block text-2xl font-black text-slate-900">{percentual.toFixed(0)}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">da cota</span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          {[
            { label: "Nível Atual", value: medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel} m` : "—" },
            { label: "Cota Limite", value: cota ? `${cota} m` : "—" },
            { label: "Fonte", value: "INEA" },
            { label: "Atualizado", value: medicao?.data_hora ? new Date(medicao.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--" }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.label}</p>
              <p className="text-sm font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
