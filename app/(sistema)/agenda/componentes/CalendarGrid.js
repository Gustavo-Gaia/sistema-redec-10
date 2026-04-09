/* app/(sistema)/agenda/componentes/CalendarGrid.js */

"use client"

import { useEffect, useRef } from "react"

export default function CalendarGrid({
  dataAtual,
  eventos = [],
  onSelectEvento,
  modo = "mes"
}) {

  const scrollContainerRef = useRef(null) // Referência para o scroll
  const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]
  const hoje = new Date().toDateString()

  // 🔹 EFEITO PARA SCROLL AUTOMÁTICO (Inicia nas 07:00)
  useEffect(() => {
    if (modo === "semana" && scrollContainerRef.current) {
      // Cada bloco de hora tem min-h-[64px] no seu código
      // 7 horas * 64px = 448px de deslocamento
      scrollContainerRef.current.scrollTo({
        top: 448,
        behavior: "smooth"
      })
    }
  }, [modo])

  function extrairDataTexto(dataISO) {
    if (!dataISO) return ""
    return dataISO.includes("T") ? dataISO.split("T")[0] : dataISO.split(" ")[0]
  }

  function extrairHoraTexto(dataISO) {
    if (!dataISO) return null
    const horaParte = dataISO.includes("T") ? dataISO.split("T")[1] : dataISO.split(" ")[1]
    return parseInt(horaParte.split(":")[0])
  }

  // =====================================================
  // 🟢 MODO MENSAL (Mantido Original)
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
        <div className="grid grid-cols-7 border-b text-sm font-medium text-gray-500 bg-gray-50/50">
          {diasSemana.map((d) => (
            <div key={d} className="p-3 text-center">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {celulas.map((item, i) => {
            const isHoje = item.data.toDateString() === hoje
            const dataStringCelula = item.data.toISOString().split('T')[0]
            const eventosDoDia = eventos.filter(ev => extrairDataTexto(ev.data_inicio) === dataStringCelula)

            return (
              <div
                key={i}
                className={`h-32 border-b border-r p-2 flex flex-col transition relative group ${
                  item.atual ? "bg-white" : "bg-gray-50 text-gray-300"
                } ${isHoje ? "bg-blue-50/30" : ""}`}
              >
                <div className={`text-sm font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isHoje ? "bg-blue-600 text-white" : ""}`}>
                  {item.data.getDate()}
                </div>

                <div className="space-y-1 overflow-y-auto custom-scrollbar">
                  {eventosDoDia.slice(0, 4).map(ev => (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvento(ev)
                      }}
                      className="text-[10px] p-1.5 rounded-lg cursor-pointer truncate font-semibold border-l-4 shadow-sm hover:brightness-95 transition-all"
                      style={{
                        backgroundColor: `${ev.cor || "#3b82f6"}15`,
                        borderColor: ev.cor || "#3b82f6",
                        color: ev.cor || "#3b82f6"
                      }}
                    >
                      {ev.titulo}
                    </div>
                  ))}
                  {eventosDoDia.length > 4 && (
                    <div className="text-[9px] text-gray-400 font-bold px-1">
                      + {eventosDoDia.length - 4} atividades
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
  // 🔵 MODO SEMANA (Com Scroll Automático)
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
      <div className="bg-white rounded-2xl shadow overflow-hidden border">
        {/* CABEÇALHO FIXO DA SEMANA */}
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="p-2 border-r" /> 
          {dias.map((d, i) => (
            <div key={i} className={`p-3 text-center border-r last:border-0 ${d.toDateString() === hoje ? "bg-blue-50" : ""}`}>
              <div className="text-xs font-bold text-gray-400">{diasSemana[i]}</div>
              <div className={`text-lg font-black ${d.toDateString() === hoje ? "text-blue-600" : "text-gray-700"}`}>{d.getDate()}</div>
            </div>
          ))}
        </div>

        {/* CONTAINER COM SCROLL CONTROLADO */}
        <div 
          ref={scrollContainerRef}
          className="flex flex-col h-[600px] overflow-y-auto custom-scrollbar"
        >
          {horas.map((hora) => (
            <div key={hora} className="grid grid-cols-8 border-b min-h-[64px] group">
              <div className="text-[10px] text-gray-400 flex items-start justify-end pr-3 pt-2 bg-gray-50 border-r font-medium">
                {String(hora).padStart(2, '0')}:00
              </div>

              {dias.map((d, i) => {
                const dataStr = d.toISOString().split('T')[0]
                const eventosHora = eventos.filter(ev => 
                  extrairDataTexto(ev.data_inicio) === dataStr && 
                  extrairHoraTexto(ev.data_inicio) === hora
                )

                return (
                  <div key={`${hora}-${i}`} className="border-r last:border-0 relative group-hover:bg-gray-50/30 transition-colors">
                    {eventosHora.map(ev => (
                      <div
                        key={ev.id}
                        onClick={() => onSelectEvento(ev)}
                        className="absolute inset-x-1 top-1 z-10 text-[10px] p-1.5 rounded-lg cursor-pointer truncate font-bold border-l-4 shadow-sm"
                        style={{
                          backgroundColor: `${ev.cor || "#3b82f6"}ee`,
                          borderColor: ev.cor || "#3b82f6",
                          color: "#fff"
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
    )
  }
}
