/* app/(sistema)/monitoramento/abas/SituacaoAtual.js */

"use client"

import dynamic from "next/dynamic"
import { useMonitoramento } from "../MonitoramentoContext"
import PainelEstacao from "../componentes/PainelEstacao"

// 🚨 mapa sem SSR
const MapaMonitoramento = dynamic(
  () => import("../componentes/MapaMonitoramento"),
  { ssr: false }
)

export default function SituacaoAtual() {
  const { estacaoSelecionada } = useMonitoramento()

  return (
    <div className="relative w-full h-[calc(100vh-140px)]">
      
      {/* MAPA PRINCIPAL 
          Agora ele já carrega internamente a LegendaStatus 
          compacta que criamos.
      */}
      <MapaMonitoramento />

      {/* PAINEL LATERAL 
          Aparece quando uma estação é clicada.
      */}
      <PainelEstacao />

    </div>
  )
}
