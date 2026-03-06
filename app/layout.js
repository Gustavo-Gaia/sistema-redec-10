import "./globals.css"
import Sidebar from "./Sidebar"
import Header from "./Header"

export const metadata = {
title:"Sistema Integrado REDEC 10 - Norte"
}

export default function RootLayout({ children }) {

return (

<html>

<body>

<div className="layout">

<Sidebar/>

<div className="content">

<Header/>

<main className="main">
{children}
</main>

<footer className="footer">

<span>
Sistema Integrado REDEC 10 - Norte
</span>

<span>
Desenvolvido para Defesa Civil
</span>

</footer>

</div>

</div>

</body>

</html>

)

}
