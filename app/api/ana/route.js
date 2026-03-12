/* app/api/ana/route.js */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =========================
// CAPTURAR ANA
// =========================

async function capturarANA(codigo) {

 const url = `https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=${codigo}`;

 try {

   const resp = await fetch(url);

   const xml = await resp.text();

   const dados = JSON.parse(xml);

   if (!dados || dados.length === 0) return null;

   // pega o registro mais recente
   const ultimo = dados[dados.length - 1];

   if (!ultimo.DataHora) return null;

   const dataHora = new Date(ultimo.DataHora);

   const data = dataHora.toISOString().split("T")[0];

   const hora = dataHora.toTimeString().slice(0,5);

   const nivel = parseFloat(
     (ultimo.Nivel || "0").replace(",", ".")
   );

   return {
     data,
     hora,
     nivel
   };

 } catch (err) {

   console.error("Erro ANA", codigo, err);
   return null;

 }

}

// =========================
// API
// =========================

export async function GET() {

 const { data: estacoes } = await supabase
   .from("estacoes")
   .select("id, codigo_estacao")
   .eq("fonte", "ANA")
   .eq("ativo", true);

 if (!estacoes) return NextResponse.json([]);

 const resultados = [];

 for (const estacao of estacoes) {

   const dados = await capturarANA(estacao.codigo_estacao);

   if (dados) {

     resultados.push({
       estacao_id: estacao.id,
       data: dados.data,
       hora: dados.hora,
       nivel: dados.nivel
     });

   }

 }

 return NextResponse.json(resultados);

}
