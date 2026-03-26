/* app/(sistema)/configuracoes/page.js */

"use client"

import { useState } from "react"

import BancoDados from "./componentes/BancoDados"
import Sistema from "./componentes/Sistema"
import Perfil from "./componentes/Perfil"

export default function Configuracoes() {

  const [abaAtiva, setAbaAtiva] = useState("banco")

  return (
    <div className="p-6 space-y-6">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          ⚙️ Configurações
        </h1>
        <p className="text-slate-500 text-sm">
          Gerencie preferências, armazenamento e dados do sistema
        </p>
      </div>

      {/* ========================= */}
      {/* ABAS */}
      {/* ========================= */}
      <div className="flex gap-2 border-b border-slate-200">

        <button
          onClick={() => setAbaAtiva("banco")}
          className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all
            ${abaAtiva === "banco"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          💾 Banco de Dados
        </button>

        <button
          onClick={() => setAbaAtiva("sistema")}
          className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all
            ${abaAtiva === "sistema"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          ⚙️ Sistema
        </button>

        <button
          onClick={() => setAbaAtiva("perfil")}
          className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all
            ${abaAtiva === "perfil"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          👤 Perfil
        </button>

      </div>

      {/* ========================= */}
      {/* CONTEÚDO DAS ABAS */}
      {/* ========================= */}
      <div className="pt-4">

        {abaAtiva === "banco" && <BancoDados />}
        {abaAtiva === "sistema" && <Sistema />}
        {abaAtiva === "perfil" && <Perfil />}

      </div>

    </div>
  )
}
