/* app/api/viaturas/sync-multas/route.js */

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { multas, renavam } = await req.json();

    // 1. Localizar a viatura pelo Renavam
    const { data: viatura, error: vError } = await supabase
      .from("viaturas")
      .select("id")
      .eq("renavam", renavam)
      .single();

    if (!viatura || vError) {
      return NextResponse.json({ error: "Viatura não cadastrada com este Renavam" }, { status: 404 });
    }

    const viaturaId = viatura.id;

    // 2. Buscar autos que já temos no banco para esta viatura
    const { data: banco } = await supabase
      .from("viaturas_multas")
      .select("numero_auto")
      .eq("viatura_id", viaturaId);

    const autosNoBanco = banco?.map(m => m.numero_auto) || [];
    const autosNoDetran = multas.map(m => m.numero_auto);

    // 3. Lógica de Sincronização:
    // Novas: Estão no Detran mas NÃO no banco
    const novasMultas = multas.filter(m => !autosNoBanco.includes(m.numero_auto));
    
    // Removidas (Pagas): Estão no banco mas NÃO no Detran
    const autosParaRemover = autosNoBanco.filter(a => !autosNoDetran.includes(a));

    // 4. Executar inserções
    if (novasMultas.length > 0) {
      const payload = novasMultas.map(m => ({
        viatura_id: viaturaId,
        numero_auto: m.numero_auto,
        data_infracao: converterData(m.data_infracao),
        valor: parseMoeda(m.valor),
        local: m.local,
        orgao: m.orgao,
        status: "PENDENTE",
        observacao: `Sincronizado automaticamente via DETRAN em ${new Date().toLocaleDateString()}`
      }));
      await supabase.from("viaturas_multas").insert(payload);
    }

    // 5. Executar remoções (opcional: ou você pode mudar o status para 'PAGA')
    if (autosParaRemover.length > 0) {
      await supabase
        .from("viaturas_multas")
        .delete()
        .in("numero_auto", autosParaRemover);
    }

    // 6. Atualizar data da última consulta na viatura
    await supabase
      .from("viaturas")
      .update({ ultima_consulta_detran: new Date().toISOString() })
      .eq("id", viaturaId);

    return NextResponse.json({ 
      success: true, 
      resumo: { novas: novasMultas.length, removidas: autosParaRemover.length } 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha interna no servidor" }, { status: 500 });
  }
}

// Funções Auxiliares
function converterData(d) {
  if (!d) return null;
  const [dia, mes, ano] = d.split("/");
  return `${ano}-${mes}-${dia}`; // Formato ISO para o Postgres
}

function parseMoeda(v) {
  if (!v) return 0;
  return parseFloat(v.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
}
