/* app/(sistema)/equipe/componentes/CardMilitar.js */

'use client';
import { User } from 'lucide-react'; // Importado para o fallback
import { calcularStatus } from './utils';

export default function CardMilitar({ militar, afastamentos, onClick }) {
  const status = calcularStatus(afastamentos);

  return (
    <div 
      onClick={() => onClick(militar)}
      className={`relative cursor-pointer transition-all hover:scale-[1.02] border-2 rounded-[2rem] p-5 ${status.border} ${status.corFundo} shadow-sm hover:shadow-md`}
    >
      <div className="flex gap-4 items-center">
        
        {/* ÁREA DA FOTO / AVATAR */}
        <div className={`relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 ${status.border} bg-white flex items-center justify-center shadow-inner`}>
          {militar.avatar_url ? (
            <img 
              src={militar.avatar_url} 
              alt={militar.nome_guerra} 
              className="w-full h-full object-cover"
              // Adicionamos um timestamp simples para evitar cache antigo quando a foto for trocada
              onError={(e) => { e.target.src = ""; }} // Evita loop de erro
            />
          ) : (
            <User className="text-slate-300" size={32} />
          )}
          
          {/* Indicador de status sobreposto à foto */}
          <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${status.cor}`} />
        </div>

        {/* INFORMAÇÕES */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="truncate">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
                {militar.posto_graduacao}
              </p>
              <h3 className="text-lg font-black text-slate-800 leading-tight uppercase truncate">
                {militar.nome_guerra}
              </h3>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full ${status.cor} text-white`}>
              {status.label}
            </span>
            <span className={`text-[10px] font-bold truncate ${status.texto}`}>
              {status.info}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
