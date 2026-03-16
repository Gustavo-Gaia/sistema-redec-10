/* app/(sistema)/monitoramento/componentes/LegendaStatus.js */

export default function LegendaStatus() {

  const itens = [

    {
      cor: "bg-green-500",
      texto: "Normal — abaixo de 85% da cota de transbordo"
    },

    {
      cor: "bg-yellow-500",
      texto: "Alerta — entre 85% e 99% da cota"
    },

    {
      cor: "bg-red-500",
      texto: "Transbordo — entre 100% e 120% da cota"
    },

    {
      cor: "bg-purple-600",
      texto: "Risco Hidrológico Extremo — acima de 120%"
    },

    {
      cor: "bg-gray-400",
      texto: "Sem cota de transbordo — monitoramento sem referência"
    },

    {
      cor: "bg-slate-500",
      texto: "A/R — Abaixo da Régua de medição"
    }

  ]

  return (

    <div className="bg-white border rounded-xl shadow-sm p-5 md:p-6">

      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Legenda Hidrológica
      </h3>

      <div className="space-y-2 text-sm">

        {itens.map((item, i) => (

          <div
            key={i}
            className="flex items-center gap-3"
          >

            <div
              className={`w-3 h-3 rounded-full ${item.cor}`}
            />

            <span className="text-slate-700">

              {item.texto}

            </span>

          </div>

        ))}

      </div>

    </div>

  )

}
