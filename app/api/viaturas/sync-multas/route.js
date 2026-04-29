/* app/api/viaturas/sync-multas/route.js */

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { multas, renavam } = await req.json();

  const { data: viatura } = await supabase
    .from("viaturas")
    .select("id")
    .eq("renavam", renavam)
    .single();

  if (!viatura) {
    return NextResponse.json({ error: "Viatura não encontrada" });
  }

  const viaturaId = viatura.id;

  const { data: banco } = await supabase
    .from("viaturas_multas")
    .select("numero_auto")
    .eq("viatura_id", viaturaId);

  const autosBanco = banco.map(m => m.numero_auto);
  const autosDetran = multas.map(m => m.numero_auto);

  const novas = multas.filter(m => !autosBanco.includes(m.numero_auto));
  const removidas = autosBanco.filter(a => !autosDetran.includes(a));

  if (novas.length) {
    await supabase.from("viaturas_multas").insert(
      novas.map(m => ({
        viatura_id: viaturaId,
        numero_auto: m.numero_auto,
        data_infracao: formatar(m.data_infracao),
        valor: parseValor(m.valor),
        local: m.local,
        orgao: m.orgao
      }))
    );
  }

  if (removidas.length) {
    await supabase
      .from("viaturas_multas")
      .delete()
      .in("numero_auto", removidas);
  }

  return NextResponse.json({
    novas: novas.length,
    removidas: removidas.length
  });
}

function formatar(d) {
  if (!d) return null;
  const [dia, mes, ano] = d.split("/");
  return `${ano}-${mes}-${dia}`;
}

function parseValor(v) {
  return parseFloat(v?.replace(/\./g, "").replace(",", "."));
}
