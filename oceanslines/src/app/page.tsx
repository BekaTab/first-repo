import { About } from "@/components/landing/About";
import { Hero } from "@/components/landing/Hero";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <div className="container">
          <div className="hairline" />
        </div>
        <About />
      </main>
      <SiteFooter />
    </>
  );
}
