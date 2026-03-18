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
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-xl p-3 md:px-6 md:py-3.5 antialiased">
      {/* Título mais suave e refinado */}
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1 leading-none">
        Legenda Hidrológica
      </h3>

      <div className="grid grid-cols-2 md:flex md:flex-row gap-x-8 gap-y-4 md:gap-10">
        {itens.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Indicador de Cor Menor e mais sutil */}
            <div className={`w-3 h-3 rounded-full ${item.cor} border-2 border-white shadow-sm flex-shrink-0`} />
            
            <div className="flex flex-col leading-none gap-0.5">
              {/* Título mais fino (font-bold) e cor suave (slate-700) */}
              <span className="text-[12px] font-bold text-slate-700 whitespace-nowrap tracking-tight">
                {item.titulo}
              </span>
              {/* Descrição em Slate-400 (cinza elegante e legível) */}
              <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
