/* app/(sistema)/monitoramento/componentes/LegendaStatus.js */

export default function LegendaStatus() {
  const itens = [
    { cor: "bg-green-500", titulo: "Normal", desc: "< 85%" },
    { cor: "bg-yellow-500", titulo: "Alerta", desc: "85-99%" },
    { cor: "bg-red-500", titulo: "Transbordo", desc: "100-120%" },
    { cor: "bg-purple-600", titulo: "Extremo", desc: "> 120%" },
    { cor: "bg-gray-400", titulo: "S/ Cota", desc: "Sem Ref." },
    { cor: "bg-slate-500", titulo: "A/R", desc: "Ab. Régua" }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-300 rounded-2xl shadow-2xl p-3 md:px-5 md:py-3 antialiased">
      {/* Título com cor mais forte para dar nitidez */}
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 px-1">
        Legenda Hidrológica
      </h3>

      <div className="grid grid-cols-2 md:flex md:flex-row gap-x-6 gap-y-3 md:gap-8">
        {itens.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {/* Bolinha com sombra interna para não sumir no fundo */}
            <div className={`w-3.5 h-3.5 rounded-full ${item.cor} border border-white shadow-sm flex-shrink-0`} />
            
            <div className="flex flex-col leading-none">
              {/* Título em Slate-900 (quase preto) para máxima nitidez */}
              <span className="text-[12px] font-black text-slate-900 whitespace-nowrap tracking-tight">
                {item.titulo}
              </span>
              {/* Descrição em Slate-500 (cinza nítido) */}
              <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
