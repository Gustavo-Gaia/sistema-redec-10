export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6">

        <h2 className="text-2xl font-bold mb-10">
          Sistema REDEC 10
        </h2>

        <nav className="space-y-4 text-sm">

          <a className="block bg-blue-700 p-3 rounded-lg">
            Dashboard
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            Equipe REDEC 10
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            Boletins
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            SEI
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            Agenda de Atividades
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            Monitoramento de Rios
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            Contêiner Humanitário
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            Controle de Viaturas
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            Municípios COMDECs
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            Bens Patrimoniais
          </a>

          <a className="block hover:bg-blue-700 p-3 rounded-lg transition">
            Configurações
          </a>

        </nav>
      </aside>


      {/* CONTEÚDO */}
      <main className="flex-1 p-10">

        <h1 className="text-3xl font-bold text-slate-800 mb-10">
          Dashboard
        </h1>

        <div className="grid grid-cols-4 gap-6">

          <div className="bg-green-600 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition">
            <h3 className="text-lg font-semibold">
              Monitoramento de Rios
            </h3>
          </div>

          <div className="bg-red-600 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition">
            <h3 className="text-lg font-semibold">
              Ocorrências
            </h3>
          </div>

          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition">
            <h3 className="text-lg font-semibold">
              Boletins
            </h3>
          </div>

          <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition">
            <h3 className="text-lg font-semibold">
              SEI
            </h3>
          </div>

        </div>

      </main>

    </div>
  );
}
