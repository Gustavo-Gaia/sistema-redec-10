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
    <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg p-3 w-fit antialiased">
      <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 opacity-80">
        Status
      </h3>

      {/* Grid de 2 colunas para reduzir a largura total */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {itens.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${item.cor} shadow-sm flex-shrink-0`} />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">
                {item.titulo}
              </span>
              <span className="text-[7px] font-bold text-slate-400 uppercase">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
