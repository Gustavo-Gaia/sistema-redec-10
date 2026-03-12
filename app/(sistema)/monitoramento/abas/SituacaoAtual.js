/* app/(sistema)/monitoramento/abas/SituacaoAtual.js */

"use client"

import SeletorMonitoramento from "../seletor"

export default function SituacaoAtual({ rios, estacoes }) {

  return (

    <div>

      <SeletorMonitoramento
        rios={rios}
        estacoes={estacoes}
      />

      <div className="text-slate-600">
        Situação atual das estações aparecerá aqui.
      </div>

    </div>

  )
}
