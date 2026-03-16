/* app/(sistema)/monitoramento/componentes/TabelaHistorico.js */

"use client"

import { useEffect, useState } from "react"

export default function TabelaHistorico({ estacao }) {

  const [dados, setDados] = useState([])

  useEffect(() => {

    async function carregar() {

      const res = await fetch(
        `/api/historico-estacao?id=${estacao.id}`
      )

      const json = await res.json()

      setDados(json)

    }

    carregar()

  }, [estacao])

  return (

    <div className="bg-white border rounded-xl shadow-sm p-6">

      <h3 className="font-bold text-slate-800 mb-4">
        Histórico de medições
      </h3>

      <table className="w-full text-sm">

        <thead>

          <tr className="text-left text-slate-500 border-b">

            <th className="py-2">Data</th>
            <th className="py-2">Hora</th>
            <th className="py-2">Nível</th>

          </tr>

        </thead>

        <tbody>

          {dados.map((item, i) => {

            const data = new Date(item.data_hora)

            return (

              <tr key={i} className="border-b">

                <td className="py-2">
                  {data.toLocaleDateString("pt-BR")}
                </td>

                <td className="py-2">
                  {data.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>

                <td className="py-2">
                  {item.nivel} m
                </td>

              </tr>

            )

          })}

        </tbody>

      </table>

    </div>

  )
}
