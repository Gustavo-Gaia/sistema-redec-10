/* app/(sistema)/monitoramento/componentes/PainelEstacao.js */

"use client"

import { useState, useEffect } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import { X } from "lucide-react" // Usando lucide para ícones consistentes

import CardEstacao from "./CardEstacao"
import GraficoEstacao from "./GraficoEstacao"
import TabelaHistorico from "./TabelaHistorico"

export default function PainelEstacao() {
  const { estacaoSelecionada, selecionarEstacao } = useMonitoramento()
  const [aba, setAba] = useState("visao")
  const aberto = !!estacaoSelecionada

  function fechar() {
    selecionarEstacao(null)
  }

  useEffect(() => {
    if (estacaoSelecionada) setAba("visao")
  }, [estacaoSelecionada])

  return (
    <>
      {/* BACKDROP MAIS SUAVE */}
      <div
        onClick={fechar}
        className={`
          fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[999]
          transition-opacity duration-500
          ${aberto ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* PAINEL COM DESIGN GLASSMORPHISM */}
      <div
        className={`
          fixed z-[1000] bg-white/95 backdrop-blur-md shadow-2xl flex flex-col
          transition-all duration-500 ease-out border border-white/20

          /* MOBILE */
          bottom-0 left-0 w-full h-[92%] rounded-t-[2.5rem]

          /* DESKTOP */
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 
          md:w-[950px] md:h-[85vh] md:rounded-3xl

          ${aberto
            ? "translate-y-0 md:-translate-y-1/2 opacity-100"
            : "translate-y-full md:translate-y-[100%] opacity-0 pointer-events-none"}
        `}
      >
        {estacaoSelecionada && (
          <>
            {/* HEADER INTEGRADO */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  Detalhes da Estação
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {estacaoSelecionada.municipio} 
                </p>
              </div>
              <button
                onClick={fechar}
                className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 p-2 rounded-full transition-all duration-200"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* TABS ESTILO PÍLULA (PILL TABS) */}
            <div className="px-6 py-4">
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setAba("visao")}
                  className={`
                    px-6 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all
                    ${aba === "visao"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"}
                  `}
                >
                  Visão geral
                </button>

                <button
                  onClick={() => setAba("historico")}
                  className={`
                    px-6 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all
                    ${aba === "historico"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"}
                  `}
                >
                  Histórico
                </button>
              </div>
            </div>

            {/* CONTEÚDO COM SCROLL PERSONALIZADO */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
              {aba === "visao" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardEstacao />
                  <div className="mt-6 bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                     <GraficoEstacao estacao={estacaoSelecionada} />
                  </div>
                </div>
              )}

              {aba === "historico" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <TabelaHistorico estacao={estacaoSelecionada} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
