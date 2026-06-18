import "../styles/globals.css";

export const metadata = {
  title: "Tech Info Hub - BuzzRadar & Databricks Hub",
  description: "エンジニアのための情報収集ツール",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
