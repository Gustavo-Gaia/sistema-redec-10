/* app/(sistema)/monitoramento/page.js */

import { supabase } from "@/lib/supabase" // ✅ CORRIGIDO: Usa a instância única
import { MonitoramentoProvider } from "./MonitoramentoContext"
import TabsMonitoramento from "./TabsMonitoramento"
import { unstable_noStore as noStore } from "next/cache"

export default async function Monitoramento() {

  // 🔥 REMOVE QUALQUER CACHE (Garante dado novo a cada acesso)
  noStore()

  /* ============================= */
  /* RIOS */
  /* ============================= */
  const { data: rios } = await supabase
    .from("rios")
    .select("*")
    .eq("ativo", true)
    .order("nome")

  /* ============================= */
  /* ESTAÇÕES */
  /* ============================= */
  const { data: estacoes } = await supabase
    .from("estacoes")
    .select("*")
    .eq("ativo", true)

  /* ============================= */
  /* ÚLTIMAS MEDIÇÕES (Função no Banco) */
  /* ============================= */
  const { data: ultimasMedicoes } = await supabase
    .rpc("ultimas_medicoes")

  // 🔥 FORÇA RE-RENDER (Identificador de mudança)
  const lastUpdate = ultimasMedicoes?.[0]?.data_hora || Date.now()

  return (
    <MonitoramentoProvider
      key={lastUpdate}
      estacoes={estacoes || []}
      ultimasMedicoes={ultimasMedicoes || []}
    >

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/50">

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Monitoramento Hidrológico
        </h2>

        <p className="text-slate-600 mb-6">
          Sistema de acompanhamento das estações hidrológicas da região.
        </p>

        {/* Distribui os dados para as abas (Mapa, Cards, Relatório) */}
        <TabsMonitoramento
          rios={rios || []}
          estacoes={estacoes || []}
        />

      </div>

    </MonitoramentoProvider>
  )
}
