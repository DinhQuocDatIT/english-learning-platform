import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGaugeHigh } from "@fortawesome/free-solid-svg-icons";
import styles from "./PlaybackSpeedPopup.module.css"; 

function PlaybackSpeedPopup({
  playbackSpeed,
  setPlaybackSpeed,
  showSpeedPopup,
  setShowSpeedPopup,
  onSpeedChange,
}) {
  const speeds = [
    "0.25x",
    "0.5x",
    "0.75x",
    "1x",
    "1.25x",
    "1.5x",
    "1.75x",
    "2x",
  ];

  return (
    <div className={styles.speedWrapper}>
      <button
        className={styles.controlIconBtn}
        onClick={() => setShowSpeedPopup(!showSpeedPopup)}
      >
        <FontAwesomeIcon icon={faGaugeHigh} />{" "}
        <span className={styles.speedText}>{playbackSpeed}</span>
      </button>

      {showSpeedPopup && (
        <div className={styles.speedPopup}>
          <div className={styles.popupTitle}>TỐC ĐỘ PHÁT LẠI</div>
          <div className={styles.speedGrid}>
            {speeds.map((spd) => (
              <button
                key={spd}
                className={`${styles.speedItemBtn} ${
                  playbackSpeed === spd ? styles.speedItemActive : ""
                }`}
                onClick={() => {
                  setPlaybackSpeed(spd);
                  setShowSpeedPopup(false);
                  if (onSpeedChange) onSpeedChange(spd);
                }}
              >
                {spd}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaybackSpeedPopup;
