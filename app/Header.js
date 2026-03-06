import Image from "next/image";

export default function Header() {

  return (

    <header className="header">

      <div className="header-left">

        <Image
          src="/REDEC_10_NORTE_LOGO.png"
          width={45}
          height={45}
          alt="Logo"
        />

        <div>
          <h1>Sistema Integrado REDEC 10 - Norte</h1>
          <p>Defesa Civil - Governo do Estado</p>
        </div>

      </div>

      <button className="logout">
        Sair
      </button>

    </header>

  );
}
