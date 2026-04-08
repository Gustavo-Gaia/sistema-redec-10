/* app/(sistema)/agenda/componentes/CalendarGrid.js */

export default function CalendarGrid({ dataAtual, eventos = [], onSelectEvento }) {

  const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]

  const ano = dataAtual.getFullYear()
  const mes = dataAtual.getMonth()

  const hoje = new Date().toDateString()

  const primeiroDiaMes = new Date(ano, mes, 1)
  const ultimoDiaMes = new Date(ano, mes + 1, 0)

  // Começando na segunda
  let inicioSemana = primeiroDiaMes.getDay()
  inicioSemana = inicioSemana === 0 ? 6 : inicioSemana - 1

  const totalDiasMes = ultimoDiaMes.getDate()

  const celulas = []

  // 🔹 Dias do mês anterior
  for (let i = inicioSemana; i > 0; i--) {
    const dia = new Date(ano, mes, 1 - i)
    celulas.push({ data: dia, atual: false })
  }

  // 🔹 Dias do mês atual
  for (let i = 1; i <= totalDiasMes; i++) {
    const dia = new Date(ano, mes, i)
    celulas.push({ data: dia, atual: true })
  }

  // 🔹 Completar até 42 células
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

        {celulas.map((item, i) => {

          // 🔥 EVENTOS DO DIA
          const eventosDoDia = eventos.filter(ev =>
            new Date(ev.data_inicio).toDateString() === item.data.toDateString()
          )

          const isHoje = item.data.toDateString() === hoje

          return (
            <div
              key={i}
              className={`h-28 border p-2 flex flex-col transition ${
                item.atual
                  ? "bg-white"
                  : "bg-gray-50 text-gray-400"
              } ${isHoje ? "border-blue-500 border-2" : ""}`}
            >

              {/* DIA */}
              <div className={`text-sm font-semibold ${isHoje ? "text-blue-600" : ""}`}>
                {item.data.getDate()}
              </div>

              {/* EVENTOS */}
              <div className="mt-1 space-y-1 overflow-hidden">

                {eventosDoDia.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvento(ev)}
                    className="text-[10px] md:text-xs p-1.5 rounded-lg cursor-pointer truncate font-medium border-l-4 transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: `${ev.cor || "#3b82f6"}20`,
                      borderColor: ev.cor || "#3b82f6",
                      color: ev.cor || "#3b82f6"
                    }}
                  >
                    {ev.titulo}
                  </div>
                ))}

                {/* +X MAIS */}
                {eventosDoDia.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{eventosDoDia.length - 3} mais
                  </div>
                )}

              </div>

            </div>
          )
        })}

      </div>
    </div>
  )
}
