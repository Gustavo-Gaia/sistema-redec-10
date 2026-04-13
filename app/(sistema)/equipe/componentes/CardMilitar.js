/* app/(sistema)/equipe/componentes/CardMilitar.js */

'use client';
import { calcularStatus } from './utils';

export default function CardMilitar({ militar, afastamentos, onClick }) {
  const status = calcularStatus(afastamentos);

  return (
    <div 
      onClick={() => onClick(militar)}
      className={`relative cursor-pointer transition-all hover:scale-[1.02] border-2 rounded-xl p-4 ${status.border} ${status.corFundo}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {militar.posto_graduacao}
          </p>
          <h3 className="text-xl font-black text-gray-800 leading-tight">
            {militar.nome_guerra}
          </h3>
        </div>
        
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase text-white ${status.cor}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status.cor} animate-pulse`} />
        <span className={`text-xs font-medium ${status.texto}`}>
          {status.info}
        </span>
      </div>
    </div>
  );
}
