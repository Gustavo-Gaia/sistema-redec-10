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

      setMedicao(dados[0])

    }

    carregar()

  }, [estacaoSelecionada])

  if (!estacaoSelecionada) {

    return (
      <div className="bg-white border rounded-xl p-6 text-slate-500">
        Selecione um município para visualizar a estação.
      </div>
    )

  }

  const situacao = calcularSituacao(estacaoSelecionada, medicao)

  const percentual = medicao
    ? ((medicao.nivel / estacaoSelecionada.nivel_transbordo) * 100).toFixed(0)
    : null

  return (

    <div className="bg-white border rounded-xl shadow-sm p-6">

      <h3 className="text-lg font-bold text-slate-800 mb-4">

        {estacaoSelecionada.municipio}

      </h3>

      <div className="grid md:grid-cols-4 gap-6">

        <div>

          <div className="text-sm text-slate-500">
            Status
          </div>

          <div className={`font-bold ${situacao.cor}`}>
            {situacao.nome}
          </div>

        </div>

        <div>

          <div className="text-sm text-slate-500">
            Nível Atual
          </div>

          <div className="font-bold text-slate-800">
            {medicao?.nivel ? `${medicao.nivel} m` : "—"}
          </div>

        </div>

        <div>

          <div className="text-sm text-slate-500">
            Percentual da Cota
          </div>

          <div className="font-bold text-slate-800">
            {percentual ? `${percentual}%` : "—"}
          </div>

        </div>

        <div>

          <div className="text-sm text-slate-500">
            Cota de Transbordo
          </div>

          <div className="font-bold text-slate-800">
            {estacaoSelecionada.nivel_transbordo} m
          </div>

        </div>

      </div>

    </div>

  )
}
