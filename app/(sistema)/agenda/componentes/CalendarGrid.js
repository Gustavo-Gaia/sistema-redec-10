/* app/(sistema)/agenda/componentes/CalendarGrid.js */

export default function CalendarGrid({ dataAtual }) {

  const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]

  const ano = dataAtual.getFullYear()
  const mes = dataAtual.getMonth()

  const primeiroDiaMes = new Date(ano, mes, 1)
  const ultimoDiaMes = new Date(ano, mes + 1, 0)

  // Ajuste para começar na segunda (padrão BR)
  let inicioSemana = primeiroDiaMes.getDay()
  inicioSemana = inicioSemana === 0 ? 6 : inicioSemana - 1

  const totalDiasMes = ultimoDiaMes.getDate()

  const celulas = []

  // 🔹 Dias do mês anterior (cinza)
  for (let i = inicioSemana; i > 0; i--) {
    const dia = new Date(ano, mes, 1 - i)
    celulas.push({ data: dia, atual: false })
  }

  // 🔹 Dias do mês atual
  for (let i = 1; i <= totalDiasMes; i++) {
    const dia = new Date(ano, mes, i)
    celulas.push({ data: dia, atual: true })
  }

  // 🔹 Completar até 42 células (6 semanas)
  while (celulas.length < 42) {
    const ultimo = celulas[celulas.length - 1].data
    const proximo = new Date(ultimo)
    proximo.setDate(ultimo.getDate() + 1)

    celulas.push({ data: proximo, atual: false })
  }

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">

      {/* DIAS DA SEMANA */}
      <div className="grid grid-cols-7 border-b text-sm font-medium text-gray-500">
        {diasSemana.map((d) => (
          <div key={d} className="p-2 text-center">
            {d}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7">

        {celulas.map((item, i) => (
          <div
            key={i}
            className={`h-28 border p-2 flex flex-col ${
              item.atual ? "bg-white" : "bg-gray-50 text-gray-400"
            }`}
          >
            <div className="text-sm font-semibold">
              {item.data.getDate()}
            </div>

            {/* Espaço para eventos (vamos usar depois) */}
            <div className="mt-1 space-y-1 flex-1 overflow-hidden">
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}
