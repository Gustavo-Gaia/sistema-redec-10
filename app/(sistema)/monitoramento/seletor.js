/* app/(sistema)/monitoramento/seletor.js */

"use client"

import { useMonitoramento } from "./MonitoramentoContext"

export default function SeletorMonitoramento({ rios, estacoes }) {

  const {
    rioSelecionado,
    setRioSelecionado,
    municipioSelecionado,
    setMunicipioSelecionado,
    setEstacaoSelecionada
  } = useMonitoramento()

  // Filtra os municípios apenas do rio selecionado
  const municipiosFiltrados = estacoes.filter(
    (estacao) => estacao.rio_id === Number(rioSelecionado)
  )

  // Mantém somente valores únicos
  const municipiosUnicos = [
    ...new Set(municipiosFiltrados.map((e) => e.municipio))
  ]

  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 md:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

        {/* ========================= */}
        {/* SELETOR RIO */}
        {/* ========================= */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Selecionar Rio
          </label>

          <select
            className="w-full p-3 border rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            value={rioSelecionado || ""}
            onChange={(e) => {
              setRioSelecionado(e.target.value)
              setMunicipioSelecionado("")
              setEstacaoSelecionada(null)
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

        {/* ========================= */}
        {/* SELETOR MUNICÍPIO */}
        {/* ========================= */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Selecionar Município
          </label>

          <select
            className="w-full p-3 border rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
            value={municipioSelecionado || ""}
            disabled={!rioSelecionado}
            onChange={(e) => {
              const municipio = e.target.value
              setMunicipioSelecionado(municipio)

              // Encontra a estação
              const estacao = estacoes.find(
                (est) =>
                  est.municipio === municipio &&
                  est.rio_id === Number(rioSelecionado)
              )

              // Encontra o nome do rio
              const rioEncontrado = rios.find(
                (r) => r.id === Number(rioSelecionado)
              )

              if (estacao) {
                // Adiciona o nome do rio ao objeto da estação
                setEstacaoSelecionada({
                  ...estacao,
                  nome_rio: rioEncontrado ? rioEncontrado.nome : "—"
                })
              }
            }}
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
    </div>
  )
}
