/* app/(sistema)/monitoramento/componentes/TabelaHistorico.js */

"use client"

import { useEffect, useState } from "react"
import { calcularSituacao } from "../utils/calcularSituacao"

export default function TabelaHistorico({ estacao }) {

  const [dados, setDados] = useState([])

  useEffect(() => {

    async function carregar() {

      const res = await fetch(
        `/api/historico-estacao?id=${estacao.id}&limit=100`
      )

      const json = await res.json()

      setDados(json)

    }

    carregar()

  }, [estacao])

  const ultimos = dados.slice(0, 10)

  return (

    <div className="bg-white border rounded-xl shadow-sm p-5 md:p-6">

      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Histórico de Medições
      </h3>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>

            <tr className="text-left border-b text-slate-600">

              <th className="py-2">Data</th>
              <th>Hora</th>
              <th>Nível</th>

            </tr>

          </thead>

          <tbody>

            {ultimos.map((m, i) => {

              const situacao = calcularSituacao(estacao, m)

              const data = new Date(m.data_hora)

              return (

                <tr
                  key={i}
                  className="border-b last:border-none hover:bg-slate-50"
                >

                  <td className="py-2">

                    {data.toLocaleDateString("pt-BR")}

                  </td>

                  <td>

                    {data.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}

                  </td>

                  <td>

                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${situacao.cor}`}
                    >

                      {m.abaixo_regua
                        ? "A/R"
                        : `${m.nivel} m`}

                    </span>

                  </td>

                </tr>

              )

            })}

          </tbody>

        </table>

      </div>

    </div>

  )

}
