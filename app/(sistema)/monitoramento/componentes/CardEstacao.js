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
      <div className="flex flex-col items-center justify-center h-64 bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
        <p>Selecione uma estação para monitorar</p>
      </div>
    )
  }

  const situacao = calcularSituacao(estacaoSelecionada, medicao)
  const cota = estacaoSelecionada.nivel_transbordo
  const percentual = (medicao && !medicao.abaixo_regua && cota) ? (medicao.nivel / cota) * 100 : 0
  const posicao = Math.min(percentual, 120)

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 transition-all">
      
      {/* CABEÇALHO COM TENDÊNCIA */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{estacaoSelecionada.municipio}</h2>
          <p className="text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full text-xs inline-block mt-2">
            Rio {estacaoSelecionada.nome_rio || "—"}
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white ${situacao.cor.replace('bg-', 'bg-')}`}>
          {situacao.texto}
        </div>
      </div>

      {/* MÉTRICAS PRINCIPAIS EM GRID */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Nível Atual</p>
          <p className="text-2xl font-black text-slate-900">
            {medicao?.abaixo_regua ? "A/R" : medicao?.nivel ? `${medicao.nivel}m` : "—"}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Cota Limite</p>
          <p className="text-2xl font-black text-slate-900">{cota ? `${cota}m` : "—"}</p>
        </div>
      </div>

      {/* RÉGUA HIDROLÓGICA MODERNA */}
      <div className="space-y-4">
        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
          <span>0%</span>
          <span>Transbordo (100%)</span>
        </div>
        
        <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${posicao}%`,
              background: `linear-gradient(90deg, #22c55e 0%, #eab308 50%, #ef4444 85%, #8b5cf6 100%)` 
            }}
          />
        </div>

        <div className="text-center">
          <p className="text-3xl font-black text-slate-900">
            {percentual.toFixed(1)}<span className="text-lg text-slate-400 font-normal">%</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">da cota de transbordo</p>
        </div>
      </div>

      {/* RODAPÉ TÉCNICO */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <span>Fonte: INEA</span>
        <span>Atualizado: {medicao?.data_hora ? new Date(medicao.data_hora).toLocaleTimeString() : "--:--"}</span>
      </div>
    </div>
  )
}
