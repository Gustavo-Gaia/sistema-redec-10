/* app/(sistema)/equipe/componentes/MuralExCoordenadores.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { History, Medal, Calendar, User, Shield } from "lucide-react";

export default function MuralExCoordenadores() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  async function carregarMural() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipe_mural_historico')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      console.error("Erro mural:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarMural();
  }, []);

  // Função para formatar data por extenso
  const formatarDataExtenso = (dataString) => {
    if (!dataString) return 'Atualmente';
    const data = new Date(dataString + "T12:00:00");
    return data.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <History className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Consultando Arquivos Históricos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* CABEÇALHO */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative p-4 bg-gradient-to-b from-amber-50 to-white rounded-3xl border border-amber-100 shadow-sm">
                <Medal className="w-8 h-8 text-amber-500" />
            </div>
        </div>
        <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Galeria de Ex-Coordenadores</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
                <span className="h-[2px] w-8 bg-blue-600"></span>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-blue-600">
                    REDEC 10 - Norte
                </p>
                <span className="h-[2px] w-8 bg-blue-600"></span>
            </div>
        </div>
      </div>

      {historico.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-20 text-center">
          <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase text-xs">Nenhum registro histórico na unidade.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {historico.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white rounded-[32px] p-1 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="relative p-8 space-y-6">
                
                {/* Perfil Centralizado */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    {/* Moldura da Foto com gradiente sutil */}
                    <div className="w-28 h-28 rounded-[2.5rem] bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      {item.foto_historica_url ? (
                        <img src={item.foto_historica_url} alt={item.nome_guerra_historico} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                    {/* Selo de Honra */}
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 p-2 rounded-2xl shadow-lg border-2 border-white">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                      {item.posto_graduacao_historico}
                    </p>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-tight">
                      {item.nome_guerra_historico}
                    </h3>
                  </div>
                </div>

                {/* Período Formatado */}
                <div className="pt-4 border-t border-slate-50">
                    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Período de Gestão</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-600 text-center leading-relaxed">
                            {formatarDataExtenso(item.data_inicio)} <br/>
                            <span className="text-[9px] text-slate-400 font-normal lowercase">a</span> <br/>
                            {formatarDataExtenso(item.data_fim)}
                        </p>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RODAPÉ */}
      <div className="pt-10 border-t border-slate-100 text-center">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          Eternizando o comando e a dedicação à Defesa Civil
        </p>
      </div>
    </div>
  );
}
