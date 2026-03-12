
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

    // 1. BUSCA
    const [dadosAna, dadosInea] = await Promise.all([
      fetch(`${baseUrl}/api/ana`, { cache: 'no-store' }).then(r => r.json()).catch(() => []),
      fetch(`${baseUrl}/api/inea`, { cache: 'no-store' }).then(r => r.json()).catch(() => [])
    ]);

    const medicoes = [
      ...dadosAna.map(m => ({ ...m, fonte: m.fonte || "ANA" })),
      ...dadosInea.map(m => ({ ...m, fonte: m.fonte || "INEA" }))
    ];

    // 2. INSERÇÃO COM VERIFICAÇÃO DE DADOS
    for (const m of medicoes) {
      if (!m.estacao_id) continue;

      // Vamos verificar se a fonte é válida antes de enviar
      const fonteParaEnviar = m.fonte || "FONTE_NULA_DETECTADA";

      const payload = {
        estacao_id: m.estacao_id,
        data_hora: `${m.data} ${m.hora}`,
        nivel: m.nivel,
        fonte: fonteParaEnviar,
        abaixo_regua: m.abaixo_regua || false
      };

      const { error } = await supabase.from("medicoes").insert(payload);

      if (error) {
        // Se der erro, vamos retornar o erro E o payload para sabermos o que falhou
        return NextResponse.json({ 
          status: "erro_no_banco", 
          error, 
          payload_enviado: payload 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ status: "sucesso", total: medicoes.length });
  } catch (err) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
