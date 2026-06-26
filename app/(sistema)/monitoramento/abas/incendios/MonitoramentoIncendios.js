/* app/(sistema)/monitoramento/abas/incendios/MonitoramentoIncendios.js */

"use client"

import dynamic from "next/dynamic"

import {
  MonitoramentoIncendiosProvider
} from "./MonitoramentoIncendiosContext"

import FiltrosIncendio from "./FiltrosIncendio"

// carregamento sem SSR por causa do Leaflet
const MapaIncendios = dynamic(
  () => import("./MapaIncendios"),
  { ssr: false }
)

export default function MonitoramentoIncendios() {
  return (
    <MonitoramentoIncendiosProvider>

      <div className="space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">

          <div className="flex items-start justify-between gap-6">

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                🔥 Incêndios Florestais e Fogo em Vegetação
              </h2>

              <p className="text-slate-500 mt-2 max-w-3xl">
                Monitoramento espacial das ocorrências registradas pelo
                CBMERJ na área da REDEC 10.
              </p>

              <p className="text-xs text-slate-400 mt-3">
                Os dados são baseados nos atendimentos de fogo em
                vegetação realizados pelo Corpo de Bombeiros Militar do
                Estado do Rio de Janeiro.
              </p>
            </div>

          </div>

        </div>

        {/* FILTROS */}
        <FiltrosIncendio />

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* MAPA */}
          <div className="xl:col-span-3">

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">
                  Distribuição Espacial das Ocorrências
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Visualização geográfica das ocorrências registradas.
                </p>
              </div>

              <div className="h-[700px]">
                <MapaIncendios />
              </div>

            </div>

          </div>

          {/* PAINEL LATERAL */}
          <div className="space-y-6">

            {/* ESTATÍSTICAS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">
                Estatísticas
              </h3>

              <div className="space-y-4">
                <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* RANKING */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">
                Ranking dos Municípios
              </h3>

              <div className="space-y-3">
                <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                <div className="h-10 bg-slate-50 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* EVOLUÇÃO TEMPORAL */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">
                Evolução Temporal
              </h3>

              <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
            </div>

          </div>

        </div>

      </div>

    </MonitoramentoIncendiosProvider>
  )
}
