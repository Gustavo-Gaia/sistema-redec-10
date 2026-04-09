/* app/(sistema)/agenda/componentes/CalendarGrid.js */

"use client"

import { useEffect, useRef } from "react"

export default function CalendarGrid({
  dataAtual,
  eventos = [],
  onSelectEvento,
  modo = "mes"
}) {
  const scrollContainerRef = useRef(null)
  const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]

  // 🔹 DATA DE HOJE (estática e segura)
  const hojeObj = new Date()
  const hojeString = `${hojeObj.getFullYear()}-${String(hojeObj.getMonth() + 1).padStart(2, '0')}-${String(hojeObj.getDate()).padStart(2, '0')}`

  // 🔹 SCROLL AUTOMÁTICO (Opção 1: Foco às 07h)
  useEffect(() => {
    if (modo === "semana" && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 448, // 7 horas * 64px de altura
        behavior: "smooth"
      })
    }
  }, [modo])

  // Helpers de extração de texto para evitar erros de fuso
  function extrairDataTexto(dataISO) {
    if (!dataISO) return ""
    return dataISO.includes("T") ? dataISO.split("T")[0] : dataISO.split(" ")[0]
  }

  function extrairHoraTexto(dataISO) {
    if (!dataISO) return null
    const parte = dataISO.includes("T") ? dataISO.split("T")[1] : dataISO.split(" ")[1]
    return parseInt(parte.split(":")[0])
  }

  // =====================================================
  // 🟢 MODO MENSAL (Restaurado o seu Estilo de Borda)
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

    for (let i = inicioSemana; i > 0; i--) {
      const dia = new Date(ano, mes, 1 - i)
      celulas.push({ data: dia, atual: false })
    }

    for (let i = 1; i <= totalDiasMes; i++) {
      const dia = new Date(ano, mes, i)
      celulas.push({ data: dia, atual: true })
    }

    while (celulas.length < 42) {
      const ultimo = celulas[celulas.length - 1].data
      const proximo = new Date(ultimo)
      proximo.setDate(ultimo.getDate() + 1)
      celulas.push({ data: proximo, atual: false })
    }

    return (
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="grid grid-cols-7 border-b text-sm font-medium text-gray-500 bg-gray-50/30">
          {diasSemana.map((d) => (
            <div key={d} className="p-2 text-center">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {celulas.map((item, i) => {
            const dataStr = `${item.data.getFullYear()}-${String(item.data.getMonth() + 1).padStart(2, '0')}-${String(item.data.getDate()).padStart(2, '0')}`
            const isHoje = dataStr === hojeString
            const eventosDoDia = eventos.filter(ev => extrairDataTexto(ev.data_inicio) === dataStr)

            return (
              <div
                key={i}
                className={`h-28 border p-2 flex flex-col transition relative ${
                  item.atual ? "bg-white" : "bg-gray-50/50 text-gray-400"
                } ${isHoje ? "border-blue-500 border-2 z-10 shadow-inner bg-blue-50/20" : "border-gray-100"}`}
              >
                <div className={`text-sm font-bold ${isHoje ? "text-blue-600" : "text-gray-700"}`}>
                  {item.data.getDate()}
                </div>

                <div className="mt-1 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                  {eventosDoDia.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvento(ev)
                      }}
                      className="text-[10px] md:text-xs p-1 rounded-md cursor-pointer truncate font-bold border-l-4 shadow-sm"
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
                    <div className="text-[10px] text-gray-400 font-bold italic px-1">
                      + {eventosDoDia.length - 3} mais
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
  // 🔵 MODO SEMANA (Com Scroll e Correção de Marcação)
  // =====================================================
  if (modo === "semana") {
    const inicioSemana = new Date(dataAtual)
    const diaNum = inicioSemana.getDay()
    const diff = diaNum === 0 ? -6 : 1 - diaNum
    inicioSemana.setDate(inicioSemana.getDate() + diff)

    const dias = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana)
      d.setDate(inicioSemana.getDate() + i)
      dias.push(d)
    }

    const horas = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100 flex flex-col h-[700px]">
        {/* HEADER FIXO */}
        <div className="grid grid-cols-8 border-b bg-gray-50/50">
          <div className="p-2 border-r border-gray-100" />
          {dias.map((d, i) => {
            const dataStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const isHoje = dataStr === hojeString
            return (
              <div key={i} className={`p-2 text-center border-r border-gray-100 last:border-0 ${isHoje ? "bg-blue-50/50" : ""}`}>
                <div className={`text-[10px] font-bold ${isHoje ? "text-blue-600" : "text-gray-400"}`}>{diasSemana[i]}</div>
                <div className={`text-sm font-black ${isHoje ? "text-blue-600" : "text-gray-700"}`}>{d.getDate()}</div>
              </div>
            )
          })}
        </div>

        {/* ÁREA DE SCROLL */}
        <div ref={scrollContainerRef} className="overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-8">
            {horas.map((hora) => (
              <div key={hora} className="contents">
                {/* COLUNA HORA - Ajustada para maior legibilidade */}
                <div className="h-16 border-b border-r border-gray-100 text-sm font-bold text-gray-600 flex items-start justify-end pr-3 pt-2 bg-gray-50/50">
                  {String(hora).padStart(2, '0')}:00
                </div>

                {dias.map((d, i) => {
                  const dataStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                  const eventosHora = eventos.filter(ev => 
                    extrairDataTexto(ev.data_inicio) === dataStr && 
                    extrairHoraTexto(ev.data_inicio) === hora
                  )

                  return (
                    <div key={`${hora}-${i}`} className={`h-16 border-b border-r border-gray-100 last:border-0 relative hover:bg-gray-50/50 transition-colors ${dataStr === hojeString ? "bg-blue-50/10" : ""}`}>
                      {eventosHora.map(ev => (
                        <div
                          key={ev.id}
                          onClick={() => onSelectEvento(ev)}
                          className="absolute inset-x-1 top-1 z-10 text-[10px] p-1 rounded-md cursor-pointer truncate font-bold border-l-4 shadow-sm"
                          style={{
                            backgroundColor: `${ev.cor || "#3b82f6"}25`,
                            borderColor: ev.cor || "#3b82f6",
                            color: ev.cor || "#3b82f6"
                          }}
                        >
                          {ev.titulo}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}
