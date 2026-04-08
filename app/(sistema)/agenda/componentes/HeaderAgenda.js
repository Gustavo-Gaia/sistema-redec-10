/* app/(sistema)/agenda/componentes/HeaderAgenda.js */

export default function HeaderAgenda({ dataAtual, setDataAtual }) {

  function mudarMes(direcao) {
    const nova = new Date(dataAtual)
    nova.setMonth(nova.getMonth() + direcao)
    setDataAtual(nova)
  }

  function hoje() {
    setDataAtual(new Date())
  }

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow">

      <div className="flex items-center gap-4">

        <button
          onClick={() => mudarMes(-1)}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          ◀
        </button>

        <h2 className="text-lg font-semibold">
          {dataAtual.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button
          onClick={() => mudarMes(1)}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          ▶
        </button>

        <button
          onClick={hoje}
          className="ml-4 px-3 py-1 border rounded-lg hover:bg-gray-100"
        >
          Hoje
        </button>

      </div>

      {/* FUTURO: contador de eventos */}
      <div className="text-sm text-gray-500">
        {/* Ex: 13 itens */}
      </div>

    </div>
  )
}
