/* app/(sistema)/monitoramento/MonitoramentoContext.js */

"use client"

import { createContext, useContext, useState } from "react"

const MonitoramentoContext = createContext()

export function MonitoramentoProvider({ children }) {

  const [rioSelecionado, setRioSelecionado] = useState(null)
  const [municipioSelecionado, setMunicipioSelecionado] = useState(null)

  return (
    <MonitoramentoContext.Provider
      value={{
        rioSelecionado,
        setRioSelecionado,
        municipioSelecionado,
        setMunicipioSelecionado
      }}
    >
      {children}
    </MonitoramentoContext.Provider>
  )
}

export function useMonitoramento() {
  return useContext(MonitoramentoContext)
}
