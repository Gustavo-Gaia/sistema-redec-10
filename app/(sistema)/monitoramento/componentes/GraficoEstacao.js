/* app/(sistema)/monitoramento/componentes/GraficoEstacao.js */

"use client"

import { useEffect, useState } from "react"

export default function GraficoEstacao({ estacao }) {

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

  if (!dados.length) {

    return (
      <div className="bg-white border rounded-xl p-6 text-slate-500">
        Sem dados para gráfico
      </div>
    )

  }

  return (

    <div className="bg-white border rounded-xl shadow-sm p-6">

      <h3 className="font-bold text-slate-800 mb-4">
        Evolução do nível do rio
      </h3>

      <div className="space-y-2">

        {dados.map((item, i) => (

          <div
            key={i}
            className="flex justify-between text-sm border-b pb-1"
          >

            <span>{item.hora}</span>

            <span className="font-semibold">
              {item.nivel} m
            </span>

          </div>

        ))}

      </div>

    </div>

  )

}
