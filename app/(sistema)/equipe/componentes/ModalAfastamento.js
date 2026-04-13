/* app/(sistema)/equipe/componentes/ModalAfastamento.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { X, Calendar, AlertTriangle, Check, Building2, MessageSquare } from "lucide-react";
import { calcularStatus } from './utils';
import { toast } from "react-hot-toast";

export default function ModalAfastamento({ militar, militares, afastamentos, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [qtdDias, setQtdDias] = useState('');
  
  const [form, setForm] = useState({
    tipo: 'Férias',
    data_inicio: '',
    data_fim: '',
    observacao: '',
    orgao_boletim: 'SEDEC',
    num_boletim: ''
  });

  // Cálculo automático da data fim baseado na quantidade de dias
  useEffect(() => {
    if (form.data_inicio && qtdDias) {
      const inicio = new Date(form.data_inicio + "T12:00:00");
      const dias = parseInt(qtdDias);
      if (!isNaN(dias) && dias > 0) {
        const fim = new Date(inicio);
        fim.setDate(inicio.getDate() + (dias - 1));
        setForm(prev => ({ ...prev, data_fim: fim.toISOString().split('T')[0] }));
      }
    }
  }, [form.data_inicio, qtdDias]);

  const isCritico = (() => {
    if (!form.data_inicio || !form.data_fim) return false;
    const disponiveis = militares.filter(m => {
      if (m.id === militar.id) return false;
      const m_afas = afastamentos.filter(a => a.equipe_id === m.id);
      return !calcularStatus(m_afas).isAfastado;
    }).length;
    return disponiveis <= 1;
  })();

  async function salvarAfastamento() {
    if (!form.data_inicio || !form.data_fim || !form.num_boletim) {
      toast.error("Preencha as datas e o número do boletim.");
      return;
    }

    setLoading(true);
    try {
      const anoAtual = new Date().getFullYear();
      const numFormatado = form.num_boletim.toString().padStart(3, '0');
      const refBoletim = `Bol-${numFormatado}/${anoAtual} (${form.orgao_boletim})`;
      
      // TÍTULO: Motivo + Posto + Nome de Guerra
      const tituloDinamico = `${form.tipo}: ${militar.posto_graduacao} ${militar.nome_guerra}`;

      // 1. CRIAR NA AGENDA (Horário fixo às 08:00h)
      const { data: evento, error: errAgenda } = await supabase
        .from('agenda_eventos')
        .insert({
          titulo: tituloDinamico,
          descricao: form.observacao || `Afastamento registrado via sistema. Ref: ${refBoletim}`,
          data_inicio: `${form.data_inicio} 08:00:00`,
          data_fim: `${form.data_fim} 19:00:00`,
          cor: '#f59e0b',
          tipo: 'Administrativo'
        })
        .select('id')
        .single();

      if (errAgenda) throw errAgenda;

      // 2. CRIAR NOTA NO BOLETIM
      const textoNota = `${militar.posto_graduacao} ${militar.nome_completo} (${militar.nome_guerra}) - Afastado por motivo de ${form.tipo}, durante ${qtdDias} dia(s), no período de ${new Date(form.data_inicio + "T12:00:00").toLocaleDateString('pt-BR')} a ${new Date(form.data_fim + "T12:00:00").toLocaleDateString('pt-BR')}.`;

      const { data: documento, error: errDoc } = await supabase
        .from('documentos_administrativos')
        .insert({
          categoria: 'boletins',
          tipo_orgao: form.orgao_boletim,
          numero: `Bol-${numFormatado}`,
          data_registro: form.data_inicio,
          assunto: textoNota,
          agenda_evento_id: evento.id
        })
        .select('id')
        .single();

      if (errDoc) throw errDoc;

      // 3. REGISTRAR O AFASTAMENTO COM OS VÍNCULOS
      const { error: errAfast } = await supabase
        .from('equipe_afastamentos')
        .insert({
          equipe_id: militar.id,
          tipo: form.tipo,
          data_inicio: form.data_inicio,
          data_fim: form.data_fim,
          agenda_evento_id: evento.id,
          documento_id: documento.id,
          observacao: form.observacao
        });

      if (errAfast) throw errAfast;

      toast.success("Afastamento e Agenda integrados!");
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro na integração: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 tracking-tight text-lg uppercase leading-none">Novo Afastamento</h3>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2 italic">
              {militar?.posto_graduacao} {militar?.nome_guerra}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Motivo</label>
            <select 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Início</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.data_inicio}
                onChange={e => setForm({...form, data_inicio: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Qtd Dias</label>
              <input 
                type="number" 
                placeholder="0"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                value={qtdDias}
                onChange={e => setQtdDias(e.target.value)}
              />
            </div>
          </div>

          <div className="p-5 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-amber-500" size={20} />
              <span className="text-[10px] font-black text-amber-600 uppercase">Término Previsto</span>
            </div>
            <span className="font-black text-amber-700">
              {form.data_fim ? new Date(form.data_fim + "T12:00:00").toLocaleDateString('pt-BR') : '---'}
            </span>
          </div>

          {/* Campo Observação / Descrição da Agenda */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
              <MessageSquare size={14} /> Observação (Agenda)
            </label>
            <textarea 
              rows={3}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder="Ex: Tel para contato, local do curso ou detalhes da nota."
              value={form.observacao}
              onChange={e => setForm({...form, observacao: e.target.value})}
            />
          </div>

          {/* Dados do Boletim */}
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
              <Building2 size={14} /> Publicação de Referência
            </p>
            <div className="grid grid-cols-2 gap-3">
              <select 
                className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none"
                value={form.orgao_boletim}
                onChange={e => setForm({...form, orgao_boletim: e.target.value})}
              >
                <option value="SEDEC">SEDEC</option>
                <option value="DGDEC">DGDEC</option>
              </select>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-bold text-slate-400 text-[10px]">Bol-</span>
                <input 
                  type="number" placeholder="000"
                  className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.num_boletim}
                  onChange={e => setForm({...form, num_boletim: e.target.value})}
                />
              </div>
            </div>
          </div>

          {isCritico && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-[10px] text-red-600 font-bold uppercase leading-tight">
                Atenção: Efetivo crítico detectado para este período.
              </p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t flex gap-4">
          <button onClick={onClose} className="flex-1 p-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all text-xs">
            CANCELAR
          </button>
          <button 
            onClick={salvarAfastamento}
            disabled={loading}
            className={`flex-1 p-4 rounded-2xl font-black text-white text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
              isCritico ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-blue-700'
            }`}
          >
            {loading ? 'PROCESSANDO...' : <><Check size={18} /> CONFIRMAR</>}
          </button>
        </div>
      </div>
    </div>
  );
}
