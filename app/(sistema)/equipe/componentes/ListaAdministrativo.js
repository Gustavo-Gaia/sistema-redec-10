/* app/(sistema)/equipe/componentes/ListaAdministrativo.js */

'use client';
import CardMilitar from './CardMilitar';
import { UserCog } from "lucide-react";

export default function ListaAdministrativo({ militares, config, afastamentos, onSelect }) {
  
  // Filtra a lista para excluir quem já está no Bloco de Comando
  const administrativo = militares.filter(m => 
    m.id !== config?.coordenador_id && 
    m.id !== config?.subcoordenador_id
  );

  return (
    <div className="space-y-4">
      {/* Cabeçalho Interno da Seção */}
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
          <p className="text-slate-400 text-xs">Use o botão "+" para adicionar membros à equipe.</p>
        </div>
      )}
    </div>
  );
}
