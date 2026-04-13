/* app/(sistema)/equipe/componentes/DrawerMilitar.js */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { X, User, Plane, Save, Trash2, Calendar, Shield, Phone, Fingerprint, Award, Mail, Star, Plus, FileText } from "lucide-react";
import { formatarCPF, formatarTelefone } from './utils'; 
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

  // Máscara para Bol-Sedec xxx/xxxx - dd/mm/aaaa
  const aplicarMascaraBoletim = (valor) => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, "");
    let formatado = "BOL-SEDEC ";

    if (apenasNumeros.length > 0) {
      // Adiciona o número do boletim (até 3 dígitos)
      formatado += apenasNumeros.substring(0, 3);
    }
    if (apenasNumeros.length >= 4) {
      // Adiciona a barra e o ano (até 4 dígitos)
      formatado += "/" + apenasNumeros.substring(3, 7);
    }
    if (apenasNumeros.length >= 8) {
      // Adiciona o traço e o dia
      formatado += " - " + apenasNumeros.substring(7, 9);
    }
    if (apenasNumeros.length >= 10) {
      // Adiciona a barra e o mês
      formatado += "/" + apenasNumeros.substring(9, 11);
    }
    if (apenasNumeros.length >= 12) {
      // Adiciona a barra e o ano final
      formatado += "/" + apenasNumeros.substring(11, 15);
    }

    return formatado;
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
    if (error) console.error("Erro mural:", error.message);
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
      if (enviarAoMural && form.data_saida_funcao) {
        await registrarNoMural(data.id);
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
                    <Mail className="w-3 h-3 text-blue-500" /> E-mail
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
                    <option value="COORDENADOR">COORDENADOR</option>
                    <option value="SUBCOORDENADOR">SUBCOORDENADOR</option>
                    <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                  </select>
                </div>

                {/* Posto, CPF, ID, RG e Telefone omitidos para brevidade, mas devem permanecer iguais ao seu original */}
              </div>
            </div>
          )}

          {aba === 'datas' && (
            <div className="space-y-6">
              {/* MOVIMENTAÇÃO NA UNIDADE */}
              <div className="p-5 bg-blue-50 rounded-[32px] border border-blue-100 space-y-4 shadow-sm">
                <h4 className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Movimentação na Unidade
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Data Ingresso</label>
                    <input type="date" className="w-full p-2 bg-white rounded-xl border-none text-sm font-medium shadow-sm mb-2"
                      value={form.data_entrada_redec || ''} onChange={e => setForm({...form, data_entrada_redec: e.target.value})} />
                    <input type="text" placeholder="BOL-SEDEC 000/2026" className="w-full p-2 bg-white/70 rounded-lg border-none text-[9px] font-bold"
                      value={form.bol_entrada_redec} onChange={e => setForm({...form, bol_entrada_redec: aplicarMascaraBoletim(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-red-400 uppercase">Data Desligamento</label>
                    <input type="date" className="w-full p-2 bg-white rounded-xl border-none text-sm font-bold text-red-600 shadow-sm mb-2"
                      value={form.data_saida_redec || ''} onChange={e => setForm({...form, data_saida_redec: e.target.value})} />
                    <input type="text" placeholder="BOL-SEDEC 000/2026" className="w-full p-2 bg-white/70 rounded-lg border-none text-[9px] font-bold"
                      value={form.bol_saida_redec} onChange={e => setForm({...form, bol_saida_redec: aplicarMascaraBoletim(e.target.value)})} />
                  </div>
                </div>
              </div>

              {/* DATAS DA FUNÇÃO */}
              <div className="p-5 bg-slate-50 rounded-[32px] border border-slate-200 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Fingerprint className="w-3 h-3" /> Datas da Função Atual
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Início Função</label>
                    <input type="date" className="w-full p-2 bg-white rounded-xl border-none text-sm font-medium shadow-sm mb-2"
                      value={form.data_entrada_funcao || ''} onChange={e => setForm({...form, data_entrada_funcao: e.target.value})} />
                    <input type="text" placeholder="BOL-SEDEC 000/2026" className="w-full p-2 bg-white/70 rounded-lg border-none text-[9px] font-bold"
                      value={form.bol_entrada_funcao} onChange={e => setForm({...form, bol_entrada_funcao: aplicarMascaraBoletim(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Fim Função</label>
                    <input type="date" className="w-full p-2 bg-white rounded-xl border-none text-sm font-medium shadow-sm mb-2"
                      value={form.data_saida_funcao || ''} onChange={e => setForm({...form, data_saida_funcao: e.target.value})} />
                    <input type="text" placeholder="BOL-SEDEC 000/2026" className="w-full p-2 bg-white/70 rounded-lg border-none text-[9px] font-bold"
                      value={form.bol_saida_funcao} onChange={e => setForm({...form, bol_saida_funcao: aplicarMascaraBoletim(e.target.value)})} />
                  </div>
                </div>

                {form.data_saida_funcao && ['COORDENADOR', 'SUBCOORDENADOR'].includes(form.funcao_redec) && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer transition-all hover:bg-amber-100">
                      <input type="checkbox" className="w-4 h-4 rounded border-amber-300 text-amber-600" 
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

          {/* Aba afastamentos omitida para brevidade, manter igual */}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t bg-slate-50">
          <button disabled={loading} onClick={salvarMilitar}
            className="w-full bg-slate-900 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50">
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
