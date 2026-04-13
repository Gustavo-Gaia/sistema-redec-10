/* app/(sistema)/equipe/componentes/ListaAdministrativo.js */

'use client';
import CardMilitar from './CardMilitar';
import { UserCog } from "lucide-react";

export default function ListaAdministrativo({ militares, afastamentos, onSelect }) {
  
  const PESO_HIERARQUIA = {
    'Cel BM': 1,
    'Ten Cel BM': 2,
    'Maj BM': 3,
    'Cap BM': 4,
    '1º Ten BM': 5,
    '2º Ten BM': 6,
    'Subten BM': 7,
    '1º Sgt BM': 8,
    '2º Sgt BM': 9,
    '3º Sgt BM': 10,
    'Cb BM': 11,
    'Sd BM': 12
  };

  // Função auxiliar para converter RG string (ex: "31.243") em número (31243)
  const limparRG = (rg) => {
    if (!rg) return 9999999;
    return parseInt(rg.toString().replace(/\D/g, ""), 10);
  };

  const administrativo = militares
    .filter(m => {
      const funcao = m.funcao_redec?.toUpperCase();
      return funcao !== 'COORDENADOR' && funcao !== 'SUBCOORDENADOR';
    })
    .sort((a, b) => {
      const pesoA = PESO_HIERARQUIA[a.posto_graduacao] || 99;
      const pesoB = PESO_HIERARQUIA[b.posto_graduacao] || 99;

      // 1º Critério: Hierarquia (Posto/Graduação)
      if (pesoA !== pesoB) {
        return pesoA - pesoB;
      }

      // 2º Critério: Antiguidade pelo RG (Menor número = Mais antigo)
      const rgA = limparRG(a.rg);
      const rgB = limparRG(b.rg);
      
      return rgA - rgB;
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <UserCog className="w-4 h-4 text-slate-400" />
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">
          Efetivo de Suporte e Operações
        </span>
      </div>

      {administrativo.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {administrativo.map(militar => (
            <CardMilitar 
              key={militar.id}
              militar={militar}
              afastamentos={afastamentos.filter(a => a.equipe_id === militar.id)}
              onClick={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-100 p-3 rounded-full mb-3">
            <UserCog className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">Nenhum militar administrativo cadastrado.</p>
        </div>
      )}
    </div>
  );
}
