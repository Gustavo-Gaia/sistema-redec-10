/* app/(sistema)/equipe/componentes/DrawerMilitar.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { 
  X, User, Plane, Save, Trash2, Calendar, Shield, Phone, 
  Fingerprint, Mail, Plus, Edit2, Loader2 
} from "lucide-react";
import { formatarCPF, formatarTelefone } from './utils'; 
import ModalAfastamento from './ModalAfastamento';

export default function DrawerMilitar({ militar, afastamentos = [], onClose, onSaved, militares }) {
  const [aba, setAba] = useState('dados'); 
  const [loading, setLoading] = useState(false);
  const [showModalAfast, setShowModalAfast] = useState(false);
  const [afastamentoParaEditar, setAfastamentoParaEditar] = useState(null);
  const [enviarAoMural, setEnviarAoMural] = useState(false);

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
    ordem: 0
  });

  useEffect(() => {
    if (militar) setForm({ ...militar });
  }, [militar]);

  const aplicarMascaraBoletim = (valor) => {
    const numeros = valor.replace(/\D/g, "");
    let resultado = "BOL-SEDEC ";
    if (numeros.length > 0) resultado += numeros.substring(0, 3);
    if (numeros.length >= 4) resultado += "/" + numeros.substring(3, 7);
    if (numeros.length >= 8) resultado += " - " + numeros.substring(7, 9);
    if (numeros.length >= 10) resultado += "/" + numeros.substring(9, 11);
    if (numeros.length >= 12) resultado += "/" + numeros.substring(11, 15);
    return resultado.toUpperCase();
  };

  async function registrarNoMural(militarId) {
    const dadosMural = {
      militar_id: militarId,
      nome_guerra_historico: form.nome_guerra.toUpperCase(),
      posto_graduacao_historico: form.posto_graduacao.toUpperCase(),
      funcao: form.funcao_redec.toUpperCase(),
      data_inicio: form.data_entrada_funcao || null,
      data_fim: form.data_saida_funcao || null,
      bol_inicio_historico: form.bol_entrada_funcao, 
      bol_fim_historico: form.bol_saida_funcao
    };
    const { error } = await supabase.from('equipe_mural_historico').insert(dadosMural);
    if (error) console.error("Erro ao enviar para o mural:", error.message);
  }

  async function salvarMilitar() {
    setLoading(true);
    const formatarDataParaBanco = (data) => (data === "" || !data ? null : data);

    const dadosParaSalvar = {
      ...form,
      data_entrada_redec: formatarDataParaBanco(form.data_entrada_redec),
      data_saida_redec: formatarDataParaBanco(form.data_saida_redec),
      data_entrada_funcao: formatarDataParaBanco(form.data_entrada_funcao),
      data_saida_funcao: formatarDataParaBanco(form.data_saida_funcao),
      ativo: form.data_saida_redec ? false : form.ativo,
      id: militar?.id || undefined
    };

    const { data, error } = await supabase.from('equipe').upsert(dadosParaSalvar).select().single();

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      if (enviarAoMural && form.data_saida_funcao) await registrarNoMural(data.id);
      onSaved();
      onClose();
    }
    setLoading(false);
  }

  const handleNovoAfastamento = () => {
    setAfastamentoParaEditar(null);
    setShowModalAfast(true);
  };

  const handleEditarAfastamento = (afast) => {
    setAfastamentoParaEditar(afast);
    setShowModalAfast(true);
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

        {/* NAVEGAÇÃO POR ABAS */}
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

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {aba === 'dados' && (
            <div className="space-y-4 animate-in fade-in duration-300">
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
                    <input type="text" placeholder="BOL-SEDEC XXX/XXXX" className="w-full p-2 mt-1 bg-white/50 rounded-lg border-none text-[9px] font-bold uppercase"
                      value={form.bol_entrada_redec} onChange={e => setForm({...form, bol_entrada_redec: aplicarMascaraBoletim(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-red-400 ml-1">Desligamento</label>
                    <input type="date" className="w-full p-3 bg-white rounded-xl border-none text-xs font-bold text-red-600 shadow-sm"
                      value={form.data_saida_redec || ''} onChange={e => setForm({...form, data_saida_redec: e.target.value})} />
                    <input type="text" placeholder="BOL-SEDEC XXX/XXXX" className="w-full p-2 mt-1 bg-white/50 rounded-lg border-none text-[9px] font-bold uppercase"
                      value={form.bol_saida_redec} onChange={e => setForm({...form, bol_saida_redec: aplicarMascaraBoletim(e.target.value)})} />
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
                    <input type="text" placeholder="BOL-SEDEC XXX/XXXX" className="w-full p-2 mt-1 bg-white/50 rounded-lg border-none text-[9px] font-bold uppercase"
                      value={form.bol_entrada_funcao} onChange={e => setForm({...form, bol_entrada_funcao: aplicarMascaraBoletim(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">Fim Função</label>
                    <input type="date" className="w-full p-3 bg-white rounded-xl border-none text-xs font-bold shadow-sm"
                      value={form.data_saida_funcao || ''} onChange={e => setForm({...form, data_saida_funcao: e.target.value})} />
                    <input type="text" placeholder="BOL-SEDEC XXX/XXXX" className="w-full p-2 mt-1 bg-white/50 rounded-lg border-none text-[9px] font-bold uppercase"
                      value={form.bol_saida_funcao} onChange={e => setForm({...form, bol_saida_funcao: aplicarMascaraBoletim(e.target.value)})} />
                  </div>
                </div>
                {/* CHECKBOX HISTÓRICO */}
                <div className="flex items-center gap-2 px-2 pt-2">
                  <input type="checkbox" id="mural" className="rounded border-slate-300" 
                    checked={enviarAoMural} onChange={e => setEnviarAoMural(e.target.checked)} />
                  <label htmlFor="mural" className="text-[10px] font-bold text-slate-500 uppercase">Enviar saída da função para o mural histórico</label>
                </div>
              </div>
            </div>
          )}

          {aba === 'afastamentos' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <button onClick={handleNovoAfastamento}
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
                        {afast.observacao && (
                            <p className="text-[9px] text-blue-500 font-bold mt-1 uppercase italic truncate max-w-[200px]">{afast.observacao}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditarAfastamento(afast)} 
                          className="text-slate-300 hover:text-blue-600 p-2 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        {/* ✅ CORREÇÃO: Abre o modal para exclusão segura (centralizada no modal) */}
                        <button onClick={() => handleEditarAfastamento(afast)} 
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
        <div className="p-6 border-t bg-slate-50">
          <button disabled={loading} onClick={salvarMilitar}
            className="w-full bg-slate-900 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'PROCESSANDO...' : militar ? 'CONFIRMAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'}
          </button>
        </div>
      </div>

      {/* MODAL DE AFASTAMENTO */}
      {showModalAfast && (
        <ModalAfastamento 
            militar={militar} 
            militares={militares} 
            afastamentoParaEditar={afastamentoParaEditar}
            afastamentos={afastamentos}
            onClose={() => {
              setShowModalAfast(false);
              setAfastamentoParaEditar(null);
            }} 
            onSaved={() => {
              setShowModalAfast(false);
              setAfastamentoParaEditar(null);
              onSaved();
            }} 
        />
      )}
    </div>
  );
}
