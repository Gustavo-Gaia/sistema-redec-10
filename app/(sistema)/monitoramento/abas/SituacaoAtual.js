/* app/(sistema)/monitoramento/abas/SituacaoAtual.js */

"use client"

import SeletorMonitoramento from "../seletor"
import ResumoSituacao from "../componentes/ResumoSituacao"

export default function SituacaoAtual({
  rios,
  estacoes,
  ultimasMedicoes
}) {

  return (

    <div>

      <SeletorMonitoramento
        rios={rios}
        estacoes={estacoes}
      />

      <ResumoSituacao
        estacoes={estacoes}
        ultimasMedicoes={ultimasMedicoes}
      />

      <div className="text-slate-600">
        Lista de estações aparecerá aqui.
      </div>

    </div>

  )
}
