"use client";

import Image from "next/image";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <Image
          src="/REDEC_10_NORTE_LOGO.png"
          alt="Logo REDEC 10"
          width={50}
          height={50}
        />
        <h2>Sistema REDEC 10</h2>
      </div>

      <nav>
        <ul>
          <li className="active">Dashboard</li>
          <li>Equipe REDEC 10</li>
          <li>Boletins</li>
          <li>SEI</li>
          <li>Agenda</li>
          <li>Monitoramento de Rios</li>
          <li>Contêiner Humanitário</li>
          <li>Controle de Viaturas</li>
          <li>Municípios COMDECs</li>
          <li>Bens Patrimoniais</li>
        </ul>
      </nav>

      <div className="footer-sidebar">
        REDEC 10 • v1.0 <br />
        © 2026
      </div>
    </aside>
  );
}
