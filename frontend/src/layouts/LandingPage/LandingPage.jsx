import { useEffect, useRef } from "react";
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
  const canvasRef = useRef(null);
  const glowRef = useRef(null); // Thêm ref cho quầng sáng
  const particles = useRef([]);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      // Di chuyển quầng sáng bám theo chuột (dùng transform để mượt)
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${e.clientX - 20}px, ${e.clientY - 20}px, 0)`;
      }

      // Tạo hạt kim tuyến
      for (let i = 0; i < 2; i++) {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          size: Math.random() * 4 + 2,
          color: getRandomColor(),
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 1,
          life: 1,
        });
      }
    };

    const getRandomColor = () => {
      const colors = ["#0ea792", "#fbbf24", "#f472b6", "#60a5fa", "#ffffff"];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Quầng sáng bám theo chuột */}
      <div ref={glowRef} className={styles.glowOrb}></div>

      {/* Hạt kim tuyến */}
      <canvas ref={canvasRef} className={styles.sparkleCanvas} />

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
