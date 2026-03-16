/* app/(sistema)/monitoramento/abas/SituacaoAtual.js */

"use client"

import SeletorMonitoramento from "../seletor"
import ResumoSituacao from "../componentes/ResumoSituacao"
import ListaEstacoes from "../componentes/ListaEstacoes"

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

      <ListaEstacoes
        estacoes={estacoes}
        ultimasMedicoes={ultimasMedicoes}
        rios={rios}
      />

    </div>

  )
}
