import React, { useEffect, useState } from "react";
import styles from "./MyVocabularyCard.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faCircleCheck,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";

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

  const isLearned = vocabulary.learningStatus === "LEARNED";

  const handleChangeStatus = () => {
    if (!vocabulary?.id) return;
    onChangeStatus(vocabulary);
  };

  return (
    <div className={styles.wordCard}>
      {/* HEADER */}
      <div className={styles.cardHeader}>
        <div className={styles.wordInfo}>
          <h2 className={styles.wordTitle}>{vocabulary.word}</h2>

          {vocabulary.pronunciation && (
            <span className={styles.pronunciation}>
              {vocabulary.pronunciation}
            </span>
          )}
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.speakBtn}
            onClick={handleSpeak}
            title="Nghe phát âm"
          >
            <FontAwesomeIcon icon={faVolumeHigh} />
          </button>

          <button
            type="button"
            className={`${styles.statusBtn} ${
              isLearned ? styles.statusLearned : styles.statusUnlearned
            }`}
            onClick={handleChangeStatus}
            title={isLearned ? "Đánh dấu chưa học" : "Đánh dấu đã học"}
          >
            <FontAwesomeIcon icon={isLearned ? faCircleCheck : faCircle} />
            <span>{isLearned ? "Đã học" : "Chưa học"}</span>
          </button>
        </div>
      </div>

      {/* MEANINGS */}
      <div className={styles.meaningsContainer}>
        {vocabulary.meanings?.length > 0 ? (
          vocabulary.meanings.map((meaning, index) => (
            <div key={index} className={styles.meaningItem}>
              {meaning.partOfSpeech && (
                <span className={styles.posTag}>{meaning.partOfSpeech}</span>
              )}

              <div className={styles.meaningContent}>
                <p className={styles.meaningText}>{meaning.meaning}</p>

                {meaning.example && (
                  <p className={styles.exampleText}>{meaning.example}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noMeaning}>Chưa có nghĩa cho từ này.</p>
        )}
      </div>
    </div>
  );
}

export default MyVocabularyCard;
