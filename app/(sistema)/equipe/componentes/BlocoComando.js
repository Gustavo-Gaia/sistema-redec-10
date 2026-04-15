/* app/(sistema)/equipe/componentes/BlocoComando.js */

'use client';
import CardMilitar from './CardMilitar';
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function BlocoComando({ militares, afastamentos, onSelect }) {
  
  // Agora buscamos diretamente pela função cadastrada no militar
  // Usamos toUpperCase() para garantir que ache mesmo se no banco estiver 'Coordenador'
  const coordenador = militares.find(m => 
    m.funcao_redec?.toUpperCase() === 'COORDENADOR'
  );

  const subcoordenador = militares.find(m => 
    m.funcao_redec?.toUpperCase() === 'SUBCOORDENADOR'
  );

  return (
    <div className="space-y-4">
      {/* COORDENADOR */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Coordenador</span>
        </div>
        {coordenador ? (
          <CardMilitar 
            militar={coordenador} 
            afastamentos={afastamentos.filter(a => a.equipe_id === coordenador.id)}
            onClick={onSelect}
          />
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex items-center justify-center text-slate-400 text-sm italic">
            Coordenador não definido
          </div>
        )}
      </div>

      {/* SUBCOORDENADOR */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Subcoordenador</span>
        </div>
        {subcoordenador ? (
          <CardMilitar 
            militar={subcoordenador} 
            afastamentos={afastamentos.filter(a => a.equipe_id === subcoordenador.id)}
            onClick={onSelect}
          />
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex items-center justify-center text-slate-400 text-sm italic">
            Subcoordenador não definido
          </div>
        )}
      </div>
    </div>
  );
}
