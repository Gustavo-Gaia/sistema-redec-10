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
    <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-3 md:px-5 md:py-3">
      {/* Título menor e mais discreto */}
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
        Legenda Hidrológica
      </h3>

      {/* No Mobile: 2 colunas (grid-cols-2)
          No Desktop: Linha única (md:flex-row) 
      */}
      <div className="grid grid-cols-2 md:flex md:flex-row gap-x-4 gap-y-2 md:gap-8">
        {itens.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Indicador de Cor */}
            <div className={`w-3 h-3 rounded-full ${item.cor} border border-white shadow-sm flex-shrink-0`} />
            
            {/* Textos empilhados para ocupar menos largura individual */}
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-bold text-slate-800 whitespace-nowrap">
                {item.titulo}
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
