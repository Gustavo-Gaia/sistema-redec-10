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
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 text-center text-slate-400">
        Selecione uma estação para exibir o monitoramento.
      </div>
    )
  }

  const situacao = calcularSituacao(estacaoSelecionada, medicao)
  const cota = estacaoSelecionada.nivel_transbordo
  const percentual = (medicao && !medicao.abaixo_regua && cota) ? (medicao.nivel / cota) * 100 : 0

  // Limpeza do nome do rio (sem duplicar "Rio")
  const nomeRio = estacaoSelecionada.nome_rio?.replace(/^Rio\s*/i, "") || "—"

  // Definição de cores diretas para o SVG
  const corSituacao = situacao.cor === "bg-green-500" ? "#16a34a"
                    : situacao.cor === "bg-yellow-400" ? "#facc15"
                    : situacao.cor === "bg-red-500" ? "#ef4444"
                    : situacao.cor === "bg-purple-600" ? "#9333ea"
                    : "#9ca3af" // fallback neutro

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 md:gap-0">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">{estacaoSelecionada.municipio}</h3>
          <p className="text-slate-500 font-medium text-sm md:text-base">Rio {nomeRio}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest ${situacao.cor} text-white shadow`}>
          {situacao.texto}
        </div>
      </div>

      {/* DASHBOARD PRINCIPAL */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">

        {/* INDICADOR CIRCULAR */}
        <div className="relative w-36 h-36 md:w-40 md:h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Fundo neutro */}
            <circle cx="64" cy="64" r="58" stroke="#e5e7eb" strokeWidth="8" fill="transparent" />
            {/* Barra de progresso */}
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke={corSituacao}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={364}
              strokeDashoffset={364 - (Math.min(percentual, 120) / 120 * 364)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="block text-2xl md:text-3xl font-black text-slate-900">{percentual.toFixed(0)}%</span>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">da cota</span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          {[
            { label: "Nível Atual", value: medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel} m` : "—" },
            { label: "Cota Limite", value: cota ? `${cota} m` : "—" },
            { label: "Fonte", value: "INEA" },
            { label: "Atualizado", value: medicao?.data_hora ? new Date(medicao.data_hora).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) : "--:--" }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
              <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider">{item.label}</p>
              <p className="text-sm md:text-base font-extrabold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-2 md:gap-0">
        <span className="text-xs md:text-sm text-slate-400 italic">Fonte: INEA</span>
        <span className="text-xs md:text-sm text-slate-400">Monitoramento hidrológico</span>
      </div>

    </div>
  )
}
