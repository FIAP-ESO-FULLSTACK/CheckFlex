import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// Metadados globais da aplicação para título e descrição base do app.
export const metadata: Metadata = {
  title: "CheckFlex",
  description:
    "Experiência de self check-in para hospedagem com emissão de acesso temporário e operação em totem.",
};

/**
 * Layout raiz do App Router.
 * Centraliza configurações globais de documento e injeta os estilos compartilhados
 * para que todas as rotas herdem a mesma base visual e semântica.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
