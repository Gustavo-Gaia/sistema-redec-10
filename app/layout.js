import "./globals.css"
import Sidebar from "./Sidebar"

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className="h-full">
      <body className="h-full flex overflow-hidden bg-slate-100">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
