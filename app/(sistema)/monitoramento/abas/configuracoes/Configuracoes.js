/* app/(sistema)/monitoramento/abas/configuracoes/Configuracoes.js */

"use client"

import { useState } from "react"

import RiosLista from "./rios/RiosLista"
import EstacoesLista from "./estacoes/EstacoesLista"

export default function Configuracoes({ rios, estacoes }) {

  const [aba, setAba] = useState("rios")

  return (

    <div className="space-y-6">

      <h3 className="text-xl font-semibold text-slate-800">
        Configurações do Monitoramento
      </h3>

      {/* MENU */}

      <div className="flex gap-2">

        <button
          onClick={() => setAba("rios")}
          className={`px-4 py-2 rounded-lg text-sm font-medium

          ${aba === "rios"
            ? "bg-blue-600 text-white"
            : "bg-slate-100 hover:bg-slate-200"}

          `}
        >
          Rios
        </button>

        <button
          onClick={() => setAba("estacoes")}
          className={`px-4 py-2 rounded-lg text-sm font-medium

          ${aba === "estacoes"
            ? "bg-blue-600 text-white"
            : "bg-slate-100 hover:bg-slate-200"}

          `}
        >
          Estações
        </button>

      </div>

      {/* CONTEÚDO */}

      {aba === "rios" && (
        <RiosLista rios={rios} />
      )}

      {aba === "estacoes" && (
        <EstacoesLista
          rios={rios}
          estacoes={estacoes}
        />
      )}

    </div>

  )
}
