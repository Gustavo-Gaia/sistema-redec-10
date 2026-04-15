/* app/(sistema)/equipe/componentes/CardMilitar.js */

'use client';
import { useState } from 'react';
import { calcularStatus } from './utils';

export default function CardMilitar({ militar, afastamentos, onClick }) {
  const status = calcularStatus(afastamentos);
  const [imgErro, setImgErro] = useState(false);

  // Gerar iniciais do nome de guerra (Ex: "ALEXANDRE" -> "AL", "DE PAULA" -> "DE")
  const getIniciais = (nome) => {
    if (!nome) return "??";
    const partes = nome.trim().split(" ");
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <div 
      onClick={() => onClick(militar)}
      title={`${militar.nome_guerra} - ${status.label}`}
      className={`relative cursor-pointer transition-all hover:scale-[1.02] border-2 rounded-[2rem] p-5 ${status.border} ${status.corFundo} shadow-sm hover:shadow-md group`}
    >
      <div className="flex gap-4 items-center">
        
        {/* ÁREA DA FOTO / AVATAR */}
        <div className={`relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 ${status.border} bg-white flex items-center justify-center shadow-inner`}>
          
          {militar.avatar_url && !imgErro ? (
            <img 
              /* Timestamp t=${Date.now()} força o navegador a ignorar o cache se a foto mudar */
              src={`${militar.avatar_url}?t=${new Date().getTime()}`} 
              alt={militar.nome_guerra} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgErro(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center bg-slate-100 w-full h-full">
              <span className="text-lg font-black text-slate-400 tracking-tighter">
                {getIniciais(militar.nome_guerra)}
              </span>
            </div>
          )}
          
          {/* Overlay suave para dar profundidade à imagem */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-60" />
          
          {/* Indicador de status sobreposto à foto com sombra para destaque */}
          <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${status.cor}`} />
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
            <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full ${status.cor} text-white shadow-sm`}>
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
