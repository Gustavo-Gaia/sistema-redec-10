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

  // FECHAR PAINEL
  function fechar() {
    setEstacaoSelecionada(null)
  }

  return (

    <>
      {/* ============================= */}
      {/* BACKDROP (escurece fundo) */}
      {/* ============================= */}

      {estacaoSelecionada && (
        <div
          onClick={fechar}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* ============================= */}
      {/* PAINEL */}
      {/* ============================= */}

      <div
        className={`
          fixed z-50 bg-white shadow-2xl
          transition-all duration-300

          /* DESKTOP */
          top-0 right-0 h-full w-[380px]

          /* MOBILE */
          md:w-[380px] w-full md:h-full h-[85%] md:rounded-none rounded-t-2xl md:top-0 bottom-0

          ${estacaoSelecionada
            ? "translate-x-0 md:translate-x-0 translate-y-0"
            : "translate-x-full md:translate-x-full translate-y-full"}
        `}
      >

        {estacaoSelecionada && (

          <div className="h-full flex flex-col">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b">

              <h2 className="font-bold text-slate-800">
                Detalhes da Estação
              </h2>

              <button
                onClick={fechar}
                className="text-slate-500 hover:text-slate-800"
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

          </div>

        )}

      </div>
    </>
  )
}
