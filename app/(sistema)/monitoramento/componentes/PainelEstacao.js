/* app/(sistema)/monitoramento/componentes/PainelEstacao.js */

"use client"

import { useMonitoramento } from "../MonitoramentoContext"

import CardEstacao from "./CardEstacao"
import GraficoEstacao from "./GraficoEstacao"
import TabelaHistorico from "./TabelaHistorico"

export default function PainelEstacao() {

  const {
    estacaoSelecionada,
    limparSelecao
  } = useMonitoramento()

  const aberto = !!estacaoSelecionada

  function fechar() {
    limparSelecao()
  }

  return (
    <>
      {/* ============================= */}
      {/* BACKDROP */}
      {/* ============================= */}

      <div
        onClick={fechar}
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-[900]
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
          transition-all duration-300 ease-in-out

          /* MOBILE */
          bottom-0 left-0 w-full h-[85%] rounded-t-2xl

          /* DESKTOP */
          md:top-0 md:right-0 md:h-full md:w-[380px] md:rounded-none

          ${aberto
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-full"}
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
                className="p-2 rounded-lg hover:bg-slate-100 transition"
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

