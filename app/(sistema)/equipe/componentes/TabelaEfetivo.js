/* app/(sistema)/equipe/componentes/TabelaEfetivo.js */

'use client';
import { useState, useMemo } from 'react';
import { Edit2, Search, UserMinus, UserCheck, FileText, Shield } from "lucide-react";
import { verificarSeAtivo } from './utils';

// Constante de ordenação por Posto/Graduação
const PESO_HIERARQUIA = {
  'Cel BM': 1,
  'Ten Cel BM': 2,
  'Maj BM': 3,
  'Cap BM': 4,
  '1º Ten BM': 5,
  '2º Ten BM': 6,
  'Subten BM': 7,
  '1º Sgt BM': 8,
  '2º Sgt BM': 9,
  '3º Sgt BM': 10,
  'Cb BM': 11,
  'Sd BM': 12
};

export default function TabelaEfetivo({ militares, onEdit }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Função para tratar RG como número para ordenação de antiguidade
  const limparRG = (rg) => {
    if (!rg) return 9999999;
    return parseInt(rg.toString().replace(/\D/g, ""), 10);
  };

  const militaresProcessados = useMemo(() => {
    // 1. Filtragem por busca e status
    const filtrados = militares.filter(m => {
      const termo = busca.toLowerCase();
      const matchBusca = 
        m.nome_completo?.toLowerCase().includes(termo) || 
        m.nome_guerra?.toLowerCase().includes(termo) ||
        m.id_funcional?.includes(termo) ||
        m.rg?.includes(termo) ||
        m.cpf?.includes(termo);

      const ativo = verificarSeAtivo(m);
      const matchStatus = 
        filtroStatus === 'todos' || 
        (filtroStatus === 'ativos' && ativo) || 
        (filtroStatus === 'inativos' && !ativo);

      return matchBusca && matchStatus;
    });

    // 2. Ordenação Complexa (Status -> Hierarquia -> RG)
    return filtrados.sort((a, b) => {
      const aAtivo = verificarSeAtivo(a);
      const bAtivo = verificarSeAtivo(b);

      // Critério 1: Status (Ativos primeiro)
      if (aAtivo && !bAtivo) return -1;
      if (!aAtivo && bAtivo) return 1;

      // Critério 2: Hierarquia
      const pesoA = PESO_HIERARQUIA[a.posto_graduacao] || 99;
      const pesoB = PESO_HIERARQUIA[b.posto_graduacao] || 99;

      if (pesoA !== pesoB) {
        return pesoA - pesoB;
      }

      // Critério 3: Antiguidade pelo RG (Menor número = Mais antigo)
      const rgA = limparRG(a.rg);
      const rgB = limparRG(b.rg);
      
      if (rgA !== rgB) {
        return rgA - rgB;
      }

      // Critério 4: Alfabético (Nome de Guerra)
      return (a.nome_guerra || "").localeCompare(b.nome_guerra || "");
    });
  }, [militares, busca, filtroStatus]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* TOOLBAR SUPERIOR */}
      <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por nome, RG, ID ou CPF..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'ativos', label: 'Ativos' },
            { id: 'inativos', label: 'Inativos' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroStatus(f.id)}
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${
                filtroStatus === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA DE DADOS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Militar</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status / REDEC</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {militaresProcessados.map((m) => {
              const ativo = verificarSeAtivo(m);
              return (
                <tr key={m.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Badge de Posto/Graduação com largura fixa para não quebrar nomes longos */}
                      <div className={`min-w-[90px] h-10 px-2 rounded-xl flex items-center justify-center font-black text-[10px] text-center leading-tight shadow-sm border ${
                        ativo 
                          ? 'bg-white border-slate-200 text-slate-600' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 italic'
                      }`}>
                        {m.posto_graduacao}
                      </div>
                      <div>
                        <p className={`font-bold leading-none mb-1 uppercase text-sm ${ativo ? 'text-slate-800' : 'text-slate-500'}`}>
                          {m.nome_guerra}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                          {m.nome_completo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <p className="text-[11px] font-medium text-slate-600">
                        <span className="text-[9px] font-black text-slate-300 uppercase mr-1">RG:</span> {m.rg || '---'}
                      </p>
                      <p className="text-[11px] font-medium text-slate-600">
                        <span className="text-[9px] font-black text-slate-300 uppercase mr-1">ID:</span> {m.id_funcional || '---'}
                      </p>
                      <p className="text-[11px] font-medium text-slate-600 col-span-2">
                        <span className="text-[9px] font-black text-slate-300 uppercase mr-1">CPF:</span> {m.cpf || '---'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border shadow-sm ${
                        ativo 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-red-50 text-red-500 border-red-100'
                      }`}>
                        {ativo ? 'Ativo' : 'Inativo / Ex-Membro'}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-500" />
                          {m.data_entrada_redec ? new Date(m.data_entrada_redec).toLocaleDateString('pt-BR') : '--/--/--'}
                        </p>
                        {!ativo && m.data_saida_redec && (
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <UserMinus className="w-3 h-3 text-rose-500" />
                            {new Date(m.data_saida_redec).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onEdit(m)}
                      className="p-2.5 hover:bg-white hover:shadow-lg rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100 group-hover:scale-110"
                      title="Editar Prontuário"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* EMPTY STATE */}
        {militaresProcessados.length === 0 && (
          <div className="p-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
              <FileText className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-slate-500 font-black uppercase text-xs tracking-widest">Sem resultados</h3>
            <p className="text-slate-400 text-[10px] font-medium mt-1 uppercase">Ajuste os filtros ou a busca para encontrar militares.</p>
          </div>
        )}
      </div>

      {/* RODAPÉ INFORMATIVO */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          Total: {militaresProcessados.length} militar(es) listado(s)
        </p>
        <div className="flex items-center gap-2 opacity-50">
          <Shield className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase">Sistema REDEC 10</span>
        </div>
      </div>
    </div>
  );
}
