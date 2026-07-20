import { Inter } from "next/font/google";
import { Provider } from "@/components/provider";
import "./global.css";
import { metadata, structuredData } from "@/lib/metadata";

const inter = Inter({
  subsets: ["latin"],
});

export { metadata };

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is static metadata owned by this app.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
