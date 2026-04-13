/* app/(sistema)/equipe/componentes/DrawerMilitar.js */

'use client';
import { useState } from 'react';
import { supabase } from "@/lib/supabase";
import { X, User, Plane, Save, Trash2, Calendar } from "lucide-react";
import ModalAfastamento from './ModalAfastamento';

export default function DrawerMilitar({ militar, afastamentos, onClose, onSaved }) {
  const [aba, setAba] = useState('dados'); // 'dados' ou 'afastamentos'
  const [loading, setLoading] = useState(false);
  const [formMilitar, setFormMilitar] = useState(militar || {
    nome_completo: '',
    nome_guerra: '',
    posto_graduacao: '',
    rg: '',
    telefone: '',
    ordem: 0
  });

  // Salvar alterações do militar
  async function salvarMilitar() {
    setLoading(true);
    const { error } = await supabase
      .from('equipe')
      .upsert({ ...formMilitar, id: militar?.id || undefined });

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      onSaved();
      if (!militar) onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Overlay Escuro */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Painel Lateral */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header do Drawer */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {militar ? 'Editar Militar' : 'Novo Militar'}
            </h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">
              Gerenciamento de Prontuário
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b px-6 bg-slate-50">
          <button 
            onClick={() => setAba('dados')}
            className={`flex items-center gap-2 py-4 px-4 text-sm font-bold transition-all border-b-2 ${aba === 'dados' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
          >
            <User className="w-4 h-4" /> Dados
          </button>
          {militar && (
            <button 
              onClick={() => setAba('afastamentos')}
              className={`flex items-center gap-2 py-4 px-4 text-sm font-bold transition-all border-b-2 ${aba === 'afastamentos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
            >
              <Plane className="w-4 h-4" /> Afastamentos
            </button>
          )}
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {aba === 'dados' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Nome Completo</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={formMilitar.nome_completo}
                    onChange={e => setFormMilitar({...formMilitar, nome_completo: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Nome de Guerra</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={formMilitar.nome_guerra}
                    onChange={e => setFormMilitar({...formMilitar, nome_guerra: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Posto/Graduação</label>
                  <select 
                    className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={formMilitar.posto_graduacao}
                    onChange={e => setFormMilitar({...formMilitar, posto_graduacao: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="Cap BM">Capitão BM</option>
                    <option value="Ten BM">Tenente BM</option>
                    <option value="Sgt BM">Sargento BM</option>
                    <option value="Cb BM">Cabo BM</option>
                    <option value="Sd BM">Soldado BM</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">RG Funcional</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    value={formMilitar.rg}
                    onChange={e => setFormMilitar({...formMilitar, rg: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Telefone</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    value={formMilitar.telefone}
                    onChange={e => setFormMilitar({...formMilitar, telefone: e.target.value})}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => window.openModalAfastamento()} // Chamada para o modal que faremos
                className="w-full p-4 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"
              >
                <Plus className="w-5 h-5" /> Registrar Afastamento
              </button>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase italic">Histórico Recente</h4>
                {afastamentos.map(afast => (
                  <div key={afast.id} className="p-4 bg-slate-50 rounded-xl border flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-700">{afast.tipo}</p>
                      <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {afast.data_inicio} até {afast.data_fim}
                      </p>
                    </div>
                    <button 
                      onClick={async () => {
                        if(confirm("Excluir registro?")) {
                          await supabase.from('equipe_afastamentos').delete().eq('id', afast.id);
                          onSaved();
                        }
                      }}
                      className="text-red-400 hover:text-red-600 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="p-6 border-t bg-slate-50">
          <button 
            disabled={loading}
            onClick={salvarMilitar}
            className="w-full bg-slate-900 hover:bg-blue-700 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'SALVANDO...' : 'CONFIRMAR ALTERAÇÕES'}
          </button>
        </div>
      </div>
    </div>
  );
}
