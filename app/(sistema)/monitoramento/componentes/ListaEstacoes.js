/* app/(sistema)/monitoramento/componentes/ListaEstacoes.js */

"use client"

import { calcularSituacao } from "../utils/calcularSituacao"

export default function ListaEstacoes({
  estacoes,
  ultimasMedicoes,
  rios
}) {

  const lista = estacoes.map((estacao) => {

    const medicao = ultimasMedicoes.find(
      (m) => m.estacao_id === estacao.id
    )

    const situacao = calcularSituacao(estacao, medicao)

    const rio = rios.find((r) => r.id === estacao.rio_id)

    return {
      ...estacao,
      rio_nome: rio?.nome || "Rio",
      medicao,
      situacao
    }

  })

  return (

    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

      {lista.map((estacao) => (

        <div
          key={estacao.id}
          className="flex items-center justify-between p-4 border-b last:border-none hover:bg-slate-50 transition cursor-pointer"
        >

          {/* LADO ESQUERDO */}

          <div className="flex items-center gap-3">

            <div
              className={`w-3 h-3 rounded-full ${estacao.situacao.cor}`}
            />

            <div>

              <div className="font-semibold text-slate-800">

                {estacao.rio_nome}

              </div>

              <div className="text-sm text-slate-500">

                {estacao.municipio}

              </div>

            </div>

          </div>


          {/* LADO DIREITO */}

          <div className="text-right">

            {estacao.medicao?.abaixo_regua ? (

              <span className="text-slate-600 font-semibold">
                A/R
              </span>

            ) : estacao.medicao?.nivel ? (

              <span className="font-semibold text-slate-800">
                {estacao.medicao.nivel} m
              </span>

            ) : (

              <span className="text-slate-400">
                —
              </span>

            )}

          </div>

        </div>

      ))}

    </div>

  )
}
