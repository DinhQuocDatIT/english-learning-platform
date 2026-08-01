import styles from "./Logo.module.css";
import mainlogo from "../../../assets/mainlogo.png";

function Logo({ color = "default" }) {
  const titleColor =
    color !== "default" ? styles.whiteTitle : styles.defaultTitle;

  return (
    <a href="#hero" className={styles.logo}>
      <img src={mainlogo} alt="English Learning Website Logo" />
      <span className={titleColor}>English</span>
    </a>
  );
}

export default Logo;
