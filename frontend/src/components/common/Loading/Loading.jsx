import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./Loading.module.css";

function Loading({ text = "Đang tải...", size = "medium", fullScreen = true }) {
  const sizeClass = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  }[size];

  const content = (
    <div className={`${styles.loadingBox} ${sizeClass}`}>
      <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className={styles.fullScreenWrapper}>{content}</div>;
  }

  return content;
}

export default Loading;
