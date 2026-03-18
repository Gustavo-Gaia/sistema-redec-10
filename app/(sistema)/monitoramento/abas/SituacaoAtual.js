/* app/(sistema)/monitoramento/abas/SituacaoAtual.js */

"use client"

import dynamic from "next/dynamic"
import { useMonitoramento } from "../MonitoramentoContext"

import PainelEstacao from "../componentes/PainelEstacao"
import LegendaStatus from "../componentes/LegendaStatus"

// 🚨 mapa sem SSR
const MapaMonitoramento = dynamic(
  () => import("../componentes/MapaMonitoramento"),
  { ssr: false }
)

export default function SituacaoAtual() {

  const { estacaoSelecionada } = useMonitoramento()

  return (

    <div className="relative w-full h-[calc(100vh-140px)]">

      {/* MAPA */}
      <MapaMonitoramento />

      {/* LEGENDA */}
      <div className="absolute bottom-4 left-4 z-[500]">
        <LegendaStatus />
      </div>

      {/* PAINEL */}
      <PainelEstacao />

      {/* MENSAGEM INICIAL */}
      {!estacaoSelecionada && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500]">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow text-sm text-slate-700">
            Clique em uma estação no mapa para visualizar os dados
          </div>
        </div>
      )}

    </div>

  )
}
