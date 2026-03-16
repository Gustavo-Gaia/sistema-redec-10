/* app/(sistema)/monitoramento/abas/SituacaoAtual.js */

"use client"

import { useMonitoramento } from "../MonitoramentoContext"

import SeletorMonitoramento from "../seletor"

import CardEstacao from "../componentes/CardEstacao"
import GraficoEstacao from "../componentes/GraficoEstacao"
import TabelaHistorico from "../componentes/TabelaHistorico"
import LegendaStatus from "../componentes/LegendaStatus"

export default function SituacaoAtual({ rios, estacoes }) {

  const { estacaoSelecionada } = useMonitoramento()

  return (

    <div className="space-y-8">

      {/* SELETOR */}

      <SeletorMonitoramento
        rios={rios}
        estacoes={estacoes}
      />

      {/* CARD */}

      <CardEstacao />

      {/* GRÁFICO */}

      {estacaoSelecionada && (
        <GraficoEstacao
          estacao={estacaoSelecionada}
        />
      )}

      {/* HISTÓRICO */}

      {estacaoSelecionada && (
        <TabelaHistorico
          estacao={estacaoSelecionada}
        />
      )}

      {/* LEGENDA */}

      <LegendaStatus />

    </div>

  )
}
