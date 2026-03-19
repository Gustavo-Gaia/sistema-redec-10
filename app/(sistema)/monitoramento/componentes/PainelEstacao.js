/* app/(sistema)/monitoramento/componentes/PainelEstacao.js */

"use client"

import { useState, useEffect } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import { X, Map, BarChart3, Table, Info } from "lucide-react"

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

  // Resetar para visão geral ao trocar de estação
  useEffect(() => {
    if (estacaoSelecionada) {
      setAba("visao")
    }
  }, [estacaoSelecionada])

  return (
    <>
      {/* BACKDROP COM BLUR */}
      <div
        onClick={fechar}
        className={`
          fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999]
          transition-opacity duration-500
          ${aberto ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* PAINEL CENTRALIZADO (MODAL STYLE NO DESKTOP / SHEET NO MOBILE) */}
      <div
        className={`
          fixed z-[1000] bg-slate-50 shadow-2xl flex flex-col overflow-hidden
          transition-all duration-500 ease-in-out

          /* MOBILE: Sobe de baixo */
          bottom-0 left-0 w-full h-[92%] rounded-t-[2.5rem]

          /* DESKTOP: Centralizado e elegante */
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:w-[950px] md:h-[85vh] md:rounded-[3rem]

          ${aberto 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full md:scale-95 md:opacity-0 pointer-events-none"}
        `}
      >
        {estacaoSelecionada && (
          <>
            {/* INDICADOR PARA MOBILE (HANDLE) */}
            <div className="md:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-4 mb-2" />

            {/* HEADER PROFISSIONAL */}
            <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full animate-pulse ${estacaoSelecionada.situacao?.cor || 'bg-slate-400'}`} />
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none">
                    {estacaoSelecionada.nome}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {estacaoSelecionada.municipio} • Fonte: {estacaoSelecionada.fonte || 'INEA/ANA'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fechar}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[11px] font-black uppercase hover:bg-blue-100 transition-colors"
                >
                  <Map size={14} />
                  Ver no mapa
                </button>
                <button
                  onClick={fechar}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* TABS NAVEGAÇÃO - ESTILO DECISION PANEL */}
            <div className="flex bg-white px-8 border-b border-slate-100 gap-8">
              <button
                onClick={() => setAba("visao")}
                className={`
                  flex items-center gap-2 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative
                  ${aba === "visao" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}
                `}
              >
                <BarChart3 size={16} />
                Visão Geral
                {aba === "visao" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
              </button>

              <button
                onClick={() => setAba("historico")}
                className={`
                  flex items-center gap-2 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative
                  ${aba === "historico" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}
                `}
              >
                <Table size={16} />
                Histórico Completo
                {aba === "historico" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
              </button>
            </div>

            {/* CONTEÚDO SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              {aba === "visao" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <CardEstacao />
                  <div className="grid grid-cols-1 gap-8">
                    <GraficoEstacao estacao={estacaoSelecionada} />
                  </div>
                  {/* Dica de decisão rápida */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <Info className="text-blue-500" size={20} />
                    <p className="text-[11px] font-bold text-blue-700 leading-relaxed uppercase">
                      Informações atualizadas conforme última leitura do sensor. 
                      Verifique o histórico para identificar tendências de subida.
                    </p>
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
