import React, { useEffect, useState } from "react";
import styles from "./VocabularyResult.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faPlus,
  faSpinner,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

import { speakText } from "../../../utils/textToSpeech";

const POS_LABELS = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
  preposition: "Giới từ",
  conjunction: "Liên từ",
  pronoun: "Đại từ",
  numeral: "Số từ",
  article: "Mạo từ",
  interjection: "Thán từ",
  "danh từ": "Danh từ",
  "động từ": "Động từ",
  "tính từ": "Tính từ",
  "trạng từ": "Trạng từ",
  "giới từ": "Giới từ",
  "liên từ": "Liên từ",
  "đại từ": "Đại từ",
  "số từ": "Số từ",
  "mạo từ": "Mạo từ",
  "thán từ": "Thán từ",
};

const MAX_DISPLAY = 5;

function VocabularyResult({ vocabulary, onSave, saving = false }) {
  const [voices, setVoices] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const getEnglishVoice = () => {
    return (
      voices.find(
        (v) =>
          v.lang.toLowerCase() === "en-us" &&
          v.name.toLowerCase().includes("google"),
      ) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("en-us")) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("en"))
    );
  };

  const handleSpeak = () => {
    if (!vocabulary?.word) return;

    speakText(vocabulary.word, {
      voice: getEnglishVoice(),
      lang: "en-US",
      rate: 0.9,
    });
  };

  const handleSave = () => {
    if (saving) return;
    onSave(vocabulary);
  };

  const translatePos = (pos) => {
    if (!pos || !pos.trim()) return "";
    const key = pos.toLowerCase().trim();
    return POS_LABELS[key] || pos;
  };

  const meanings = vocabulary?.meanings || [];
  const visibleMeanings = showAll ? meanings : meanings.slice(0, MAX_DISPLAY);
  const hasMore = meanings.length > MAX_DISPLAY;

  const hasPronunciation =
    vocabulary.pronunciation && vocabulary.pronunciation.trim() !== "";

  return (
    <div className={styles.vocabularyResult}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.word}>{vocabulary.word}</h1>

          <button
            type="button"
            className={styles.speakBtn}
            onClick={handleSpeak}
            aria-label={`Phát âm ${vocabulary.word}`}
          >
            <FontAwesomeIcon icon={faVolumeHigh} />
          </button>

          {hasPronunciation && (
            <span className={styles.pronunciation}>
              {vocabulary.pronunciation}
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          <FontAwesomeIcon icon={saving ? faSpinner : faPlus} spin={saving} />
          <span>{saving ? "Đang lưu..." : "Lưu từ"}</span>
        </button>
      </div>

      {/* MEANINGS */}
      <div className={styles.meanings}>
        {visibleMeanings.map((item, index) => {
          const posLabel = translatePos(item.partOfSpeech);

          return (
            <div key={index} className={styles.meaningItem}>
              {posLabel && <span className={styles.posBadge}>{posLabel}</span>}

              <div className={styles.meaningContent}>
                <p className={styles.meaningText}>{item.meaning}</p>

                {item.example && (
                  <p className={styles.exampleText}>"{item.example}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SHOW MORE */}
      {hasMore && (
        <button
          type="button"
          className={styles.showMoreBtn}
          onClick={() => setShowAll(!showAll)}
        >
          <FontAwesomeIcon icon={showAll ? faChevronUp : faChevronDown} />
          <span>
            {showAll
              ? "Thu gọn"
              : `Xem thêm ${meanings.length - MAX_DISPLAY} nghĩa`}
          </span>
        </button>
      )}
    </div>
  );
}

export default VocabularyResult;
