// lib/auth.ts
// NextAuth configuration com Prisma Adapter

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            lawyer: true,
            client: true,
          },
        });

        if (!user) {
          throw new Error("Email ou senha incorretos");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Email ou senha incorretos");
        }

        // Verificar se o email foi verificado
        if (!user.emailVerified) {
          throw new Error("Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lawyerId: user.lawyer?.id,
          clientId: user.client?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.lawyerId = user.lawyerId;
        token.clientId = user.clientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.lawyerId = token.lawyerId as string | undefined;
        session.user.clientId = token.clientId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Verify JWT token function
export async function verifyToken(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    
    // Fetch user from database to ensure they're still active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        lawyer: true,
        client: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      lawyerId: user.lawyer?.id,
      clientId: user.client?.id,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
