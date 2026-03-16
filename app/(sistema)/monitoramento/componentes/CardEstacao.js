/* app/(sistema)/monitoramento/componentes/CardEstacao.js */

"use client"

import { useEffect, useState } from "react"
import { useMonitoramento } from "../MonitoramentoContext"
import { calcularSituacao } from "../utils/calcularSituacao"

export default function CardEstacao() {

  const { estacaoSelecionada } = useMonitoramento()

  const [medicao, setMedicao] = useState(null)

  useEffect(() => {

    if (!estacaoSelecionada) return

    async function carregar() {

      const res = await fetch(
        `/api/historico-estacao?id=${estacaoSelecionada.id}&limit=1`
      )

      const dados = await res.json()

      setMedicao(dados?.[0] || null)

    }

    carregar()

  }, [estacaoSelecionada])



  if (!estacaoSelecionada) {

    return (
      <div className="bg-white border rounded-xl p-6 text-center text-slate-500">
        Selecione um rio e município para visualizar a estação.
      </div>
    )

  }



  const situacao = calcularSituacao(estacaoSelecionada, medicao)



  let percentual = null

  if (
    medicao &&
    !medicao.abaixo_regua &&
    estacaoSelecionada.nivel_transbordo
  ) {

    percentual = (
      (medicao.nivel / estacaoSelecionada.nivel_transbordo) * 100
    ).toFixed(0)

  }



  return (

    <div className="bg-white border rounded-xl shadow-sm p-5 md:p-6">

      {/* CABEÇALHO */}

      <div className="mb-5">

        <h3 className="text-lg md:text-xl font-bold text-slate-800">

          {estacaoSelecionada.municipio}

        </h3>

        <p className="text-sm text-slate-500">
          Estação de monitoramento
        </p>

      </div>



      {/* GRID RESPONSIVO */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">



        {/* STATUS */}

        <div>

          <div className="text-xs md:text-sm text-slate-500 mb-1">
            Status
          </div>

          <div className="flex items-center gap-2">

            <div className={`w-3 h-3 rounded-full ${situacao.cor}`} />

            <span className="font-semibold text-slate-800 text-sm md:text-base">
              {situacao.texto}
            </span>

          </div>

        </div>



        {/* NÍVEL */}

        <div>

          <div className="text-xs md:text-sm text-slate-500 mb-1">
            Nível Atual
          </div>

          <div className="font-bold text-slate-800 text-base md:text-lg">

            {medicao?.abaixo_regua
              ? "A/R"
              : medicao?.nivel
              ? `${medicao.nivel} m`
              : "—"}

          </div>

        </div>



        {/* PERCENTUAL */}

        <div>

          <div className="text-xs md:text-sm text-slate-500 mb-1">
            Percentual da Cota
          </div>

          <div className="font-bold text-slate-800 text-base md:text-lg">

            {percentual ? `${percentual}%` : "—"}

          </div>

        </div>



        {/* COTA */}

        <div>

          <div className="text-xs md:text-sm text-slate-500 mb-1">
            Cota de Transbordo
          </div>

          <div className="font-bold text-slate-800 text-base md:text-lg">

            {estacaoSelecionada.nivel_transbordo
              ? `${estacaoSelecionada.nivel_transbordo} m`
              : "—"}

          </div>

        </div>

      </div>

    </div>

  )

}
