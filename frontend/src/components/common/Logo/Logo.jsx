import styles from "./Logo.module.css";
import mainlogo from "../../../assets/FPTP_English_Logo.png";

function Logo({ color = "default" }) {
  const isWhite = color !== "default";

  return (
    <a href="/" className={styles.logo}>
      <div className={styles.logoBox}>
        <img src={mainlogo} alt="FBTP English" />
      </div>
      <span
        className={`${styles.brandText} ${isWhite ? styles.whiteText : ""}`}
      >
        FBTP <span className={styles.brandHighlight}>English</span>
      </span>
    </a>
  );
}

export default Logo;
