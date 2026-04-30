/* app/api/viaturas/sync-multas/route.js */

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Cabeçalhos padrão de CORS para reutilização
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Em produção, você pode trocar pelo domínio da Vercel
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 1. Função OPTIONS necessária para o "pre-flight" do navegador
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { multas, renavam } = await req.json();

    // 2. Localizar a viatura pelo Renavam
    const { data: viatura, error: vError } = await supabase
      .from("viaturas")
      .select("id")
      .eq("renavam", renavam?.trim())
      .single();

    if (!viatura || vError) {
      return NextResponse.json(
        { error: "Viatura não cadastrada com este Renavam" }, 
        { status: 404, headers: corsHeaders }
      );
    }

    const viaturaId = viatura.id;

    // 3. Buscar autos que já temos no banco para esta viatura
    const { data: banco } = await supabase
      .from("viaturas_multas")
      .select("numero_auto")
      .eq("viatura_id", viaturaId);

    const autosNoBanco = banco?.map(m => m.numero_auto) || [];
    const autosNoDetran = multas.map(m => m.numero_auto);

    // 4. Lógica de Sincronização
    const novasMultas = multas.filter(m => !autosNoBanco.includes(m.numero_auto));
    const autosParaRemover = autosNoBanco.filter(a => !autosNoDetran.includes(a));

    // 5. Inserir novas multas
    if (novasMultas.length > 0) {
      const payload = novasMultas.map(m => ({
        viatura_id: viaturaId,
        numero_auto: m.numero_auto,
        data_infracao: converterData(m.data_infracao),
        valor: parseMoeda(m.valor),
        local: m.local,
        orgao: m.orgao,
        status: "PENDENTE",
        observacao: `Sincronizado via DETRAN em ${new Date().toLocaleDateString()}`
      }));
      await supabase.from("viaturas_multas").insert(payload);
    }

    // 6. Remover multas que não constam mais no sistema (pagas)
    if (autosParaRemover.length > 0) {
      await supabase
        .from("viaturas_multas")
        .delete()
        .in("numero_auto", autosParaRemover);
    }

    // 7. Atualizar carimbo de última consulta
    await supabase
      .from("viaturas")
      .update({ ultima_consulta_detran: new Date().toISOString() })
      .eq("id", viaturaId);

    return NextResponse.json({ 
      success: true, 
      resumo: { novas: novasMultas.length, removidas: autosParaRemover.length } 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Erro na API de Sync:", error);
    return NextResponse.json(
      { error: "Falha interna no servidor" }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

// --- Funções Auxiliares ---

function converterData(d) {
  if (!d) return null;
  // Converte DD/MM/YYYY para YYYY-MM-DD
  const partes = d.split("/");
  if (partes.length !== 3) return null;
  const [dia, mes, ano] = partes;
  return `${ano}-${mes}-${dia}`;
}

function parseMoeda(v) {
  if (!v) return 0;
  // Remove R$, pontos de milhar e troca vírgula por ponto
  return parseFloat(v.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
}
