import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KonferenzService",
  description: "Konferenzraum-Buchungen, Produkte und Abrechnung",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('ks_theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
