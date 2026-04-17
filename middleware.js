/* middleware.js */

import { NextResponse } from "next/server"

export function middleware(request) {

  const url = request.nextUrl.clone()

  const isLoginPage = url.pathname.startsWith("/login")

  /* 🔥 pega TODOS os cookies possíveis do Supabase */
  const cookies = request.cookies.getAll()

  const hasSupabaseSession = cookies.some(c =>
    c.name.startsWith("sb-") && c.name.includes("auth-token")
  )

  const usuarioCookie = request.cookies.get("usuario")

  const isLogged = hasSupabaseSession || usuarioCookie

  /* 🚫 não logado */
  if (!isLogged && !isLoginPage) {
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  /* 🔁 já logado tentando acessar login */
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
