/* middleware.js */

import { NextResponse } from "next/server"

export function middleware(request) {
  const url = request.nextUrl.clone()
  const isLoginPage = url.pathname.startsWith("/login")

  // Usamos o cookie 'usuario' que você gera exclusivamente na validação de login ativa
  const usuarioCookie = request.cookies.get("usuario")
  const isLogged = !!usuarioCookie

  /* 🚫 Usuário não logado tentando acessar as rotas internas -> Joga para o Login */
  if (!isLogged && !isLoginPage) {
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  /* 🔁 Usuário logado tentando forçar a tela de login -> Joga para o Dashboard */
  if (isLogged && isLoginPage) {
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/monitoramento/:path*",
    "/equipe/:path*",
    "/boletins/:path*",
    "/agenda/:path*",
    "/viaturas/:path*",
    "/municipios/:path*",
    "/patrimonio/:path*",
    "/configuracoes/:path*"
  ]
}
