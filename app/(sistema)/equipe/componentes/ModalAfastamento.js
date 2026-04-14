/* app/(sistema)/equipe/componentes/ModalAfastamento.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { X, AlertTriangle, Trash2, Loader2, FileText } from "lucide-react";
import { calcularStatus } from './utils';
import { toast } from "react-hot-toast";

export default function ModalAfastamento({ militar, militares, afastamentos = [], onClose, onSaved, afastamentoParaEditar = null }) {
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

  // 1. CARREGAMENTO DE DADOS (Edição)
  useEffect(() => {
    async function carregarDadosEdicao() {
      if (!afastamentoParaEditar) {
        setForm({ tipo: 'Férias', data_inicio: '', data_fim: '', observacao: '', orgao_boletim: 'SEDEC', num_boletim: '', data_boletim: '' });
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
            // Ponto 2: Pegamos apenas o número puro para o input
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
      } catch (err) {
        toast.error("Erro ao sincronizar dados.");
      } finally {
        setFetching(false);
      }
    }
    carregarDadosEdicao();
  }, [afastamentoParaEditar]);

  // Cálculo automático da data fim
  useEffect(() => {
    if (form.data_inicio && qtdDias && !loading) {
      const inicio = new Date(form.data_inicio + "T12:00:00");
      const dias = parseInt(qtdDias);
      if (!isNaN(dias) && dias > 0) {
        const fim = new Date(inicio);
        fim.setDate(inicio.getDate() + (dias - 1));
        const dataFimStr = `${fim.getFullYear()}-${String(fim.getMonth() + 1).padStart(2, '0')}-${String(fim.getDate()).padStart(2, '0')}`;
        if (form.data_fim !== dataFimStr) {
          setForm(prev => ({ ...prev, data_fim: dataFimStr }));
        }
      }
    }
  }, [form.data_inicio, qtdDias]);

  const isCritico = (() => {
    if (!form.data_inicio || !form.data_fim || !militares) return false;
    const disponiveis = militares.filter(m => {
      if (m.id === militar.id) return false;
      const m_afas = (afastamentos || []).filter(a => a.equipe_id === m.id);
      return !calcularStatus(m_afas).isAfastado;
    }).length;
    return disponiveis <= 1;
  })();

  // 2. SALVAMENTO (Implementação dos Pontos 1, 2, 3 e 4)
  async function salvarAfastamento() {
    if (!form.data_inicio || !form.num_boletim || !form.data_boletim) {
      toast.error("Preencha as datas e o número do boletim.");
      return;
    }

    setLoading(true);
    try {
      let agendaId = afastamentoParaEditar?.agenda_evento_id;
      let retornoId = afastamentoParaEditar?.agenda_retorno_id;
      let docId = afastamentoParaEditar?.documento_id;

      // Sincronização de IDs para evitar duplicidade
      if (afastamentoParaEditar?.id) {
        const { data: check } = await supabase
          .from('equipe_afastamentos')
          .select('agenda_evento_id, agenda_retorno_id, documento_id')
          .eq('id', afastamentoParaEditar.id)
          .single();
        if (check) {
          agendaId = check.agenda_evento_id;
          retornoId = check.agenda_retorno_id;
          docId = check.documento_id;
        }
      }

      // PONTO 2: Formatação do Boletim (Somente Bol-XXX)
      const numFormatado = form.num_boletim.toString().padStart(3, '0');
      const refBoletim = `Bol-${numFormatado}`;
      const descGeral = `${form.observacao || ''} Ref: ${refBoletim} (${form.orgao_boletim})`.trim();

      // Cálculo da Data de Retorno
      const dataFimObj = new Date(form.data_fim + "T12:00:00");
      const dataRetorno = new Date(dataFimObj);
      dataRetorno.setDate(dataFimObj.getDate() + 1);
      const dataRetornoISO = dataRetorno.toISOString().split('T')[0];

      // PASSO 1: AGENDA - EVENTO PRINCIPAL (Ponto 3)
      const dadosAgendaPrincipal = {
        titulo: `${form.tipo.toUpperCase()}: ${militar.posto_graduacao} ${militar.nome_guerra}`,
        descricao: descGeral,
        data_inicio: `${form.data_inicio} 08:00:00`,
        data_fim: `${form.data_fim} 19:00:00`,
        tipo: 'Administrativo',
        cor: '#f59e0b'
      };

      if (agendaId) {
        await supabase.from('agenda_eventos').update(dadosAgendaPrincipal).eq('id', agendaId);
      } else {
        const { data: nEv, error: eEv } = await supabase.from('agenda_eventos').insert(dadosAgendaPrincipal).select('id').single();
        if (eEv) throw eEv;
        agendaId = nEv.id;
      }

      // PASSO 2: AGENDA - EVENTO DE TÉRMINO (Ponto 4)
      const dadosAgendaRetorno = {
        titulo: `TÉRMINO ${form.tipo.toUpperCase()}: ${militar.posto_graduacao} ${militar.nome_guerra}`,
        descricao: descGeral,
        data_inicio: `${dataRetornoISO} 08:00:00`,
        data_fim: `${dataRetornoISO} 09:00:00`,
        tipo: 'Administrativo',
        cor: '#10b981'
      };

      if (retornoId) {
        await supabase.from('agenda_eventos').update(dadosAgendaRetorno).eq('id', retornoId);
      } else {
        const { data: nRet, error: eRet } = await supabase.from('agenda_eventos').insert(dadosAgendaRetorno).select('id').single();
        if (eRet) throw eRet;
        retornoId = nRet.id;
      }

      // PASSO 3: DOCUMENTO (Ponto 1: Assunto = Observação)
      const dadosDoc = {
        categoria: 'boletins',
        tipo_orgao: form.orgao_boletim,
        numero: refBoletim,
        data_registro: form.data_boletim,
        assunto: form.observacao || `${form.tipo} - ${militar.nome_guerra}`,
        agenda_evento_id: agendaId
      };

      if (docId) {
        await supabase.from('documentos_administrativos').update(dadosDoc).eq('id', docId);
      } else {
        const { data: nDoc, error: eDoc } = await supabase.from('documentos_administrativos').insert(dadosDoc).select('id').single();
        if (eDoc) throw eDoc;
        docId = nDoc.id;
      }

      // PASSO 4: AFASTAMENTO
      const dadosAfast = {
        equipe_id: militar.id,
        tipo: form.tipo,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        observacao: form.observacao,
        agenda_evento_id: agendaId,
        agenda_retorno_id: retornoId,
        documento_id: docId
      };

      const { error: errFinal } = afastamentoParaEditar 
        ? await supabase.from('equipe_afastamentos').update(dadosAfast).eq('id', afastamentoParaEditar.id)
        : await supabase.from('equipe_afastamentos').insert(dadosAfast);

      if (errFinal) throw errFinal;

      toast.success(afastamentoParaEditar ? "Atualizado!" : "Cadastrado!");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function excluirAfastamento() {
    if (!confirm("Isso removerá também o boletim e os registros na agenda. Confirmar?")) return;
    setLoading(true);
    try {
      await supabase.from('equipe_afastamentos').delete().eq('id', afastamentoParaEditar.id);
      if (afastamentoParaEditar.documento_id) await supabase.from('documentos_administrativos').delete().eq('id', afastamentoParaEditar.documento_id);
      if (afastamentoParaEditar.agenda_evento_id) await supabase.from('agenda_eventos').delete().eq('id', afastamentoParaEditar.agenda_evento_id);
      if (afastamentoParaEditar.agenda_retorno_id) await supabase.from('agenda_eventos').delete().eq('id', afastamentoParaEditar.agenda_retorno_id);
      
      onSaved();
      onClose();
      toast.success("Registro excluído.");
    } catch (e) { toast.error("Erro ao excluir."); }
    finally { setLoading(false); }
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

        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-black text-slate-800 text-lg uppercase leading-none">
              {afastamentoParaEditar ? 'Editar Registro' : 'Novo Afastamento'}
            </h3>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2 italic">
              {militar?.posto_graduacao} {militar?.nome_guerra}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Motivo</label>
            <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500"
              value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
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
              <input type="date" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-sm"
                value={form.data_inicio} onChange={e => setForm({...form, data_inicio: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Qtd Dias</label>
              <input type="number" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none"
                value={qtdDias} onChange={e => setQtdDias(e.target.value)} />
            </div>
          </div>

          <div className="p-5 bg-amber-50 rounded-[2rem] border border-amber-100 flex justify-between items-center">
             <span className="text-[10px] font-black text-amber-600 uppercase">Retorno Previsto:</span>
             <span className="font-black text-amber-700">{form.data_fim ? new Date(form.data_fim + "T12:00:00").toLocaleDateString('pt-BR') : '---'}</span>
          </div>

          {/* Seção Boletim */}
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><FileText size={14} /> Dados do Boletim</p>
            <div className="grid grid-cols-2 gap-3">
              <select className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                value={form.orgao_boletim} onChange={e => setForm({...form, orgao_boletim: e.target.value})}>
                <option value="SEDEC">SEDEC</option>
                <option value="DGDEC">DGDEC</option>
              </select>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-bold text-slate-400 text-[10px]">Bol-</span>
                <input type="number" className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none"
                  value={form.num_boletim} onChange={e => setForm({...form, num_boletim: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Data da Publicação</label>
              <input type="date" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                value={form.data_boletim} onChange={e => setForm({...form, data_boletim: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Observação</label>
            <textarea rows={2} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm outline-none"
              placeholder="Digite o assunto que sairá no boletim..."
              value={form.observacao} onChange={e => setForm({...form, observacao: e.target.value})} />
          </div>

          {isCritico && (
            <div className="bg-red-50 p-4 rounded-2xl flex gap-3 border border-red-100 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-[10px] text-red-600 font-bold uppercase leading-tight">Efetivo crítico no período!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t flex gap-4">
          {afastamentoParaEditar && (
            <button onClick={excluirAfastamento} disabled={loading} className="p-4 rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 transition-all">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
            </button>
          )}
          <button onClick={onClose} className="flex-1 p-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 text-xs">FECHAR</button>
          <button onClick={salvarAfastamento} disabled={loading} className="flex-2 p-4 rounded-2xl font-black text-white text-xs bg-slate-900 hover:bg-blue-700 shadow-lg min-w-[120px]">
            {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : (afastamentoParaEditar ? 'ATUALIZAR' : 'CONFIRMAR')}
          </button>
        </div>
      </div>
    </div>
  );
}
