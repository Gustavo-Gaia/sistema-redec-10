/* app/(sistema)/equipe/componentes/ModalAfastamento.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { X, Calendar, AlertTriangle, Check, Building2, MessageSquare, Trash2 } from "lucide-react";
import { calcularStatus } from './utils';
import { toast } from "react-hot-toast";

export default function ModalAfastamento({ militar, militares, afastamentos = [], onClose, onSaved, afastamentoParaEditar = null }) {
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

  // Carrega dados se for Edição ou limpa se for Novo
  useEffect(() => {
    if (afastamentoParaEditar) {
      // Tenta extrair o número do boletim da observação se não houver campo específico
      const numMatch = afastamentoParaEditar.observacao?.match(/Bol-(\d+)/);
      
      setForm({
        tipo: afastamentoParaEditar.tipo || 'Férias',
        data_inicio: afastamentoParaEditar.data_inicio || '',
        data_fim: afastamentoParaEditar.data_fim || '',
        observacao: afastamentoParaEditar.observacao || '',
        orgao_boletim: 'SEDEC', 
        num_boletim: numMatch ? parseInt(numMatch[1]) : ''
      });

      if (afastamentoParaEditar.data_inicio && afastamentoParaEditar.data_fim) {
        const d1 = new Date(afastamentoParaEditar.data_inicio + "T12:00:00");
        const d2 = new Date(afastamentoParaEditar.data_fim + "T12:00:00");
        const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
        setQtdDias(diff.toString());
      }
    } else {
      // Reset para novo cadastro
      setForm({
        tipo: 'Férias',
        data_inicio: '',
        data_fim: '',
        observacao: '',
        orgao_boletim: 'SEDEC',
        num_boletim: ''
      });
      setQtdDias('');
    }
  }, [afastamentoParaEditar]);

  // Cálculo automático da data fim
  useEffect(() => {
    if (form.data_inicio && qtdDias && !loading) {
      const inicio = new Date(form.data_inicio + "T12:00:00");
      const dias = parseInt(qtdDias);
      if (!isNaN(dias) && dias > 0) {
        const fim = new Date(inicio);
        fim.setDate(inicio.getDate() + (dias - 1));
        setForm(prev => ({ ...prev, data_fim: fim.toISOString().split('T')[0] }));
      }
    }
  }, [form.data_inicio, qtdDias, loading]);

  const isCritico = (() => {
    if (!form.data_inicio || !form.data_fim || !militares) return false;
    const disponiveis = militares.filter(m => {
      if (m.id === militar.id) return false;
      const m_afas = (afastamentos || []).filter(a => a.equipe_id === m.id);
      return !calcularStatus(m_afas).isAfastado;
    }).length;
    return disponiveis <= 1;
  })();

  async function salvarAfastamento() {
    if (!form.data_inicio || !form.data_fim || !form.num_boletim) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const anoAtual = new Date().getFullYear();
      const numFormatado = form.num_boletim.toString().padStart(3, '0');
      const refBoletim = `Bol-${numFormatado}/${anoAtual} (${form.orgao_boletim})`;
      const tituloDinamico = `${form.tipo}: ${militar.posto_graduacao} ${militar.nome_guerra}`;

      if (afastamentoParaEditar) {
        // --- MODO EDIÇÃO ---
        
        // 1. Atualiza Agenda
        if (afastamentoParaEditar.agenda_evento_id) {
          await supabase.from('agenda_eventos').update({
            titulo: tituloDinamico,
            descricao: form.observacao || `Ref: ${refBoletim}`,
            data_inicio: `${form.data_inicio} 08:00:00`,
            data_fim: `${form.data_fim} 19:00:00`
          }).eq('id', afastamentoParaEditar.agenda_evento_id);
        }

        // 2. Atualiza Boletim
        if (afastamentoParaEditar.documento_id) {
          await supabase.from('documentos_administrativos').update({
            numero: `Bol-${numFormatado}`,
            data_registro: form.data_inicio,
            assunto: `${militar.nome_guerra} - ${form.tipo} (${qtdDias} dias)`
          }).eq('id', afastamentoParaEditar.documento_id);
        }

        // 3. Atualiza Afastamento
        const { error } = await supabase.from('equipe_afastamentos').update({
          tipo: form.tipo,
          data_inicio: form.data_inicio,
          data_fim: form.data_fim,
          observacao: form.observacao
        }).eq('id', afastamentoParaEditar.id);

        if (error) throw error;
        toast.success("Afastamento atualizado!");

      } else {
        // --- MODO NOVO CADASTRO ---
        const { data: evento, error: errAgenda } = await supabase
          .from('agenda_eventos')
          .insert({
            titulo: tituloDinamico,
            descricao: form.observacao || `Ref: ${refBoletim}`,
            data_inicio: `${form.data_inicio} 08:00:00`,
            data_fim: `${form.data_fim} 19:00:00`,
            cor: '#f59e0b',
            tipo: 'Administrativo'
          }).select('id').single();
        if (errAgenda) throw errAgenda;

        const { data: doc, error: errDoc } = await supabase
          .from('documentos_administrativos')
          .insert({
            categoria: 'boletins',
            tipo_orgao: form.orgao_boletim,
            numero: `Bol-${numFormatado}`,
            data_registro: form.data_inicio,
            assunto: `${militar.nome_guerra} - ${form.tipo} (${qtdDias} dias)`,
            agenda_evento_id: evento.id
          }).select('id').single();
        if (errDoc) throw errDoc;

        const { error: errAfast } = await supabase.from('equipe_afastamentos').insert({
          equipe_id: militar.id,
          tipo: form.tipo,
          data_inicio: form.data_inicio,
          data_fim: form.data_fim,
          agenda_evento_id: evento.id,
          documento_id: doc.id,
          observacao: form.observacao
        });
        if (errAfast) throw errAfast;

        toast.success("Cadastrado com sucesso!");
      }

      onSaved();
      onClose();
    } catch (error) {
      toast.error("Erro ao processar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function excluirAfastamento() {
    if (!confirm("Deseja realmente excluir? Isso removerá também a agenda e o boletim.")) return;
    setLoading(true);
    try {
      if (afastamentoParaEditar.agenda_evento_id) {
        await supabase.from('agenda_eventos').delete().eq('id', afastamentoParaEditar.agenda_evento_id);
      }
      if (afastamentoParaEditar.documento_id) {
        await supabase.from('documentos_administrativos').delete().eq('id', afastamentoParaEditar.documento_id);
      }
      await supabase.from('equipe_afastamentos').delete().eq('id', afastamentoParaEditar.id);
      
      toast.success("Removido com sucesso!");
      onSaved();
      onClose();
    } catch (e) { 
      toast.error("Erro ao excluir."); 
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 tracking-tight text-lg uppercase leading-none">
              {afastamentoParaEditar ? 'Editar Afastamento' : 'Novo Afastamento'}
            </h3>
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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-sm"
                value={form.data_inicio}
                onChange={e => setForm({...form, data_inicio: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Qtd Dias</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none"
                value={qtdDias}
                onChange={e => setQtdDias(e.target.value)}
              />
            </div>
          </div>

          <div className="p-5 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-3 font-black text-amber-600 text-[10px] uppercase">
              <Calendar size={20} /> Término Previsto
            </div>
            <span className="font-black text-amber-700">
              {form.data_fim ? new Date(form.data_fim + "T12:00:00").toLocaleDateString('pt-BR') : '---'}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
              <MessageSquare size={14} /> Observação (Agenda)
            </label>
            <textarea 
              rows={3}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none resize-none text-sm"
              value={form.observacao}
              onChange={e => setForm({...form, observacao: e.target.value})}
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
              <Building2 size={14} /> Publicação de Referência
            </p>
            <div className="grid grid-cols-2 gap-3">
              <select 
                className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                value={form.orgao_boletim}
                onChange={e => setForm({...form, orgao_boletim: e.target.value})}
              >
                <option value="SEDEC">SEDEC</option>
                <option value="DGDEC">DGDEC</option>
              </select>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-bold text-slate-400 text-[10px]">Bol-</span>
                <input 
                  type="number" className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none"
                  value={form.num_boletim}
                  onChange={e => setForm({...form, num_boletim: e.target.value})}
                />
              </div>
            </div>
          </div>

          {isCritico && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-[10px] text-red-600 font-bold uppercase leading-tight">Efetivo crítico no período.</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t flex gap-4">
          {afastamentoParaEditar && (
            <button onClick={excluirAfastamento} className="p-4 rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 transition-all">
              <Trash2 size={20} />
            </button>
          )}
          <button onClick={onClose} className="flex-1 p-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all text-xs">
            FECHAR
          </button>
          <button 
            onClick={salvarAfastamento}
            disabled={loading}
            className="flex-2 p-4 rounded-2xl font-black text-white text-xs bg-slate-900 hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '...' : (afastamentoParaEditar ? 'ATUALIZAR' : 'CONFIRMAR')}
          </button>
        </div>
      </div>
    </div>
  );
}
