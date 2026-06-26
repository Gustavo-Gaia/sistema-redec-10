/* app/(sistema)/monitoramento/abas/incendios/MonitoramentoIncendios.js */

"use client"

import dynamic from "next/dynamic"

const MapaIncendios = dynamic(
  () => import("./MapaIncendios"),
  { ssr: false }
)

export default function MonitoramentoIncendios() {
  return (
    <div className="space-y-6">

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Incêndios Florestais e Fogo em Vegetação
        </h2>

        <p className="text-slate-500 mt-2">
          Monitoramento espacial das ocorrências registradas pelo CBMERJ na área da REDEC 10.
        </p>
      </div>

      <MapaIncendios />

    </div>
  )
}
