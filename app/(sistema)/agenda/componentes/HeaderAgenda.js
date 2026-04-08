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

      <div className="flex items-center gap-3">

        <button onClick={() => mudarMes(-1)} className="px-2 py-1 hover:bg-gray-100 rounded">
          ◀
        </button>

        <h2 className="text-xl font-semibold capitalize">
          {dataAtual.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button onClick={() => mudarMes(1)} className="px-2 py-1 hover:bg-gray-100 rounded">
          ▶
        </button>

        <button
          onClick={hoje}
          className="ml-4 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Hoje
        </button>

      </div>

    </div>
  )
}
