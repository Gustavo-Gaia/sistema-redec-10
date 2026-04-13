/* app/(sistema)/equipe/componentes/TabelaEfetivo.js */

'use client';
import { useState } from 'react';
import { Edit2, Search, UserMinus, UserCheck, FileText } from "lucide-react";
import { verificarSeAtivo } from './utils';

export default function TabelaEfetivo({ militares, onEdit }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // 'todos' | 'ativos' | 'inativos'

  // Lógica de Filtragem
  const militaresFiltrados = militares.filter(m => {
    const termo = busca.toLowerCase();
    const matchBusca = 
      m.nome_completo.toLowerCase().includes(termo) || 
      m.nome_guerra.toLowerCase().includes(termo) ||
      m.id_funcional?.includes(termo) ||
      m.cpf?.includes(termo);

    const ativo = verificarSeAtivo(m);
    const matchStatus = 
      filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && ativo) || 
      (filtroStatus === 'inativos' && !ativo);

    return matchBusca && matchStatus;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* TOOLBAR DA TABELA */}
      <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por nome, RG ou CPF..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'ativos', label: 'Ativos' },
            { id: 'inativos', label: 'Inativos' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroStatus(f.id)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                filtroStatus === f.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA RESPONSIVA */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Militar</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Datas REDEC</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {militaresFiltrados.map((m) => {
              const ativo = verificarSeAtivo(m);
              return (
                <tr key={m.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${ativo ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-400'}`}>
                        {m.posto_graduacao.split(' ')[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-none mb-1">{m.nome_guerra}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">{m.nome_completo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase">ID:</span> {m.id_funcional || '---'}
                      </p>
                      <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <span className="text-[9px] font-black text-slate-300 uppercase">CPF:</span> {m.cpf || '---'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                        <UserCheck className="w-3 h-3 text-green-500" /> {m.data_entrada_redec ? new Date(m.data_entrada_redec).toLocaleDateString() : '---'}
                      </p>
                      {m.data_saida_redec && (
                        <p className="text-xs font-medium text-red-600 flex items-center gap-2">
                          <UserMinus className="w-3 h-3" /> {new Date(m.data_saida_redec).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                      ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onEdit(m)}
                      className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-blue-600 transition-all"
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
        
        {militaresFiltrados.length === 0 && (
          <div className="p-20 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Nenhum militar encontrado com estes filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
