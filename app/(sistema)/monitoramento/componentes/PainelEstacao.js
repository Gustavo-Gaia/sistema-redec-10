/* app/(sistema)/monitoramento/componentes/PainelEstacao.js */

"use client"

import { useMonitoramento } from "../MonitoramentoContext"

import CardEstacao from "./CardEstacao"
import GraficoEstacao from "./GraficoEstacao"
import TabelaHistorico from "./TabelaHistorico"

export default function PainelEstacao() {

  const {
    estacaoSelecionada,
    setEstacaoSelecionada
  } = useMonitoramento()

  const aberto = !!estacaoSelecionada

  function fechar() {
    setEstacaoSelecionada(null)
  }

  return (
    <>
      {/* ============================= */}
      {/* BACKDROP */}
      {/* ============================= */}

      <div
        onClick={fechar}
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]
          transition-opacity duration-300
          ${aberto ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* ============================= */}
      {/* PAINEL */}
      {/* ============================= */}

      <div
        className={`
          fixed z-[1000] bg-white shadow-2xl
          transition-all duration-300 ease-in-out flex flex-col

          /* MOBILE (bottom sheet) */
          bottom-0 left-0 w-full h-[90%] rounded-t-2xl

          /* DESKTOP (modal central) */
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:w-[900px] md:h-[85vh] md:rounded-2xl

          ${aberto
            ? "translate-y-0 opacity-100"
            : "translate-y-full md:translate-y-[-40%] opacity-0 pointer-events-none"}
        `}
      >

        {estacaoSelecionada && (

          <>
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b">

              <h2 className="font-bold text-slate-800 text-lg">
                Detalhes da Estação
              </h2>

              <button
                onClick={fechar}
                className="text-slate-500 hover:text-slate-800 text-xl"
              >
                ✕
              </button>

            </div>

            {/* CONTEÚDO */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

              <CardEstacao />

              <GraficoEstacao estacao={estacaoSelecionada} />

              <TabelaHistorico estacao={estacaoSelecionada} />

            </div>

          </>
        )}

      </div>
    </>
  )
}


