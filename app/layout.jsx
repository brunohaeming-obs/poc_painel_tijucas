import "../src/styles.css";

export const metadata = {
  title: "Observatório Setorial Territorial",
  description: "Painel interativo de indicadores territoriais de Tijucas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
