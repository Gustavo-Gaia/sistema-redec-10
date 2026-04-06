/* app/(sistema)/monitoramento/TabsMonitoramento.js */

"use client"

import { useState } from "react"

import SituacaoAtual from "./abas/SituacaoAtual"
import InserirMedicoes from "./abas/InserirMedicoes"
import Configuracoes from "./abas/configuracoes/Configuracoes"
import RelatorioAtual from "./abas/RelatorioAtual" 

export default function TabsMonitoramento({
  rios,
  estacoes
  // ✅ REMOVIDO: ultimasMedicoes (não estava sendo usado aqui)
}) {

  const [abaAtiva, setAbaAtiva] = useState("situacao")

  const abas = [
    { id: "situacao", nome: "Situação Atual" },
    { id: "inserir", nome: "Medições e Relatório" },
    { id: "relatorio_atual", nome: "Relatório Atual" }, 
    { id: "config", nome: "Configurações" }
  ]

  return (
    <div className="w-full">

      {/* MENU DAS ABAS (Os botões lá no topo) */}
      <div className="flex gap-2 overflow-x-auto pb-4 border-b border-slate-200">
        {abas.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`
              px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition
              ${abaAtiva === aba.id
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}
            `}
          >
            {aba.nome}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS (A mágica da troca de tela) */}
      <div className="mt-6">

        {/* Só renderiza o componente se a aba estiver ativa */}
        {abaAtiva === "situacao" && (
          <SituacaoAtual />
        )}

        {abaAtiva === "inserir" && (
          <InserirMedicoes
            rios={rios}
            estacoes={estacoes}
          />
        )}

        {abaAtiva === "relatorio_atual" && (
          <RelatorioAtual 
            rios={rios} 
            estacoes={estacoes} 
          />
        )}

        {abaAtiva === "config" && (
          <Configuracoes
            rios={rios}
            estacoes={estacoes}
          />
        )}

      </div>

    </div>
  )
}
