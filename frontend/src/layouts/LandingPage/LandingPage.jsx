import Footer from "../../components/landingPage/Footer/Footer";
import Header from "../../components/landingPage/Header/Header";
import styles from "./LandingPage.module.css";
function LandingPage() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Header />
      </header>
      <Header />
      <main></main>
      <footer className={styles.footer}>
        <Footer />
      </footer>
    </div>
  );
}
export default LandingPage;
