// types/next-auth.d.ts
// Extend NextAuth types

import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    lawyerId?: string;
    clientId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      lawyerId?: string;
      clientId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    lawyerId?: string;
    clientId?: string;
  }
}
