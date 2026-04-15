/* app/(sistema)/equipe/componentes/MuralExCoordenadores.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { History, Medal, Calendar, User, Award, Shield } from "lucide-react";

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

  // Função para formatar data sem erro de fuso horário
  const formatarDataLocal = (dataString) => {
    if (!dataString) return '---';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
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
      
      {/* CABEÇALHO COM ESTILO GOVERNO */}
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
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
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
              {/* Overlay Decorativo Glass */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]" />

              <div className="relative p-6 space-y-6">
                {/* Badge de Função */}
                <div className="flex justify-between items-start">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        item.funcao === 'COORDENADOR' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                        {item.funcao}
                    </div>
                    <Award className="w-5 h-5 text-slate-200 group-hover:text-amber-400 transition-colors" />
                </div>

                {/* Perfil */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden group-hover:scale-110 transition-transform duration-500">
                      {item.foto_url ? (
                        <img src={item.foto_url} alt={item.nome_guerra_historico} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-slate-300" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-50">
                        <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-80">
                      {item.posto_graduacao_historico}
                    </p>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter group-hover:text-blue-700 transition-colors">
                      {item.nome_guerra_historico}
                    </h3>
                  </div>
                </div>

                {/* Datas com Estilo Timeline */}
                <div className="bg-slate-50 rounded-2xl p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="text-center">
                      <p className="text-[8px] text-slate-400 uppercase font-black">Admissão</p>
                      <p className="text-xs font-bold text-slate-700 tracking-tight">
                        {formatarDataLocal(item.data_inicio)}
                      </p>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center px-2">
                        <div className="h-[1px] w-full bg-slate-200 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        </div>
                    </div>

                    <div className="text-center">
                      <p className="text-[8px] text-slate-400 uppercase font-black">Saída</p>
                      <p className="text-xs font-bold text-slate-700 tracking-tight">
                        {item.data_fim ? formatarDataLocal(item.data_fim) : 'ATUAL'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RODAPÉ DO MURAL */}
      <div className="pt-10 border-t border-slate-100 text-center">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Patrimônio Histórico e Memória Institucional
        </p>
      </div>
    </div>
  );
}
