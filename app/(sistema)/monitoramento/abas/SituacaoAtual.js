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

    <div className="space-y-6 md:space-y-8">

      {/* ===================== */}
      {/* SELETOR */}
      {/* ===================== */}

      <SeletorMonitoramento
        rios={rios}
        estacoes={estacoes}
      />


      {/* ===================== */}
      {/* CARD DA ESTAÇÃO */}
      {/* ===================== */}

      <CardEstacao />


      {/* ===================== */}
      {/* GRÁFICO */}
      {/* ===================== */}

      {estacaoSelecionada && (

        <div className="w-full">

          <GraficoEstacao
            estacao={estacaoSelecionada}
          />

        </div>

      )}


      {/* ===================== */}
      {/* HISTÓRICO */}
      {/* ===================== */}

      {estacaoSelecionada && (

        <div className="w-full">

          <TabelaHistorico
            estacao={estacaoSelecionada}
          />

        </div>

      )}


      {/* ===================== */}
      {/* LEGENDA */}
      {/* ===================== */}

      <LegendaStatus />

    </div>

  )

}
