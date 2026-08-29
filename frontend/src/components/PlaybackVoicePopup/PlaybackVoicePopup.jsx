import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophoneLines } from "@fortawesome/free-solid-svg-icons";
import styles from "./PlaybackVoicePopup.module.css";

function PlaybackVoicePopup({
  voices = [],
  selectedVoice,
  setSelectedVoice,
  showVoicePopup,
  setShowVoicePopup,
  onVoiceChange,
}) {
  // Rút gọn tên giọng đọc cho dễ nhìn trên nút bấm
  const getShortVoiceName = (voiceName) => {
    if (!voiceName) return "Giọng mặc định";
    // Ví dụ: "Google US English" -> "US English"
    return (
      voiceName
        .replace(/Google|Microsoft|Apple/gi, "")
        .replace(/\(.*\)/g, "")
        .trim() || voiceName
    );
  };

  const currentDisplay = selectedVoice
    ? getShortVoiceName(selectedVoice.name)
    : "Giọng đọc";

  return (
    <div className={styles.voiceWrapper}>
      <button
        className={styles.controlIconBtn}
        onClick={() => setShowVoicePopup(!showVoicePopup)}
        title="Chọn giọng đọc"
      >
        <FontAwesomeIcon icon={faMicrophoneLines} />
        <span className={styles.voiceText}>{currentDisplay}</span>
      </button>

      {showVoicePopup && (
        <div className={styles.voicePopup}>
          <div className={styles.popupTitle}>CHỌN GIỌNG ĐỌC</div>
          <div className={styles.voiceList}>
            {voices.map((voice) => {
              const isSelected = selectedVoice?.name === voice.name;
              return (
                <button
                  key={voice.name}
                  className={`${styles.voiceItemBtn} ${isSelected ? styles.voiceItemActive : ""}`}
                  onClick={() => {
                    setSelectedVoice(voice);
                    setShowVoicePopup(false);
                    if (onVoiceChange) onVoiceChange(voice);
                  }}
                  title={voice.name}
                >
                  <span className={styles.voiceLang}>{voice.lang}</span>
                  <span className={styles.voiceName}>
                    {getShortVoiceName(voice.name)}
                  </span>
                </button>
              );
            })}
            {voices.length === 0 && (
              <div className={styles.noVoice}>Đang tải danh sách giọng...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaybackVoicePopup;
