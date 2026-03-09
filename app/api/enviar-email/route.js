/* app/api/enviar-email/route.js */
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req){

  const { email, token } = await req.json()

  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/login/nova-senha?token=${token}`

  await resend.emails.send({
    // IMPORTANTE: Use o e-mail que você validou no painel da Resend
    from: "gustavogaiacbmerj@gmail.com", 
    to: email,
    subject: "Recuperação de senha",
    html: `
      <h2>Redefinir senha</h2>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${link}">Redefinir senha</a>
      <p>O link expira em 1 hora.</p>
    `
  })

  return Response.json({ ok: true })
}
