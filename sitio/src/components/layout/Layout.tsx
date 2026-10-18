import type { ReactNode } from "react";
import { BannerCookies, BarraProgreso, CursorPersonalizado, WhatsAppFlotante } from "./Flotantes";
import Footer from "./Footer";
import Header from "./Header";
import SmoothScroll from "./SmoothScroll";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <BarraProgreso />
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppFlotante />
      <BannerCookies />
      <CursorPersonalizado />
    </SmoothScroll>
  );
}
