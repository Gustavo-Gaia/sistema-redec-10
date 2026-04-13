/* app/(sistema)/equipe/componentes/DrawerMilitar.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { X, User, Plane, Save, Trash2, Calendar, Shield, Phone, Fingerprint, Award, Mail, Star, Plus } from "lucide-react";
import { formatarCPF, formatarTelefone } from './utils'; // Importação atualizada
import ModalAfastamento from './ModalAfastamento';

export default function DrawerMilitar({ militar, afastamentos, onClose, onSaved, militares }) {
  const [aba, setAba] = useState('dados'); 
  const [loading, setLoading] = useState(false);
  const [showModalAfast, setShowModalAfast] = useState(false);
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
    data_saida_redec: '',
    data_entrada_funcao: '',
    data_saida_funcao: '',
    ativo: true,
    ordem: 0
  });

  useEffect(() => {
    if (militar) setForm({ ...militar });
  }, [militar]);

  async function registrarNoMural() {
    const dadosMural = {
      militar_id: militar.id,
      nome_guerra_historico: form.nome_guerra,
      posto_graduacao_historico: form.posto_graduacao,
      funcao: form.funcao_redec || (form.posto_graduacao.includes('Cel') ? 'Coordenador' : 'Subcoordenador'),
      data_inicio: form.data_entrada_funcao,
      data_fim: form.data_saida_funcao
    };

    const { error } = await supabase.from('equipe_mural_historico').insert(dadosMural);
    if (error) console.error("Erro ao enviar para o mural:", error);
  }

  async function salvarMilitar() {
    setLoading(true);
    
    // Função auxiliar para converter string vazia em null
    const formatarDataParaBanco = (data) => (data === "" ? null : data);

    const dadosParaSalvar = {
      ...form,
      // Garante que campos de data vazios sejam enviados como NULL
      data_entrada_redec: formatarDataParaBanco(form.data_entrada_redec),
      data_saida_redec: formatarDataParaBanco(form.data_saida_redec),
      data_entrada_funcao: formatarDataParaBanco(form.data_entrada_funcao),
      data_saida_funcao: formatarDataParaBanco(form.data_saida_funcao),
      
      ativo: form.data_saida_redec ? false : form.ativo,
      id: militar?.id || undefined
    };

    const { error } = await supabase.from('equipe').upsert(dadosParaSalvar);

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      if (enviarAoMural && form.data_saida_funcao) {
        await registrarNoMural();
      }
      onSaved();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {militar ? form.nome_guerra : 'Novo Militar'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
              REDEC 10 - Norte
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* ABAS */}
        <div className="flex border-b px-4 bg-slate-50 overflow-x-auto no-scrollbar">
          {[
            { id: 'dados', label: 'Pessoal', icon: User },
            { id: 'datas', label: 'Função/Datas', icon: Shield },
            { id: 'afastamentos', label: 'Afastamentos', icon: Plane, hidden: !militar },
          ].map(t => !t.hidden && (
            <button key={t.id} onClick={() => setAba(t.id)}
              className={`flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase whitespace-nowrap transition-all border-b-2 ${aba === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {aba === 'dados' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nome Completo</label>
                  <input type="text" className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value.toUpperCase()})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-500" /> E-mail Institucional/Pessoal
                  </label>
                  <input type="email" className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-600 lowercase"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Nome de Guerra</label>
                  <input type="text" className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                    value={form.nome_guerra} onChange={e => setForm({...form, nome_guerra: e.target.value.toUpperCase()})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500" /> Função REDEC
                  </label>
                  <select className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    value={form.funcao_redec} onChange={e => setForm({...form, funcao_redec: e.target.value})}>
                    <option value="">Selecione...</option>
                    <option value="Coordenador">Coordenador</option>
                    <option value="Subcoordenador">Subcoordenador</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Posto/Graduação</label>
                  <select className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
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
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">CPF</label>
                  <input type="text" className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                    value={form.cpf} placeholder="000.000.000-00" onChange={e => setForm({...form, cpf: formatarCPF(e.target.value)})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">ID Funcional</label>
                  <input type="text" className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={form.id_funcional} onChange={e => setForm({...form, id_funcional: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">RG (CBMERJ)</label>
                  <input type="text" className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={form.rg} onChange={e => setForm({...form, rg: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-green-600" /> Telefone / WhatsApp
                  </label>
                  <input type="text" className="w-full p-3 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="(00) 00000-0000"
                    value={form.telefone} onChange={e => setForm({...form, telefone: formatarTelefone(e.target.value)})} />
                </div>
              </div>
            </div>
          )}

          {aba === 'datas' && (
            <div className="space-y-6">
              <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Movimentação na Unidade
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">Ingresso</label>
                    <input type="date" className="w-full p-2 bg-white rounded-xl border-none text-sm font-medium shadow-sm"
                      value={form.data_entrada_redec} onChange={e => setForm({...form, data_entrada_redec: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-red-400 ml-1">Desligamento</label>
                    <input type="date" className="w-full p-2 bg-white rounded-xl border-none text-sm font-bold text-red-600 shadow-sm"
                      value={form.data_saida_redec} onChange={e => setForm({...form, data_saida_redec: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Fingerprint className="w-3 h-3" /> Datas da Função Atual
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">Início Função</label>
                    <input type="date" className="w-full p-2 bg-white rounded-xl border-none text-sm font-medium shadow-sm"
                      value={form.data_entrada_funcao} onChange={e => setForm({...form, data_entrada_funcao: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">Fim Função</label>
                    <input type="date" className="w-full p-2 bg-white rounded-xl border-none text-sm font-medium shadow-sm"
                      value={form.data_saida_funcao} onChange={e => setForm({...form, data_saida_funcao: e.target.value})} />
                  </div>
                </div>

                {form.data_saida_funcao && (form.funcao_redec === 'Coordenador' || form.funcao_redec === 'Subcoordenador') && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer transition-all hover:bg-amber-100">
                      <input type="checkbox" className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500" 
                        checked={enviarAoMural} onChange={e => setEnviarAoMural(e.target.checked)} />
                      <div>
                        <p className="text-[10px] font-black text-amber-700 uppercase leading-none mb-1">Galeria de Honra</p>
                        <p className="text-[9px] text-amber-600/80 font-medium italic">Registrar histórico de comando ao salvar?</p>
                      </div>
                      <Award className="w-5 h-5 text-amber-500 ml-auto" />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {aba === 'afastamentos' && (
            <div className="space-y-6">
              <button onClick={() => setShowModalAfast(true)}
                className="w-full p-4 border-2 border-dashed border-blue-200 rounded-3xl text-blue-600 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                <Plus className="w-4 h-4" /> Lançar Novo Afastamento
              </button>
              <div className="space-y-3">
                {afastamentos.length === 0 ? (
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase py-10">Nenhum afastamento registrado</p>
                ) : (
                  afastamentos.map(afast => (
                    <div key={afast.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{afast.tipo}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {afast.data_inicio} a {afast.data_fim}
                        </p>
                      </div>
                      <button onClick={async () => {
                        if(confirm("Excluir este afastamento permanentemente?")) {
                          await supabase.from('equipe_afastamentos').delete().eq('id', afast.id);
                          onSaved();
                        }
                      }} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            className="w-full bg-slate-900 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? 'PROCESSANDO...' : militar ? 'CONFIRMAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'}
          </button>
        </div>
      </div>

      {showModalAfast && (
        <ModalAfastamento militar={militar} militares={militares} afastamentos={afastamentos}
          onClose={() => setShowModalAfast(false)} onSaved={onSaved} />
      )}
    </div>
  );
}
