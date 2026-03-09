/* app/layout.js */

import "./globals.css"

export const metadata = {
  title: "Sistema REDEC 10",
  description: "Gestão Estratégica em Defesa Civil"
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        {children}
      </body>
    </html>
  )
}
