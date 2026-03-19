/* app/(sistema)/monitoramento/componentes/PainelEstacao.js */

"use client"

import { useState, useEffect } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import { X } from "lucide-react"

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
    if (estacaoSelecionada) {
      setAba("visao")
    }
  }, [estacaoSelecionada])

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={fechar}
        className={`
          fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999]
          transition-opacity duration-500
          ${aberto ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* PAINEL */}
      <div
        className={`
          fixed z-[1000] bg-white shadow-2xl flex flex-col overflow-hidden
          transition-all duration-500 ease-in-out

          /* MOBILE */
          bottom-0 left-0 w-full h-[92%] rounded-t-[2.5rem]

          /* DESKTOP */
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:w-[950px] md:h-[85vh] md:rounded-[3rem]

          ${aberto 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full md:scale-95 md:opacity-0 pointer-events-none"}
        `}
      >
        {estacaoSelecionada && (
          <>
            {/* HEADER SIMPLIFICADO */}
            <div className="flex items-center justify-end px-8 py-4 border-b border-slate-100">
              <button
                onClick={fechar}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* TABS */}
            <div className="flex bg-white px-8 border-b border-slate-100 gap-8">
              <button
                onClick={() => setAba("visao")}
                className={`
                  py-4 text-[11px] font-black uppercase tracking-widest transition-all relative
                  ${aba === "visao" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}
                `}
              >
                Visão Geral
                {aba === "visao" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
              </button>

              <button
                onClick={() => setAba("historico")}
                className={`
                  py-4 text-[11px] font-black uppercase tracking-widest transition-all relative
                  ${aba === "historico" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}
                `}
              >
                Histórico
                {aba === "historico" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
              </button>
            </div>

            {/* CONTEÚDO SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              {aba === "visao" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <CardEstacao />
                  <GraficoEstacao estacao={estacaoSelecionada} />
                </div>
              )}

              {aba === "historico" && (
                <div className="animate-in fade-in duration-500">
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
