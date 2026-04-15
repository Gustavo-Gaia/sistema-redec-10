/* app/(sistema)/equipe/componentes/DrawerMilitar.js */

'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase";
import { 
  X, User, Plane, Save, Trash2, Calendar, Shield, Phone, 
  Fingerprint, Mail, Plus, Edit2, Loader2, Camera, RefreshCw 
} from "lucide-react";
import { formatarCPF, formatarTelefone, uploadFotoMilitar, removerFotoMilitar } from './utils';
import ModalAfastamento from './ModalAfastamento';

export default function DrawerMilitar({ militar, afastamentos = [], onClose, onSaved, militares }) {
  const [aba, setAba] = useState('dados'); 
  const [loading, setLoading] = useState(false);
  const [showModalAfast, setShowModalAfast] = useState(false);
  const [afastamentoParaEditar, setAfastamentoParaEditar] = useState(null);
  const [enviarAoMural, setEnviarAoMural] = useState(false);
  
  // ESTADOS PARA FOTO
  const fileInputRef = useRef(null);
  const [fotoArquivo, setFotoArquivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [form, setForm] = useState({
    nome_completo: '',
    nome_guerra: '',
    posto_graduacao: '',
    funcao_redec: '',
    email: '',
    rg: '',
    cpf: '',
    id_funcional: '',
    telefone: '',
    data_entrada_redec: '',
    bol_entrada_redec: '', 
    data_saida_redec: '',
    bol_saida_redec: '',    
    data_entrada_funcao: '',
    bol_entrada_funcao: '', 
    data_saida_funcao: '',
    bol_saida_funcao: '',    
    ativo: true,
    ordem: 0,
    avatar_url: ''
  });

  // Limpeza de memória (Revoke Object URL)
  useEffect(() => {
    return () => {
      if (fotoPreview && fotoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  useEffect(() => {
    if (militar) {
        setForm({ ...militar });
        if (militar.avatar_url) setFotoPreview(militar.avatar_url);
    }
  }, [militar]);

  const handleSelecionarFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoArquivo(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoverFotoStorage = async () => {
    if (!militar?.id) return;
    if (!confirm("Deseja remover permanentemente a foto deste militar?")) return;

    setLoading(true);
    try {
      await removerFotoMilitar(militar.id);
      setForm(prev => ({ ...prev, avatar_url: '' }));
      setFotoPreview(null);
      setFotoArquivo(null);
      onSaved(); 
    } catch (error) {
      alert("Erro ao remover: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const aplicarMascaraBoletim = (valor, dataReferencia = null) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length === 0) return "";
    let numeroPart = numeros.substring(0, 3);
    let anoPart = numeros.substring(3, 7);
    if (numeros.length <= 3 && dataReferencia) {
      anoPart = new Date(dataReferencia + "T12:00:00").getFullYear();
    }
    let resultado = `BOL-SEDEC ${numeroPart}`;
    if (anoPart) resultado += `/${anoPart}`;
    return resultado.toUpperCase();
  };

  const handleEditarAfastamento = (afast) => {
    setAfastamentoParaEditar(afast);
    setShowModalAfast(true);
  };

  async function registrarNoMural(militarId, urlFoto) {
    const dadosMural = {
      militar_id: militarId,
      nome_guerra_historico: form.nome_guerra.toUpperCase(),
      posto_graduacao_historico: form.posto_graduacao.toUpperCase(),
      funcao: form.funcao_redec.toUpperCase(),
      data_inicio: form.data_entrada_funcao || null,
      data_fim: form.data_saida_funcao || null,
      bol_inicio_historico: form.bol_entrada_funcao, 
      bol_fim_historico: form.bol_saida_funcao,
      foto_historica_url: urlFoto 
    };
    const { error } = await supabase.from('equipe_mural_historico').insert(dadosMural);
    if (error) console.error("Erro ao enviar para o mural:", error.message);
  }

  async function salvarMilitar() {
    setLoading(true);
    try {
        const formatarDataParaBanco = (data) => (data === "" || !data ? null : data);
        let urlFinal = form.avatar_url;
        let militarId = militar?.id;

        // 1. Se for novo e tiver foto, cria o registro básico primeiro para obter ID
        if (!militarId) {
            const { data: novo, error: errN } = await supabase
                .from('equipe')
                .insert([{ ...form, avatar_url: '' }])
                .select()
                .single();
            if (errN) throw errN;
            militarId = novo.id;
        }

        // 2. Upload da foto se houver novo arquivo
        if (fotoArquivo && militarId) {
            urlFinal = await uploadFotoMilitar(militarId, fotoArquivo);
        }

        // 3. Update Final (ou Upsert se já existia)
        const dadosParaSalvar = {
          ...form,
          avatar_url: urlFinal,
          data_entrada_redec: formatarDataParaBanco(form.data_entrada_redec),
          data_saida_redec: formatarDataParaBanco(form.data_saida_redec),
          data_entrada_funcao: formatarDataParaBanco(form.data_entrada_funcao),
          data_saida_funcao: formatarDataParaBanco(form.data_saida_funcao),
          ativo: form.data_saida_redec ? false : form.ativo,
          id: militarId
        };

        const { data, error } = await supabase.from('equipe').upsert(dadosParaSalvar).select().single();

        if (error) throw error;

        // 4. Mural Histórico
        if (enviarAoMural && form.data_saida_funcao) {
            await registrarNoMural(data.id, urlFinal);
        }

        onSaved();
        onClose();
    } catch (err) {
        alert("Erro no processo: " + err.message);
    } finally {
        setLoading(false);
    }
  }

  const handleExcluirAfastamento = async (id) => {
    if (!confirm("Excluir este afastamento definitivamente?")) return;
    try {
      const { error } = await supabase.from('equipe_afastamentos').delete().eq('id', id);
      if (error) throw error;
      onSaved();
    } catch (error) {
      alert("Erro ao excluir: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">
              {militar ? form.nome_guerra : 'Novo Militar'}
            </h2>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
              <Shield size={12} /> REDEC 10 - Norte
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* NAVEGAÇÃO */}
        <div className="flex border-b px-4 bg-slate-50 overflow-x-auto no-scrollbar">
          {[
            { id: 'dados', label: 'Pessoal', icon: User },
            { id: 'datas', label: 'Função/Datas', icon: Shield },
            { id: 'afastamentos', label: 'Afastamentos', icon: Plane, hidden: !militar },
          ].map(t => !t.hidden && (
            <button key={t.id} onClick={() => setAba(t.id)}
              className={`flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase whitespace-nowrap transition-all border-b-2 ${aba === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {aba === 'dados' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* ÁREA DA FOTO */}
              <div className="flex flex-col items-center justify-center pb-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-slate-300" />
                    )}
                    
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1"
                    >
                      <Camera size={20} />
                      <span className="text-[8px] font-black uppercase">Alterar Foto</span>
                    </button>
                  </div>
                  
                  {fotoArquivo && (
                    <button 
                      onClick={() => { setFotoArquivo(null); setFotoPreview(form.avatar_url); }}
                      className="absolute -top-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
                      title="Descartar alteração"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSelecionarFoto} />
                
                {form.avatar_url && (
                  <button 
                    onClick={handleRemoverFotoStorage}
                    className="mt-3 text-[9px] text-red-500 font-black uppercase tracking-tighter hover:underline"
                  >
                    Excluir Foto Permanente
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nome Completo</label>
                  <input type="text" className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value.toUpperCase()})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <Mail size={12} className="text-blue-500" /> E-mail Institucional
                  </label>
                  <input type="email" className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-600 lowercase"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nome de Guerra</label>
                  <input type="text" className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-black text-blue-700 uppercase"
                    value={form.nome_guerra} onChange={e => setForm({...form, nome_guerra: e.target.value.toUpperCase()})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Função REDEC</label>
                  <select className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    value={form.funcao_redec} onChange={e => setForm({...form, funcao_redec: e.target.value})}>
                    <option value="">Selecione...</option>
                    <option value="COORDENADOR">COORDENADOR</option>
                    <option value="SUBCOORDENADOR">SUBCOORDENADOR</option>
                    <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                    <option value="OPERACIONAL">OPERACIONAL</option>
                  </select>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Posto/Graduação</label>
                    <select className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                      value={form.posto_graduacao} onChange={e => setForm({...form, posto_graduacao: e.target.value})}>
                      <option value="">Selecione...</option>
                      <option value="Cel BM">Coronel BM</option>
                      <option value="Ten Cel BM">Ten Cel BM</option>
                      <option value="Maj BM">Major BM</option>
                      <option value="Cap BM">Capitão BM</option>
                      <option value="1º Ten BM">1º Tenente BM</option>
                      <option value="2º Ten BM">2º Tenente BM</option>
                      <option value="Subten BM">Subtenente BM</option>
                      <option value="1º Sgt BM">1º Sargento BM</option>
                      <option value="2º Sgt BM">2º Sargento BM</option>
                      <option value="3º Sgt BM">3º Sargento BM</option>
                      <option value="Cb BM">Cabo BM</option>
                      <option value="Sd BM">Soldado BM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">ID Funcional</label>
                    <input type="text" className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                      value={form.id_funcional} onChange={e => setForm({...form, id_funcional: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">CPF</label>
                  <input type="text" className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500"
                    value={form.cpf} placeholder="000.000.000-00" onChange={e => setForm({...form, cpf: formatarCPF(e.target.value)})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">RG (CBMERJ)</label>
                  <input type="text" className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={form.rg} onChange={e => setForm({...form, rg: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <Phone size={12} className="text-green-600" /> Telefone / WhatsApp
                  </label>
                  <input type="text" className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="(00) 00000-0000"
                    value={form.telefone} onChange={e => setForm({...form, telefone: formatarTelefone(e.target.value)})} />
                </div>
              </div>
            </div>
          )}

          {aba === 'datas' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2">
                  <Shield size={14} /> Movimentação na Unidade
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">Ingresso</label>
                    <input type="date" className="w-full p-3 bg-white rounded-xl border-none text-xs font-bold shadow-sm"
                      value={form.data_entrada_redec || ''} onChange={e => setForm({...form, data_entrada_redec: e.target.value})} />
                    <input type="text" placeholder="Nº BOL (Ex: 061)" className="w-full p-2 mt-1 bg-white/50 rounded-lg border-none text-[9px] font-bold uppercase"
                      value={form.bol_entrada_redec} onChange={e => setForm({...form, bol_entrada_redec: aplicarMascaraBoletim(e.target.value, form.data_entrada_redec)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-red-400 ml-1">Desligamento</label>
                    <input type="date" className="w-full p-3 bg-white rounded-xl border-none text-xs font-bold text-red-600 shadow-sm"
                      value={form.data_saida_redec || ''} onChange={e => setForm({...form, data_saida_redec: e.target.value})} />
                    <input type="text" placeholder="Nº BOL (Ex: 061)" className="w-full p-2 mt-1 bg-white/50 rounded-lg border-none text-[9px] font-bold uppercase"
                      value={form.bol_saida_redec} onChange={e => setForm({...form, bol_saida_redec: aplicarMascaraBoletim(e.target.value, form.data_saida_redec)})} />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Fingerprint size={14} /> Datas da Função Atual
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">Início Função</label>
                    <input type="date" className="w-full p-3 bg-white rounded-xl border-none text-xs font-bold shadow-sm"
                      value={form.data_entrada_funcao || ''} onChange={e => setForm({...form, data_entrada_funcao: e.target.value})} />
                    <input type="text" placeholder="Nº BOL (Ex: 061)" className="w-full p-2 mt-1 bg-white/50 rounded-lg border-none text-[9px] font-bold uppercase"
                      value={form.bol_entrada_funcao} onChange={e => setForm({...form, bol_entrada_funcao: aplicarMascaraBoletim(e.target.value, form.data_entrada_funcao)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">Fim Função</label>
                    <input type="date" className="w-full p-3 bg-white rounded-xl border-none text-xs font-bold shadow-sm"
                      value={form.data_saida_funcao || ''} onChange={e => setForm({...form, data_saida_funcao: e.target.value})} />
                    <input type="text" placeholder="Nº BOL (Ex: 061)" className="w-full p-2 mt-1 bg-white/50 rounded-lg border-none text-[9px] font-bold uppercase"
                      value={form.bol_saida_funcao} onChange={e => setForm({...form, bol_saida_funcao: aplicarMascaraBoletim(e.target.value, form.data_saida_funcao)})} />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2 pt-2">
                  <input type="checkbox" id="mural" className="rounded border-slate-300 text-blue-600" 
                    checked={enviarAoMural} onChange={e => setEnviarAoMural(e.target.checked)} />
                  <label htmlFor="mural" className="text-[10px] font-bold text-slate-500 uppercase">Enviar saída para o mural histórico</label>
                </div>
              </div>
            </div>
          )}

          {aba === 'afastamentos' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <button onClick={() => { setAfastamentoParaEditar(null); setShowModalAfast(true); }}
                className="w-full p-6 border-2 border-dashed border-blue-200 rounded-[2rem] text-blue-600 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                <Plus size={16} /> Lançar Novo Afastamento
              </button>
              <div className="space-y-3">
                {afastamentos.length === 0 ? (
                  <div className="text-center py-12">
                    <Plane size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nenhum afastamento registrado</p>
                  </div>
                ) : (
                  afastamentos.map(afast => (
                    <div key={afast.id} className="p-5 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:border-blue-200 transition-all group">
                      <div>
                        <p className="font-black text-slate-700 text-sm uppercase">{afast.tipo}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mt-1">
                          <Calendar size={12} /> {new Date(afast.data_inicio + "T12:00:00").toLocaleDateString('pt-BR')} a {new Date(afast.data_fim + "T12:00:00").toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditarAfastamento(afast)} 
                          className="text-slate-300 hover:text-blue-600 p-2 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleExcluirAfastamento(afast.id)} 
                          className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t bg-white">
          <button disabled={loading} onClick={salvarMilitar}
            className="w-full bg-slate-900 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'PROCESSANDO...' : militar ? 'CONFIRMAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'}
          </button>
        </div>
      </div>

      {showModalAfast && (
        <ModalAfastamento 
            militar={militar} 
            militares={militares} 
            afastamentoParaEditar={afastamentoParaEditar}
            afastamentos={afastamentos}
            onClose={() => { setShowModalAfast(false); setAfastamentoParaEditar(null); }} 
            onSaved={() => { setShowModalAfast(false); setAfastamentoParaEditar(null); onSaved(); }} 
        />
      )}
    </div>
  );
}
