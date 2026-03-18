/* app/(sistema)/monitoramento/componentes/PainelEstacao.js */

"use client"

import { useState } from "react"
import { useMonitoramento } from "../MonitoramentoContext"

import CardEstacao from "./CardEstacao"
import GraficoEstacao from "./GraficoEstacao"
import TabelaHistorico from "./TabelaHistorico"

export default function PainelEstacao() {

  const {
    estacaoSelecionada,
    selecionarEstacao
  } = useMonitoramento()

  const [aba, setAba] = useState("resumo")

  const aberto = !!estacaoSelecionada

  function fechar() {
    selecionarEstacao(null)
  }

  function voltarMapa() {
    selecionarEstacao(null)
  }

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={fechar}
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]
          transition-opacity duration-300
          ${aberto ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* PAINEL */}
      <div
        className={`
          fixed z-[1000] bg-white shadow-2xl flex flex-col
          transition-all duration-300

          bottom-0 left-0 w-full h-[90%] rounded-t-2xl

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

              <h2 className="font-bold text-slate-800">
                {estacaoSelecionada.nome || "Estação"}
              </h2>

              <div className="flex gap-2">

                {/* BOTÃO VER NO MAPA */}
                <button
                  onClick={voltarMapa}
                  className="text-sm px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  Ver no mapa
                </button>

                {/* FECHAR */}
                <button
                  onClick={fechar}
                  className="text-slate-500 hover:text-slate-800 text-lg"
                >
                  ✕
                </button>

              </div>

            </div>

            {/* TABS */}
            <div className="flex border-b">

              {[
                { id: "resumo", label: "Resumo" },
                { id: "grafico", label: "Gráfico" },
                { id: "historico", label: "Histórico" }
              ].map((t) => (

                <button
                  key={t.id}
                  onClick={() => setAba(t.id)}
                  className={`
                    flex-1 p-3 text-sm font-medium
                    ${aba === t.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-slate-500"}
                  `}
                >
                  {t.label}
                </button>

              ))}

            </div>

            {/* CONTEÚDO */}
            <div className="flex-1 overflow-y-auto p-4">

              {aba === "resumo" && (
                <CardEstacao />
              )}

              {aba === "grafico" && (
                <GraficoEstacao estacao={estacaoSelecionada} />
              )}

              {aba === "historico" && (
                <TabelaHistorico estacao={estacaoSelecionada} />
              )}

            </div>

          </>
        )}

      </div>
    </>
  )
}

