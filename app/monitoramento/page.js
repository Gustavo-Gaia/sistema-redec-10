/* app/monitoramento/page.js */

import { supabase } from "@/lib/supabase"

export default async function Monitoramento() {

  const { data: rios, error } = await supabase
    .from("rios")
    .select("*")

  if (error) {
    console.error(error)
  }

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50">

      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Monitoramento Hidrológico
      </h2>

      <p className="text-slate-600 mb-6">
        Teste de conexão com banco de dados
      </p>

      <div className="mb-6">
        <p className="font-semibold text-slate-700 mb-2">
          Rios cadastrados:
        </p>

        <ul className="list-disc ml-6 text-slate-700">
          {rios?.map((rio) => (
            <li key={rio.id}>
              {rio.nome_rio}
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
