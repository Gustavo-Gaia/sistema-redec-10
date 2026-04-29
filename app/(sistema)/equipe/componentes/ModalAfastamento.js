/* app/(sistema)/equipe/componentes/ModalAfastamento.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { X, AlertTriangle, Trash2, Loader2, FileText } from "lucide-react";
import { calcularStatus } from './utils';
import { toast } from "react-hot-toast";

export default function ModalAfastamento({
  militar,
  militares,
  afastamentos = [],
  onClose,
  onSaved,
  afastamentoParaEditar = null
}) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [qtdDias, setQtdDias] = useState('');

  const [form, setForm] = useState({
    tipo: 'Férias',
    data_inicio: '',
    data_fim: '',
    observacao: '',
    orgao_boletim: 'SEDEC',
    num_boletim: '',
    data_boletim: ''
  });

  // ==========================================
  // 🔄 CARREGAR DADOS (EDIÇÃO)
  // ==========================================
  useEffect(() => {
    async function carregar() {
      if (!afastamentoParaEditar) {
        setForm({
          tipo: 'Férias',
          data_inicio: '',
          data_fim: '',
          observacao: '',
          orgao_boletim: 'SEDEC',
          num_boletim: '',
          data_boletim: ''
        });
        setQtdDias('');
        return;
      }

      setFetching(true);
      try {
        let numero = '';
        let orgao = 'SEDEC';
        let dataBol = '';

        if (afastamentoParaEditar.documento_id) {
          const { data: doc } = await supabase
            .from('documentos_administrativos')
            .select('*')
            .eq('id', afastamentoParaEditar.documento_id)
            .single();

          if (doc) {
            numero = doc.numero?.replace('Bol-', '').split('/')[0] || '';
            orgao = doc.tipo_orgao || 'SEDEC';
            dataBol = doc.data_registro || '';
          }
        }

        setForm({
          tipo: afastamentoParaEditar.tipo || 'Férias',
          data_inicio: afastamentoParaEditar.data_inicio || '',
          data_fim: afastamentoParaEditar.data_fim || '',
          observacao: afastamentoParaEditar.observacao || '',
          orgao_boletim: orgao,
          num_boletim: numero,
          data_boletim: dataBol || afastamentoParaEditar.data_inicio
        });

        if (afastamentoParaEditar.data_inicio && afastamentoParaEditar.data_fim) {
          const d1 = new Date(afastamentoParaEditar.data_inicio + "T12:00:00");
          const d2 = new Date(afastamentoParaEditar.data_fim + "T12:00:00");
          const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
          setQtdDias(diff > 0 ? diff.toString() : '');
        }
      } catch {
        toast.error("Erro ao carregar dados.");
      } finally {
        setFetching(false);
      }
    }
    carregar();
  }, [afastamentoParaEditar]);

  // ==========================================
  // 📅 CALCULAR DATA FIM
  // ==========================================
  useEffect(() => {
    if (!form.data_inicio || !qtdDias || loading) return;
    const inicio = new Date(form.data_inicio + "T12:00:00");
    const dias = parseInt(qtdDias);
    if (isNaN(dias) || dias <= 0) return;

    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + (dias - 1));
    const dataFimStr = fim.toISOString().split('T')[0];

    if (form.data_fim !== dataFimStr) {
      setForm(prev => ({ ...prev, data_fim: dataFimStr }));
    }
  }, [form.data_inicio, qtdDias]);

  // ==========================================
  // ⚠️ EFETIVO CRÍTICO
  // ==========================================
  const isCritico = (() => {
    if (!form.data_inicio || !form.data_fim || !militares) return false;
    const disponiveis = militares.filter(m => {
      if (m.id === militar.id) return false;
      const m_afas = afastamentos.filter(a => a.equipe_id === m.id);
      return !calcularStatus(m_afas).isAfastado;
    }).length;
    return disponiveis <= 1;
  })();

  // ==========================================
  // 💾 SALVAR (RPC)
  // ==========================================
  async function salvarAfastamento() {
    if (!militar?.id) return toast.error("Militar inválido.");
    if (!form.data_inicio || !form.data_fim || !form.num_boletim || !form.data_boletim) {
      return toast.error("Preencha os campos obrigatórios.");
    }

    setLoading(true);
    try {
      const numFormatado = form.num_boletim.toString().padStart(3, '0');
      const refBoletim = `Bol-${numFormatado}`;

      const { data, error } = await supabase.rpc('salvar_afastamento_completo', {
        p_afastamento_id: afastamentoParaEditar?.id || null,
        p_militar_id: militar.id,
        p_militar_nome: militar.nome_guerra,
        p_militar_posto: militar.posto_graduacao,
        p_tipo: form.tipo,
        p_data_inicio: form.data_inicio || null,
        p_data_fim: form.data_fim || null,
        p_observacao: form.observacao,
        p_orgao: form.orgao_boletim,
        p_numero: refBoletim,
        p_data_boletim: form.data_boletim,
        p_agenda_id: afastamentoParaEditar?.agenda_evento_id || null,
        p_retorno_id: afastamentoParaEditar?.agenda_retorno_id || null,
        p_documento_id: afastamentoParaEditar?.documento_id || null
      });

      if (error) throw error;
      if (!data) throw new Error("Sem confirmação do servidor.");

      toast.success(afastamentoParaEditar ? "Atualizado!" : "Cadastrado!");
      await onSaved?.();
      onClose();
    } catch (error) {
      console.error("RPC erro detalhado:", error);
      toast.error(error?.message || "Erro inesperado ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // 🗑️ EXCLUIR (RPC ATÔMICO)
  // ==========================================
  async function excluirAfastamento() {
    if (!confirm("Excluir tudo vinculado a este afastamento?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('excluir_afastamento_completo', {
        p_id: afastamentoParaEditar.id
      });
      if (error) throw error;
      toast.success("Excluído com sucesso.");
      await onSaved?.();
      onClose();
    } catch (error) {
      console.error("Erro exclusão:", error);
      toast.error(error?.message || "Erro ao excluir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {fetching && (
          <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}

        {/* HEADER */}
        <div className="p-8 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 text-lg uppercase leading-none">
              {afastamentoParaEditar ? 'Editar Registro' : 'Novo Afastamento'}
            </h3>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2 italic">
              {militar?.posto_graduacao} {militar?.nome_guerra}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Motivo</label>
            <select 
              className="w-full p-4 bg-slate-100 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
                className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={form.data_inicio} 
                onChange={e => setForm({...form, data_inicio: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Qtd Dias</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                value={qtdDias} 
                onChange={e => setQtdDias(e.target.value)} 
              />
            </div>
          </div>

          <div className="p-5 bg-amber-50 rounded-[2rem] border border-amber-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-amber-600 uppercase">Retorno Previsto:</span>
            <span className="font-black text-amber-700">
              {form.data_fim ? (() => {
                const d = new Date(form.data_fim + "T12:00:00");
                d.setDate(d.getDate() + 1);
                return d.toLocaleDateString('pt-BR');
              })() : '---'}
            </span>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
              <FileText size={14} /> Dados do Boletim
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
                  type="number" 
                  className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  value={form.num_boletim} 
                  onChange={e => setForm({...form, num_boletim: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Data da Publicação</label>
              <input 
                type="date" 
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none"
                value={form.data_boletim} 
                onChange={e => setForm({...form, data_boletim: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Observação</label>
            <textarea 
              rows={2} 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o assunto que sairá no boletim..."
              value={form.observacao} 
              onChange={e => setForm({...form, observacao: e.target.value})} 
            />
          </div>

          {isCritico && (
            <div className="bg-red-50 p-4 rounded-2xl flex gap-3 border border-red-100 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-[10px] text-red-600 font-bold uppercase leading-tight">
                Efetivo crítico no período!
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-slate-50 border-t flex gap-4">
          {afastamentoParaEditar && (
            <button 
              onClick={excluirAfastamento} 
              disabled={loading} 
              className="p-4 rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
            </button>
          )}
          <button 
            onClick={onClose} 
            className="flex-1 p-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 text-xs transition-colors"
          >
            FECHAR
          </button>
          <button 
            onClick={salvarAfastamento} 
            disabled={loading} 
            className="flex-2 p-4 rounded-2xl font-black text-white text-xs bg-slate-900 hover:bg-blue-700 shadow-lg min-w-[140px] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : (afastamentoParaEditar ? 'ATUALIZAR' : 'CONFIRMAR')}
          </button>
        </div>
      </div>
    </div>
  );
}
