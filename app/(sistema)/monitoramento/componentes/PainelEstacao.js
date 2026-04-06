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
  
  // ✅ Transformamos a presença do objeto em um valor booleano (Aberto ou Fechado)
  const aberto = !!estacaoSelecionada

  function fechar() {
    selecionarEstacao(null)
  }

  // ✅ Sempre que mudar de estação, voltamos para a aba de "Visão Geral"
  useEffect(() => {
    if (estacaoSelecionada) setAba("visao")
  }, [estacaoSelecionada?.id]) // Usar o ID como dependência é mais seguro que o objeto todo

  return (
    <>
      {/* 1. BACKDROP (Fundo escurecido que fecha ao clicar) */}
      <div
        onClick={fechar}
        className={`
          fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[999]
          transition-opacity duration-500
          ${aberto ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* 2. PAINEL PRINCIPAL (Gaveta) */}
      <div
        className={`
          fixed z-[1000] bg-white/95 backdrop-blur-md shadow-2xl flex flex-col
          transition-all duration-500 ease-out border border-white/20

          /* Responsividade: No Mobile sobe do fundo, no Desktop centraliza */
          bottom-0 left-0 w-full h-[92%] rounded-t-[2.5rem]
          md:top-1/2 md:left-1/2 md:-translate-x-1/2 
          md:w-[950px] md:h-[85vh] md:rounded-3xl

          ${aberto
            ? "translate-y-0 md:-translate-y-1/2 opacity-100"
            : "translate-y-full md:translate-y-[100%] opacity-0 pointer-events-none"}
        `}
      >
        {estacaoSelecionada && (
          <>
            {/* CABEÇALHO */}
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
                className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 p-2 rounded-full transition-all"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* SELETOR DE ABAS (Pills) */}
            <div className="px-6 py-4">
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                {["visao", "historico"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setAba(item)}
                    className={`
                      px-6 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all
                      ${aba === item
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"}
                    `}
                  >
                    {item === "visao" ? "Visão Geral" : "Histórico"}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTEÚDO DINÂMICO */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6 scrollbar-hide">
              {aba === "visao" ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardEstacao />
                  <div className="mt-6 bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                     <GraficoEstacao estacao={estacaoSelecionada} />
                  </div>
                </div>
              ) : (
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
