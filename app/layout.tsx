import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/i18n/locale-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "CheckFlex",
  description:
    "Experiência de self check-in para hospedagem com emissão de acesso temporário e operação em totem.",
};

// Configuração de viewport pensada para totem touch: bloqueia zoom por gesto
// e mantém a UI estável em painéis 1080x1920 / 1920x1080.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d9b8a",
};

/**
 * Layout raiz do App Router.
 * Disponibiliza o contexto de idioma para que todas as telas compartilhem o
 * mesmo dicionário sem precisar repetir o provider.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
