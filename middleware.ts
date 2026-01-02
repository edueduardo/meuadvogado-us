import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Adicionar lógica adicional se necessário
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/dashboard/:path*'],
};
