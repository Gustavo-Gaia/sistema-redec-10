/* app/(sistema)/monitoramento/componentes/LegendaStatus.js */

export default function LegendaStatus() {
  const itens = [
    { cor: "bg-emerald-500", titulo: "Normal", desc: "< 85%" },
    { cor: "bg-yellow-400", titulo: "Alerta", desc: "85-99%" },
    { cor: "bg-red-500", titulo: "Transbordo", desc: "100-120%" },
    { cor: "bg-fuchsia-600", titulo: "Extremo", desc: "> 120%" },
    { cor: "bg-slate-400", titulo: "S/ Cota", desc: "Sem Ref." },
    { cor: "bg-slate-500", titulo: "A/R", desc: "Ab. Régua" }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-4 antialiased transition-all hover:shadow-xl">
      <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-1 opacity-70">
        Status Hidrológico
      </h3>

      <div className="grid grid-cols-2 md:flex md:flex-row gap-x-6 gap-y-3 md:gap-8">
        {itens.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 group cursor-default">
            {/* Indicador com pulso sutil no hover */}
            <div className="relative">
              <div className={`w-2.5 h-2.5 rounded-full ${item.cor} border border-white shadow-sm flex-shrink-0 transition-transform group-hover:scale-125`} />
            </div>
            
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap tracking-tight group-hover:text-slate-900 transition-colors">
                {item.titulo}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
