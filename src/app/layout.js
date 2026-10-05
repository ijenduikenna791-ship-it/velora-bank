import "./globals.css";
import Script from "next/script";
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

        {/* Tawk.to live chat */}
        <Script id="tawk-to" strategy="lazyOnload">
          {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6ac2ee5065c8b334c5044d60/default';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();`}
        </Script>
      </body>
    </html>
  );
}
