/* app/(sistema)/monitoramento/componentes/ResumoSituacao.js */

"use client"

import { calcularSituacao } from "../utils/calcularSituacao"

export default function ResumoSituacao({ estacoes, ultimasMedicoes }) {

  const contagem = {
    normal: 0,
    alerta: 0,
    transbordo: 0,
    extremo: 0,
    sem_cota: 0,
    abaixo_regua: 0,
    sem_dado: 0
  }

  estacoes.forEach((estacao) => {

    const medicao = ultimasMedicoes.find(
      (m) => m.estacao_id === estacao.id
    )

    const situacao = calcularSituacao(estacao, medicao)

    if (contagem[situacao.status] !== undefined) {
      contagem[situacao.status]++
    }

  })

  const cards = [
    {
      label: "Normal",
      valor: contagem.normal,
      cor: "bg-green-500"
    },
    {
      label: "Alerta",
      valor: contagem.alerta,
      cor: "bg-yellow-500"
    },
    {
      label: "Transbordo",
      valor: contagem.transbordo,
      cor: "bg-red-500"
    },
    {
      label: "Risco Extremo",
      valor: contagem.extremo,
      cor: "bg-purple-600"
    },
    {
      label: "Sem Cota",
      valor: contagem.sem_cota,
      cor: "bg-gray-400"
    },
    {
      label: "Abaixo da Régua",
      valor: contagem.abaixo_regua,
      cor: "bg-slate-500"
    }
  ]

  return (

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">

      {cards.map((card) => (

        <div
          key={card.label}
          className="bg-white border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center"
        >

          <div
            className={`w-4 h-4 rounded-full mb-2 ${card.cor}`}
          />

          <span className="text-sm text-slate-600">
            {card.label}
          </span>

          <span className="text-2xl font-bold text-slate-800">
            {card.valor}
          </span>

        </div>

      ))}

    </div>

  )
}
