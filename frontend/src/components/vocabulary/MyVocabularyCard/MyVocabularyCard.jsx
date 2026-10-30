import React, { useEffect, useState, useMemo } from "react";
import styles from "./MyVocabularyCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faCheck,
  faTrash,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { speakText } from "../../../utils/textToSpeech";
import { getEnglishVoices } from "../../../utils/englishVoices";

function MyVocabularyCard({ vocabulary, onChangeStatus, onDelete }) {
  const [ukVoice, setUkVoice] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!vocabulary?.word) return;
    speakText(vocabulary.word, { voice: ukVoice, lang: "en-GB", rate: 0.9 });
  };

  const isLearned = vocabulary.learningStatus === "LEARNED";

  const groupedMeanings = useMemo(() => {
    if (!vocabulary.meanings) return [];
    const groups = {};
    vocabulary.meanings.forEach((m) => {
      const pos = m.partOfSpeech || "Khác";
      if (!groups[pos]) groups[pos] = [];
      groups[pos].push(m);
    });
    return Object.entries(groups).map(([pos, items]) => ({ pos, items }));
  }, [vocabulary.meanings]);

  return (
    <div
      className={`${styles.card} ${isExpanded ? styles.isExpanded : ""} ${isLearned ? styles.isLearned : ""}`}
    >
      {/* HEADER */}
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.titleArea}>
          <h2 className={styles.word}>{vocabulary.word}</h2>
          {vocabulary.pronunciation && (
            <span className={styles.pronunciation}>
              /{vocabulary.pronunciation}/
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.speakBtn}
            onClick={handleSpeak}
            title="Nghe"
          >
            <FontAwesomeIcon icon={faVolumeHigh} />
          </button>
          <button
            className={`${styles.statusBtn} ${isLearned ? styles.statusLearned : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onChangeStatus(vocabulary);
            }}
            title={isLearned ? "Đã học" : "Chưa học"}
          >
            <FontAwesomeIcon icon={faCheck} />
          </button>
          <button
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(vocabulary);
            }}
            title="Xóa"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
          <div
            className={`${styles.expandIcon} ${isExpanded ? styles.rotate : ""}`}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className={`${styles.body} ${isExpanded ? styles.open : ""}`}>
        <div className={styles.innerBody}>
          {groupedMeanings.length > 0 ? (
            groupedMeanings.map((group, idx) => (
              <div key={idx} className={styles.meaningGroup}>
                <span className={styles.pos}>{group.pos}</span>
                <ul className={styles.meaningList}>
                  {group.items.map((m, i) => (
                    <li key={i} className={styles.meaningItem}>
                      <span className={styles.meaningText}>{m.meaning}</span>
                      {m.example && (
                        <span className={styles.exampleText}>
                          VD: {m.example}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className={styles.noMeaning}>Chưa có nghĩa cho từ này.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyVocabularyCard;
