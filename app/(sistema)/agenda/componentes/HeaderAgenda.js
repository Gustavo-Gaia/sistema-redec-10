/* app/(sistema)/agenda/componentes/HeaderAgenda.js */

"use client"

export default function HeaderAgenda({
  dataAtual,
  setDataAtual,
  modo = "mes",
  setModo
}) {

  // 🔁 NAVEGAÇÃO (mês ou semana)
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

    // 🔥 MODO SEMANA
    const inicio = new Date(dataAtual)
    const dia = inicio.getDay()
    const diff = dia === 0 ? -6 : 1 - dia
    inicio.setDate(inicio.getDate() + diff)

    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 6)

    return `${inicio.getDate()} ${inicio.toLocaleDateString("pt-BR", {
      month: "short"
    })} - ${fim.getDate()} ${fim.toLocaleDateString("pt-BR", {
      month: "short"
    })}`
  }

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow">

      {/* ESQUERDA */}
      <div className="flex items-center gap-4">

        {/* SETAS */}
        <button
          onClick={() => mudarPeriodo(-1)}
          className="px-3 py-1 rounded hover:bg-gray-100 transition"
        >
          ◀
        </button>

        {/* TÍTULO */}
        <h2 className="text-lg font-semibold capitalize">
          {formatarTitulo()}
        </h2>

        <button
          onClick={() => mudarPeriodo(1)}
          className="px-3 py-1 rounded hover:bg-gray-100 transition"
        >
          ▶
        </button>

        {/* HOJE */}
        <button
          onClick={irHoje}
          className="ml-4 px-3 py-1 border rounded-lg hover:bg-gray-100 transition"
        >
          Hoje
        </button>

      </div>

      {/* DIREITA (MODO) */}
      <div className="flex gap-2">

        <button
          onClick={() => setModo("mes")}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            modo === "mes"
              ? "bg-blue-600 text-white shadow"
              : "bg-white border hover:bg-gray-100"
          }`}
        >
          Mês
        </button>

        <button
          onClick={() => setModo("semana")}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            modo === "semana"
              ? "bg-blue-600 text-white shadow"
              : "bg-white border hover:bg-gray-100"
          }`}
        >
          Semana
        </button>

      </div>

    </div>
  )
}
