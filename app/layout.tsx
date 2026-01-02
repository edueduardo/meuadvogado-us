import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meu Advogado - Diretório de Advogados Brasileiros nos EUA",
  description: "Encontre advogados brasileiros nos Estados Unidos. Especialistas em imigração, direito de família e mais. Fale português, obtenha justiça.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
