/* app/monitoramento/seletor.js */

"use client"

import { useMonitoramento } from "./MonitoramentoContext"

export default function SeletorMonitoramento({ rios, estacoes }) {

  const {
    rioSelecionado,
    setRioSelecionado,
    municipioSelecionado,
    setMunicipioSelecionado
  } = useMonitoramento()

  const municipiosFiltrados = estacoes.filter(
    (estacao) => estacao.rio_id === Number(rioSelecionado)
  )

  const municipiosUnicos = [
    ...new Set(municipiosFiltrados.map((e) => e.municipio))
  ]

  return (

    <div className="grid md:grid-cols-2 gap-6 mb-8">

      <div>

        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selecionar Rio
        </label>

        <select
          className="w-full p-2 border rounded-lg"
          value={rioSelecionado || ""}
          onChange={(e) => {
            setRioSelecionado(e.target.value)
            setMunicipioSelecionado("")
          }}
        >

          <option value="" disabled hidden>
            Selecione o rio
          </option>

          {[...rios]
            .sort((a, b) => {
              if (a.tipo === b.tipo) return a.nome.localeCompare(b.nome)
              if (a.tipo === "rio") return -1
              if (b.tipo === "rio") return 1
              return 0
            })
            .map((rio) => (
              <option key={rio.id} value={rio.id}>
                {rio.nome}
              </option>
            ))}

        </select>

      </div>

      <div>

        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selecionar Município
        </label>

        <select
          className="w-full p-2 border rounded-lg"
          value={municipioSelecionado || ""}
          onChange={(e) => setMunicipioSelecionado(e.target.value)}
          disabled={!rioSelecionado}
        >

          <option value="" disabled hidden>
            {rioSelecionado
              ? "Selecione o Município"
              : "Escolha primeiro o rio"}
          </option>

          {municipiosUnicos.map((municipio) => (
            <option key={municipio} value={municipio}>
              {municipio}
            </option>
          ))}

        </select>

      </div>

    </div>

  )
}
