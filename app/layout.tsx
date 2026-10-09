import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowTask | Gestão inteligente de projetos",
  description:
    "Kanban, radar de saúde e produtividade para projetos em equipe.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
