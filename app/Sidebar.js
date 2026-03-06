"use client";

import Link from "next/link";

export default function Sidebar() {

  return (

    <aside className="sidebar">

      <div className="sidebar-title">
        Sistema<br/>REDEC 10 - Norte
      </div>

      <nav>

        <Link href="/">🏠 Dashboard</Link>
        <Link href="/equipe">👥 Equipe REDEC 10</Link>
        <Link href="/boletins">📄 Boletins</Link>
        <Link href="/sei">📥 SEI</Link>
        <Link href="/agenda">📅 Agenda</Link>
        <Link href="/rios">🌊 Monitoramento de Rios</Link>
        <Link href="/container">📦 Contêiner Humanitário</Link>
        <Link href="/viaturas">🚑 Controle de Viaturas</Link>
        <Link href="/comdecs">🏛 Municípios COMDECs</Link>
        <Link href="/bens">🏗 Bens Patrimoniais</Link>
        <Link href="/config">⚙️ Configurações</Link>

      </nav>

    </aside>

  );
}
