/* app/(sistema)/agenda/componentes/HeaderAgenda.js */

"use client"

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

export default function HeaderAgenda({
  dataAtual,
  setDataAtual,
  modo = "mes",
  setModo
}) {

  // 🔁 NAVEGAÇÃO
  function mudarPeriodo(direcao) {
    const nova = new Date(dataAtual)
    if (modo === "mes") {
      nova.setMonth(nova.getMonth() + direcao)
    } else {
      nova.setDate(nova.getDate() + (7 * direcao))
    }
    setDataAtual(nova)
  }

  // 📅 HOJE
  function irHoje() {
    setDataAtual(new Date())
  }

  // 📆 TEXTO DINÂMICO
  function formatarTitulo() {
    if (modo === "mes") {
      return dataAtual.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      })
    }

    const inicio = new Date(dataAtual)
    const dia = inicio.getDay()
    const diff = dia === 0 ? -6 : 1 - dia
    inicio.setDate(inicio.getDate() + diff)

    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 6)

    return `${inicio.getDate()} ${inicio.toLocaleDateString("pt-BR", { month: "short" })} - ${fim.getDate()} ${fim.toLocaleDateString("pt-BR", { month: "short" })}`
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
      
      {/* ESQUERDA: NAVEGAÇÃO */}
      <div className="flex items-center gap-2">
        <button
          onClick={irHoje}
          className="mr-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all active:scale-95"
        >
          Hoje
        </button>

        <div className="flex items-center bg-gray-50 rounded-xl p-1">
          <button
            onClick={() => mudarPeriodo(-1)}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          <h2 className="text-sm md:text-base font-bold capitalize px-4 min-w-[140px] text-center text-gray-700">
            {formatarTitulo()}
          </h2>

          <button
            onClick={() => mudarPeriodo(1)}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* DIREITA: SELETOR DE MODO */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
        <button
          onClick={() => setModo("mes")}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            modo === "mes"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Mês
        </button>

        <button
          onClick={() => setModo("semana")}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            modo === "semana"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Semana
        </button>
      </div>
    </div>
  )
}
