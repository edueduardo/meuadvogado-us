// middleware.ts
// Proteção de rotas com NextAuth

export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cliente/:path*",
    "/advogado/:path*",
    "/chat/:path*",
  ],
}
