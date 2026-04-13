/* app/(sistema)/equipe/componentes/MuralExCoordenadores.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { History, Medal, Calendar, User, Search } from "lucide-react";

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

  if (loading) {
    return (
      <div className="p-20 text-center animate-pulse">
        <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Carregando Galeria de Honra...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* CABEÇALHO DO MURAL */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex p-3 bg-amber-50 rounded-2xl border border-amber-100 mb-2">
          <Medal className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 uppercase">Galeria de Ex-Coordenadores</h2>
        <p className="text-slate-500 text-sm font-medium">
          Registro histórico das lideranças que comandaram a REDEC 10 - Norte.
        </p>
      </div>

      {historico.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Nenhum registro histórico encontrado.</p>
          <p className="text-[10px] text-slate-300 uppercase mt-2">Os dados aparecem aqui quando uma função de comando é encerrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historico.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden"
            >
              {/* Selo de Função */}
              <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                {item.funcao}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-white shadow-inner">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
                    {item.posto_graduacao_historico}
                  </p>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                    {item.nome_guerra_historico}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Período de Comando:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-black">Início</p>
                    <p className="text-sm font-bold text-slate-700">
                      {item.data_inicio ? new Date(item.data_inicio).toLocaleDateString('pt-BR') : '---'}
                    </p>
                  </div>
                  <div className="w-4 h-[2px] bg-slate-200" />
                  <div className="flex-1 p-2 bg-slate-50 rounded-lg text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-black">Fim</p>
                    <p className="text-sm font-bold text-slate-700">
                      {item.data_fim ? new Date(item.data_fim).toLocaleDateString('pt-BR') : 'Até o momento'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalhe estético */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/5 rounded-full group-hover:bg-blue-500/10 transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
