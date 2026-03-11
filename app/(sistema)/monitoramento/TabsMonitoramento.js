/* app/(sistema)/monitoramento/TabsMonitoramento.js */
"use client"

import { useState } from "react"

import SituacaoAtual from "./abas/SituacaoAtual"
import Historico from "./abas/Historico"
import MapaEstacoes from "./abas/MapaEstacoes"
import Relatorios from "./abas/Relatorios"
import InserirMedicoes from "./abas/InserirMedicoes"

export default function TabsMonitoramento({ rios, estacoes }) {

  const [abaAtiva, setAbaAtiva] = useState("situacao")

  const abas = [
    { id: "situacao", nome: "Situação Atual" },
    { id: "historico", nome: "Histórico" },
    { id: "mapa", nome: "Mapa" },
    { id: "relatorios", nome: "Relatórios" },
    { id: "inserir", nome: "Inserir Medições" }
  ]

  return (

    <div>

      {/* MENU DAS ABAS */}

      <div className="flex gap-2 overflow-x-auto pb-4 border-b">

        {abas.map((aba) => (

          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition
              ${abaAtiva === aba.id
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"}
            `}
          >

            {aba.nome}

          </button>

        ))}

      </div>

      {/* CONTEÚDO */}

      <div className="mt-6">

        {abaAtiva === "situacao" && (
          <SituacaoAtual
            rios={rios}
            estacoes={estacoes}
          />
        )}

        {abaAtiva === "historico" && <Historico />}

        {abaAtiva === "mapa" && <MapaEstacoes />}

        {abaAtiva === "relatorios" && <Relatorios />}

        {abaAtiva === "inserir" && <InserirMedicoes />}

      </div>

    </div>

  )
}
