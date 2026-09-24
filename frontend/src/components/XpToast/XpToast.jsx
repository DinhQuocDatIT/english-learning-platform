import React from "react";
import styles from "./XpToast.module.css";

function XpToast({ xp, onClose }) {
  return (
    <div className={styles.toast} onClick={onClose}>
      <span className={styles.emoji}>🎉</span>
      <span className={styles.xpText}>+{xp} XP</span>
    </div>
  );
}

export default XpToast;
