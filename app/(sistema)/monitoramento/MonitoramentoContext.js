/* app/(sistema)/monitoramento/MonitoramentoContext.js */

"use client"

import { createContext, useContext, useState } from "react"

const MonitoramentoContext = createContext()

export function MonitoramentoProvider({ children }) {

  const [rioSelecionado, setRioSelecionado] = useState(null)
  const [municipioSelecionado, setMunicipioSelecionado] = useState(null)

  const [estacaoSelecionada, setEstacaoSelecionada] = useState(null)

  return (
    <MonitoramentoContext.Provider
      value={{
        rioSelecionado,
        setRioSelecionado,

        municipioSelecionado,
        setMunicipioSelecionado,

        estacaoSelecionada,
        setEstacaoSelecionada
      }}
    >
      {children}
    </MonitoramentoContext.Provider>
  )
}

export function useMonitoramento() {
  return useContext(MonitoramentoContext)
}
