
import Footer from "../../components/landingPage/Footer/Footer";
import Header from "../../components/landingPage/Header/Header";
import styles from "./LandingPage.module.css";
import Hero from "../../pages/landing/Hero/Hero";
import Features from "../../pages/landing/Features/Features";
import AISection from "../../pages/landing/AISection/AISection";
import Timeline from "../../pages/landing/Timeline/Timeline";
import Pricing from "../../pages/landing/Pricing/Pricing";
import ScrollToTop from "../../components/common/ScrollToTop/ScrollToTop";
function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Header />
      </header>
      <main className={styles.main}>
        <section id="hero">
          <Hero />
        </section>
        <section id="features">
          <Features />
        </section>
        <section id="aisection">
          <AISection />
        </section>
        <section id="timeline">
          <Timeline />
        </section>
        <section id="pricing">
          <Pricing />
        </section>
        <ScrollToTop />
      </main>
      <footer className={styles.footer}>
        <Footer />
      </footer>
    </div>
  );
}
export default LandingPage;
