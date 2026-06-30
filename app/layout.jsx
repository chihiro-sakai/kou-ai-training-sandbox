import "./globals.css";

export const metadata = {
  title: "今日のWorkout占い",
  description: "5つの質問で今日のワークアウトを診断するスマホ向け占いアプリ。"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
