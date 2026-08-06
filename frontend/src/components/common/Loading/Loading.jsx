import styles from "./Loading.module.css";

function Loading() {
  return (
    <div className={styles.overlay}>
      <div className={styles.loader}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
    </div>
  );
}

export default Loading;
