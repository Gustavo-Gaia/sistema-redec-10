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
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 shadow-sm">
        Selecione uma estação para exibir o monitoramento.
      </div>
    )
  }

  const situacao = calcularSituacao(estacaoSelecionada, medicao)
  const cota = estacaoSelecionada.nivel_transbordo
  const percentual = (medicao && !medicao.abaixo_regua && cota) ? (medicao.nivel / cota) * 100 : 0

  const nomeRio = estacaoSelecionada.nome_rio || estacaoSelecionada.rio_id || "—"

  // Definição de cores para ticks
  const coresTicks = {
    alerta: "#facc15",
    transbordo: "#ef4444",
    extremo: "#9333ea"
  }

  // Percentuais para ticks
  const ticks = {
    alerta: 85,
    transbordo: 100,
    extremo: 120
  }

  // Limite do círculo
  const percCircle = Math.min(percentual, 120)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 md:p-8 w-full">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 md:gap-0">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900">{estacaoSelecionada.municipio}</h3>
          <p className="text-slate-500 font-medium">{nomeRio}</p>
        </div>
        <div className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${situacao.cor} text-white shadow-md`}>
          {situacao.texto}
        </div>
      </div>

      {/* DASHBOARD */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">

        {/* INDICADOR CIRCULAR */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Fundo do círculo */}
            <circle cx="64" cy="64" r="58" stroke="#e5e7eb" strokeWidth="8" fill="transparent" />
            {/* Barra de nível */}
            <circle
              cx="64"
              cy="64"
              r="58"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={364}
              strokeDashoffset={364 - (percCircle / 120 * 364)}
              strokeLinecap="round"
              className={situacao.cor.replace("bg-", "text-")}
            />
            {/* Ticks */}
            {Object.entries(ticks).map(([key, value]) => (
              <line
                key={key}
                x1="64"
                y1="6"
                x2="64"
                y2="14"
                stroke={coresTicks[key]}
                strokeWidth="3"
                transform={`rotate(${(value / 120) * 360} 64 64)`}
              />
            ))}
          </svg>
          <div className="absolute text-center">
            <span className="block text-3xl font-extrabold text-slate-900 drop-shadow-sm">{percentual.toFixed(0)}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">da cota</span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-2 gap-4 w-full">
          {[
            { label: "Nível Atual", value: medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel} m` : "—" },
            { label: "Cota Limite", value: cota ? `${cota} m` : "—" },
            { label: "Fonte", value: "INEA" },
            { label: "Atualizado", value: medicao?.data_hora ? new Date(medicao.data_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--" }
          ].map((item, idx) => (
            <div key={idx} className="bg-gradient-to-r from-white to-slate-50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{item.label}</p>
              <p className="text-sm font-extrabold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 italic">
        <span>Fonte: INEA</span>
        <span>Monitoramento hidrológico</span>
      </div>

    </div>
  )
}
