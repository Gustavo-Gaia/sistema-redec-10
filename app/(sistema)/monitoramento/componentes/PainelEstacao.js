/* app/(sistema)/monitoramento/componentes/PainelEstacao.js */

"use client"

import { useMonitoramento } from "../MonitoramentoContext"

export default function PainelEstacao() {

  const { estacaoSelecionada } = useMonitoramento()

  if (!estacaoSelecionada) {
    return null
  }

  return (

    <div className="mt-8 bg-white border rounded-xl shadow-sm p-6">

      <h3 className="text-xl font-bold text-slate-800 mb-2">

        {estacaoSelecionada.municipio}

      </h3>

      <p className="text-slate-600 mb-4">
        Estação hidrológica selecionada
      </p>

      <div className="text-slate-500">

        Gráfico da estação aparecerá aqui.

      </div>

    </div>

  )
}
