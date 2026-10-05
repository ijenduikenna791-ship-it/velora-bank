import "./globals.css";
import Providers from "@/context/Providers";

export const metadata = {
  title: "Velora Bank — Banking made easy",
  description:
    "Velora Bank is a modern demo banking platform. Open an account, move demo money across local, wire, PayPal, Bitcoin and more. Demo money only.",
  applicationName: "Velora Bank",
  icons: { icon: "/favicon.svg" },
};

export const viewport = {
  themeColor: "#0A0710",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
