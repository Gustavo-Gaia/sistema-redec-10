/* app/(sistema)/agenda/componentes/CalendarGrid.js */

export default function CalendarGrid({
  dataAtual,
  eventos = [],
  onSelectEvento,
  modo = "mes" // 🔥 novo (mes | semana)
}) {

  const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]

  const hoje = new Date().toDateString()

  // =====================================================
  // 🟢 MODO MENSAL (SEU ATUAL)
  // =====================================================
  if (modo === "mes") {

    const ano = dataAtual.getFullYear()
    const mes = dataAtual.getMonth()

    const primeiroDiaMes = new Date(ano, mes, 1)
    const ultimoDiaMes = new Date(ano, mes + 1, 0)

    let inicioSemana = primeiroDiaMes.getDay()
    inicioSemana = inicioSemana === 0 ? 6 : inicioSemana - 1

    const totalDiasMes = ultimoDiaMes.getDate()

    const celulas = []

    // 🔹 Dias anteriores
    for (let i = inicioSemana; i > 0; i--) {
      const dia = new Date(ano, mes, 1 - i)
      celulas.push({ data: dia, atual: false })
    }

    // 🔹 Dias do mês
    for (let i = 1; i <= totalDiasMes; i++) {
      const dia = new Date(ano, mes, i)
      celulas.push({ data: dia, atual: true })
    }

    // 🔹 Completar grade
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

            const isHoje = item.data.toDateString() === hoje

            const eventosDoDia = eventos.filter(ev =>
              new Date(ev.data_inicio).toDateString() === item.data.toDateString()
            )

            return (
              <div
                key={i}
                className={`h-28 border p-2 flex flex-col transition relative ${
                  item.atual
                    ? "bg-white"
                    : "bg-gray-50 text-gray-400"
                } ${isHoje ? "border-blue-500 border-2" : ""}`}
              >

                {/* DIA */}
                <div className={`text-sm font-semibold ${
                  isHoje ? "text-blue-600" : ""
                }`}>
                  {item.data.getDate()}
                </div>

                {/* EVENTOS */}
                <div className="mt-1 space-y-1 overflow-hidden">

                  {eventosDoDia.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvento(ev)
                      }}
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

  // =====================================================
  // 🔵 MODO SEMANA (BASE GOOGLE CALENDAR)
  // =====================================================
  if (modo === "semana") {

    // 🔥 pegar início da semana (segunda)
    const inicioSemana = new Date(dataAtual)
    const dia = inicioSemana.getDay()
    const diff = dia === 0 ? -6 : 1 - dia
    inicioSemana.setDate(inicioSemana.getDate() + diff)

    const dias = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana)
      d.setDate(inicioSemana.getDate() + i)
      dias.push(d)
    }

    const horas = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        {/* HEADER DIAS */}
        <div className="grid grid-cols-8 border-b">

          <div className="p-2" /> {/* coluna horas */}

          {dias.map((d, i) => {
            const isHoje = d.toDateString() === hoje

            return (
              <div
                key={i}
                className={`p-2 text-center text-sm font-medium ${
                  isHoje ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <div>{diasSemana[i]}</div>
                <div className="text-xs">{d.getDate()}</div>
              </div>
            )
          })}
        </div>

        {/* GRID HORAS */}
        <div className="grid grid-cols-8">

          {horas.map((hora) => (
            <>

              {/* COLUNA HORA */}
              <div
                key={`hora-${hora}`}
                className="h-16 border text-xs text-gray-400 flex items-start justify-end pr-2 pt-1"
              >
                {hora}:00
              </div>

              {/* DIAS */}
              {dias.map((d, i) => {

                const eventosHora = eventos.filter(ev => {
                  const data = new Date(ev.data_inicio)
                  return (
                    data.toDateString() === d.toDateString() &&
                    data.getHours() === hora
                  )
                })

                return (
                  <div
                    key={`${hora}-${i}`}
                    className="h-16 border relative"
                  >

                    {eventosHora.map(ev => (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvento(ev)}
                        className="absolute left-1 right-1 top-1 text-xs p-1 rounded-md cursor-pointer truncate"
                        style={{
                          backgroundColor: `${ev.cor || "#3b82f6"}20`,
                          borderLeft: `3px solid ${ev.cor || "#3b82f6"}`,
                          color: ev.cor || "#3b82f6"
                        }}
                      >
                        {ev.titulo}
                      </div>
                    ))}

                  </div>
                )
              })}

            </>
          ))}

        </div>
      </div>
    )
  }
}
