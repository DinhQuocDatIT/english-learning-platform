import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import styles from "./StreakBadge.module.css";

function StreakBadge({ streak = 0 }) {
  const getTier = (s) => {
    if (s === 0) return "zero";
    if (s < 7) return "normal";
    if (s < 30) return "hot";
    if (s < 60) return "master";
    if (s < 100) return "grandmaster";
    return "legendary";
  };

  const tier = getTier(streak);

  const tierClass = {
    zero: styles.tierZero,
    normal: styles.tierNormal,
    hot: styles.tierHot,
    master: styles.tierMaster,
    grandmaster: styles.tierGrandmaster,
    legendary: styles.tierLegendary,
  }[tier];

  const showLightning = tier !== "zero" && tier !== "normal";

  return (
    <div
      className={`${styles.streakBadge} ${tierClass}`}
      aria-label={`Chuỗi ${streak} ngày`}
    >
      {/* Tia sét — giống hệt tier bá khí, chỉ đổi màu */}
      {showLightning && (
        <>
          <span className={`${styles.lightning} ${styles.lightning1}`}>⚡</span>
          <span className={`${styles.lightning} ${styles.lightning2}`}>⚡</span>
        </>
      )}

      <FontAwesomeIcon icon={faFire} className={styles.streakIcon} />
      <span className={styles.streakCount}>{streak}</span>
    </div>
  );
}

export default StreakBadge;
