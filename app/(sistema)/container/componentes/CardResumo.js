/* app/(sistema)/container/componentes/CardResumo.js */

export default function CardResumo({ titulo, quantidade, capacidade }) {
  const percentual = (quantidade / capacidade) * 100

  let cor = "bg-green-500"

  if (percentual < 50) cor = "bg-yellow-500"
  if (percentual < 20) cor = "bg-red-500"

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 transition hover:shadow-xl hover:-translate-y-1">

      <h2 className="text-lg font-semibold mb-2">
        {titulo}
      </h2>

      <p className="text-3xl font-bold mb-4">
        {quantidade}
      </p>

      {/* Barra */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${cor}`}
          style={{ width: `${Math.min(percentual, 100)}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {percentual.toFixed(1)}% da capacidade
      </p>
    </div>
  )
}
