/* app/(sistema)/equipe/componentes/ModalAfastamento.js */

'use client';
import { useState } from 'react';
import { supabase } from "@/lib/supabase";
import { X, Calendar, AlertTriangle, Check } from "lucide-react";
import { calcularStatus } from './utils';

export default function ModalAfastamento({ militar, militares, afastamentos, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tipo: 'Férias',
    data_inicio: '',
    data_fim: '',
    observacao: ''
  });

  // Lógica de Alerta de Efetivo Crítico
  const verificarImpacto = () => {
    if (!form.data_inicio || !form.data_fim) return false;

    // Conta quantos estariam disponíveis durante este novo afastamento
    const disponiveisAposAfastamento = militares.filter(m => {
      // Se for o próprio militar que estamos editando, ele sairá da contagem de disponíveis
      if (m.id === militar.id) return false;

      const m_afastamentos = afastamentos.filter(a => a.equipe_id === m.id);
      return !calcularStatus(m_afastamentos).isAfastado;
    }).length;

    return disponiveisAposAfastamento <= 1;
  };

  const isCritico = verificarImpacto();

  async function salvarAfastamento() {
    if (!form.data_inicio || !form.data_fim) {
      alert("Preencha as datas corretamente.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('equipe_afastamentos')
      .insert({
        equipe_id: militar.id,
        tipo: form.tipo,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        observacao: form.observacao
      });

    if (error) {
      alert("Erro ao registrar: " + error.message);
    } else {
      onSaved();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight">Novo Afastamento</h3>
              <p className="text-[10px] font-bold text-amber-600 uppercase italic leading-none">
                Militar: {militar?.nome_guerra}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400">Tipo de Afastamento</label>
            <select 
              className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 font-bold"
              value={form.tipo}
              onChange={e => setForm({...form, tipo: e.target.value})}
            >
              <option value="Férias">Férias</option>
              <option value="Licença Especial">Licença Especial</option>
              <option value="LTS (Saúde)">LTS (Saúde)</option>
              <option value="Dispensa Recompensa">Dispensa Recompensa</option>
              <option value="Curso/Evento Externo">Curso/Evento Externo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Início</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 font-medium"
                value={form.data_inicio}
                onChange={e => setForm({...form, data_inicio: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Término (Inclusive)</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 font-medium"
                value={form.data_fim}
                onChange={e => setForm({...form, data_fim: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400">Observações Internas</label>
            <textarea 
              className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 text-sm h-24"
              placeholder="Ex: Boletim nº 123/2026..."
              value={form.observacao}
              onChange={e => setForm({...form, observacao: e.target.value})}
            />
          </div>

          {/* Alerta de Efetivo Crítico */}
          {isCritico && (
            <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex gap-3 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-red-600 uppercase">Aviso de Prontidão Crítica</p>
                <p className="text-[10px] text-red-500 font-medium">
                  Este afastamento deixará a unidade com efetivo insuficiente para operações. 
                  Verifique a escala antes de confirmar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 p-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all"
          >
            CANCELAR
          </button>
          <button 
            onClick={salvarAfastamento}
            disabled={loading}
            className={`flex-1 p-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
              isCritico ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-slate-900 hover:bg-blue-700 shadow-slate-200'
            }`}
          >
            {loading ? 'PROCESSANDO...' : (
              <>
                <Check className="w-5 h-5" /> CONFIRMAR
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
