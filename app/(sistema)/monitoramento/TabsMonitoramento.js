/* app/(sistema)/monitoramento/TabsMonitoramento.js */

"use client"

import { useState } from "react"

import SituacaoAtual from "./abas/SituacaoAtual"
import Historico from "./abas/Historico"
import MapaEstacoes from "./abas/MapaEstacoes"
import Relatorios from "./abas/Relatorios"
import InserirMedicoes from "./abas/InserirMedicoes"
import Configuracoes from "./abas/configuracoes/Configuracoes"

export default function TabsMonitoramento({
  rios,
  estacoes,
  ultimasMedicoes
}) {

  const [abaAtiva, setAbaAtiva] = useState("situacao")

  const abas = [
    { id: "situacao", nome: "Situação Atual" },
    { id: "historico", nome: "Histórico" },
    { id: "mapa", nome: "Mapa" },
    { id: "relatorios", nome: "Relatórios" },
    { id: "inserir", nome: "Inserir Medições" },
    { id: "config", nome: "Configurações" }
  ]

  return (

    <div className="w-full">

      {/* ============================= */}
      {/* MENU DAS ABAS */}
      {/* ============================= */}

      <div className="flex gap-2 overflow-x-auto pb-4 border-b border-slate-200">

        {abas.map((aba) => (

          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`
              px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition

              ${abaAtiva === aba.id
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"}
            `}
          >

            {aba.nome}

          </button>

        ))}

      </div>

      {/* ============================= */}
      {/* CONTEÚDO DAS ABAS */}
      {/* ============================= */}

      <div className="mt-6">

        {abaAtiva === "situacao" && (
          <SituacaoAtual
            rios={rios}
            estacoes={estacoes}
            ultimasMedicoes={ultimasMedicoes}
          />
        )}

        {abaAtiva === "historico" && (
          <Historico
            rios={rios}
            estacoes={estacoes}
          />
        )}

        {abaAtiva === "mapa" && (
          <MapaEstacoes
            rios={rios}
            estacoes={estacoes}
          />
        )}

        {abaAtiva === "relatorios" && (
          <Relatorios
            rios={rios}
            estacoes={estacoes}
          />
        )}

        {abaAtiva === "inserir" && (
          <InserirMedicoes
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
