import React, { useEffect, useState } from "react";
import styles from "./MyVocabularyCard.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

import { speakText } from "../../../utils/textToSpeech";
import { getEnglishVoices } from "../../../utils/englishVoices";

function MyVocabularyCard({ vocabulary, onChangeStatus }) {
  const [ukVoice, setUkVoice] = useState(null);


  useEffect(() => {
    const loadVoice = () => {
      const voices = getEnglishVoices();
      setUkVoice(voices.uk);
    };

    loadVoice();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoice);
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoice);
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!vocabulary?.word) return;

    speakText(vocabulary.word, {
      voice: ukVoice,
      lang: "en-GB",
      rate: 0.9,
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case "LEARNED":
        return "Đã học";

      case "NOT_LEARNED":
        return "Chưa học";

      default:
        return status || "Chưa học";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "LEARNED":
        return styles.learned;

      case "NOT_LEARNED":
        return styles.unlearned;

      default:
        return styles.unlearned;
    }
  };

  const handleChangeStatus = () => {
    if (!vocabulary?.id) return;

    const newStatus =
      vocabulary.learningStatus === "LEARNED" ? "NOT_LEARNED" : "LEARNED";

    onChangeStatus(vocabulary, newStatus);
  };

  return (
    <div className={styles.wordCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.wordTitle}>{vocabulary.word}</h2>

          <span className={styles.pronunciation}>
            {vocabulary.pronunciation || "/.../"}
          </span>
        </div>

        {/* STATUS */}
        <button
          type="button"
          className={`${styles.statusBadge} ${getStatusClass(
            vocabulary.learningStatus,
          )}`}
          onClick={handleChangeStatus}
          title="Bấm để thay đổi trạng thái"
        >
          {getStatusText(vocabulary.learningStatus)}
        </button>
      </div>
      <div className={styles.meaningsContainer}>
        {vocabulary.meanings?.length > 0 ? (
          vocabulary.meanings.map((meaning, index) => (
            <div key={index} className={styles.meaningItem}>
              <div className={styles.posRow}>
                <span className={styles.posTag}>{meaning.partOfSpeech}</span>

                <span className={styles.meaningText}>{meaning.meaning}</span>
              </div>

              {meaning.example && (
                <p className={styles.exampleText}>"{meaning.example}"</p>
              )}
            </div>
          ))
        ) : (
          <p className={styles.noMeaning}>Chưa có nghĩa cho từ này.</p>
        )}
      </div>
      <div className={styles.cardFooter}>
        <button
          type="button"
          className={styles.listenBtn}
          onClick={handleSpeak}
          title={`Phát âm UK: ${vocabulary.word}`}
        >
          <FontAwesomeIcon icon={faVolumeHigh} />

          <span>Listen</span>
        </button>

        <span className={styles.reviewCount}>
          Đã ôn: {vocabulary.reviewCount ?? 0} lần
        </span>
      </div>
    </div>
  );
}

export default MyVocabularyCard;
