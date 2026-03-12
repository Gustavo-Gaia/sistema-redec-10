
/* captura automática de medições - usado pelo cron */

/* app/api/coletar-medicoes/route.js */
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // 1. BUSCAR DADOS (Fetch das rotas de captura que você já utiliza)
    const [dadosAna, dadosInea] = await Promise.all([
      fetch(`${baseUrl}/api/ana`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/api/inea`, { cache: 'no-store' }).then(r => r.json()).catch(() => [])
    ]);

    // 2. NORMALIZAR DADOS (Igual ao seu fluxo manual)
    // Garantimos que cada objeto tenha exatamente as chaves esperadas pelo seu endpoint de salvamento
    const medicoes = [
      ...dadosAna.map(m => ({
        estacao_id: m.estacao_id,
        data: m.data,
        hora: m.hora,
        nivel: m.nivel,
        abaixo_regua: false,
        fonte: "ANA"
      })),
      ...dadosInea.map(m => ({
        estacao_id: m.estacao_id,
        data: m.data,
        hora: m.hora,
        nivel: m.nivel,
        abaixo_regua: false,
        fonte: "INEA"
      }))
    ];

    if (medicoes.length === 0) {
      return NextResponse.json({ status: "vazio", message: "Nenhum dado retornado" });
    }

    let inseridos = 0;
    let ignorados = 0;

    // 3. INSERÇÃO (Reutilizando a lógica do seu POST de salvamento)
    for (const m of medicoes) {
      if (!m.estacao_id || !m.data || !m.hora) continue;

      const dataHora = `${m.data} ${m.hora}`;

      const { error } = await supabase
        .from("medicoes")
        .insert({
          estacao_id: m.estacao_id,
          data_hora: dataHora,
          nivel: m.nivel,
          fonte: m.fonte, // Agora é a string "ANA" ou "INEA" definida acima
          abaixo_regua: m.abaixo_regua
        });

      if (error) {
        console.log(`Erro ao inserir estacao ${m.estacao_id}:`, error);
        if (error.code === "23505") ignorados++;
      } else {
        inseridos++;
      }
    }

    return NextResponse.json({ status: "sucesso", inseridos, ignorados });

  } catch (err) {
    console.error("Erro no robô:", err);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
