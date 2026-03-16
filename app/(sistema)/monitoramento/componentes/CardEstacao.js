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
      const res = await fetch(
        `/api/historico-estacao?id=${estacaoSelecionada.id}&limit=1`
      )
      const dados = await res.json()
      setMedicao(dados?.[0] || null)
    }

    carregar()
  }, [estacaoSelecionada])

  if (!estacaoSelecionada) {
    return (
      <div className="bg-white border rounded-xl p-6 text-center text-slate-500">
        Selecione um rio e município para visualizar a estação.
      </div>
    )
  }

  const situacao = calcularSituacao(estacaoSelecionada, medicao)
  const cota = estacaoSelecionada.nivel_transbordo
  let percentual = null
  if (medicao && !medicao.abaixo_regua && cota) {
    percentual = (medicao.nivel / cota) * 100
  }

  const posicao = percentual ? Math.min(percentual, 120) : 0

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 md:p-7 transition-shadow hover:shadow-2xl">
      
      {/* CABEÇALHO */}
      <div className="mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800">
          {estacaoSelecionada.municipio}
        </h3>
        <p className="text-sm md:text-base text-slate-500">
          Rio {estacaoSelecionada.nome_rio || estacaoSelecionada.rio_id || "—"}
        </p>
      </div>

      {/* GRID DE INFORMAÇÕES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        
        {/* STATUS */}
        <div>
          <div className="text-xs md:text-sm text-slate-500 mb-1 uppercase tracking-wide">
            Status
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${situacao.cor}`} />
            <span className="font-semibold text-slate-800">{situacao.texto}</span>
          </div>
        </div>

        {/* NÍVEL */}
        <div>
          <div className="text-xs md:text-sm text-slate-500 mb-1 uppercase tracking-wide">
            Nível Atual
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-800">
            {medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel} m` : "—"}
          </div>
        </div>

        {/* PERCENTUAL */}
        <div>
          <div className="text-xs md:text-sm text-slate-500 mb-1 uppercase tracking-wide">
            Percentual da Cota
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-800">
            {percentual ? `${percentual.toFixed(0)}%` : "—"}
          </div>
        </div>

        {/* COTA */}
        <div>
          <div className="text-xs md:text-sm text-slate-500 mb-1 uppercase tracking-wide">
            Cota de Transbordo
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-800">
            {cota ? `${cota} m` : "—"}
          </div>
        </div>
      </div>

      {/* RÉGUA HIDROLÓGICA */}
      {percentual && (
        <div className="mt-6">

          {/* ESCALA COM LABELS */}
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>0 m</span>
            <span>{cota} m</span>
          </div>

          {/* BARRA DE NÍVEL */}
          <div className="relative h-6">
            <div className="absolute top-2 w-full h-2 bg-slate-200 rounded-full" />

            {/* BARRA DE NÍVEL COM DEGRADÊ */}
            <div
              className="absolute top-2 h-2 rounded-full transition-all duration-700"
              style={{
                width: `${posicao}%`,
                background: `linear-gradient(to right, #10b981, #facc15, #ef4444, #9333ea)`
              }}
            />

            {/* MARCADOR DO NÍVEL */}
            <div
              className="absolute top-0 w-5 h-5 bg-white border-2 border-slate-600 rounded-full shadow-md transition-all duration-700"
              style={{ left: `calc(${posicao}% - 10px)` }}
            />

            {/* TICKS DE REFERÊNCIA */}
            <div className="absolute top-0 left-[85%] h-4 w-px bg-yellow-400" />
            <div className="absolute top-0 left-[100%] h-4 w-px bg-red-500" />
            <div className="absolute top-0 left-[120%] h-4 w-px bg-purple-600" />
          </div>

          {/* LABELS DE REFERÊNCIA */}
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Alerta</span>
            <span>Transbordo</span>
            <span>Extremo</span>
          </div>

          {/* VALOR CENTRAL */}
          <div className="text-center text-sm md:text-base font-semibold text-slate-700 mt-3">
            {medicao.nivel} m ({percentual.toFixed(0)}%)
          </div>
        </div>
      )}

      {/* RODAPÉ */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between">
        <span className="text-xs text-slate-400 italic">Fonte: INEA</span>
        <span className="text-xs text-slate-400">Monitoramento hidrológico</span>
      </div>
    </div>
  )
}
