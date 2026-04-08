/* app/(sistema)/agenda/componentes/ModalEvento.js */

export default function CalendarGrid({ dataAtual }) {

  const primeiroDiaDoMes = new Date(
    dataAtual.getFullYear(),
    dataAtual.getMonth(),
    1
  ).getDay()

  const diasDoMes = new Date(
    dataAtual.getFullYear(),
    dataAtual.getMonth() + 1,
    0
  ).getDate()

  const celulas = []

  for (let i = 0; i < primeiroDiaDoMes; i++) {
    celulas.push(null)
  }

  for (let i = 1; i <= diasDoMes; i++) {
    celulas.push(
      new Date(dataAtual.getFullYear(), dataAtual.getMonth(), i)
    )
  }

  return (
    <div className="grid grid-cols-7 gap-2">

      {celulas.map((dia, i) => (
        <div
          key={i}
          className="bg-white min-h-[120px] rounded-2xl p-2 shadow"
        >
          {dia && (
            <div className="text-sm font-semibold">
              {dia.getDate()}
            </div>
          )}
        </div>
      ))}

    </div>
  )
}
