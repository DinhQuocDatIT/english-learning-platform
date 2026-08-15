import React, { useEffect, useState } from "react";
import styles from "./VocabularyResult.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import { speakText } from "../../../utils/textToSpeech";

function VocabularyResult({ vocabulary, onSave, saving = false }) {
  const [voices, setVoices] = useState([]);


  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      setVoices(availableVoices);
    };

    loadVoices();

    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);


  const getUkVoice = () => {
    return (
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() === "en-gb" &&
          voice.name.toLowerCase().includes("google"),
      ) || voices.find((voice) => voice.lang.toLowerCase().startsWith("en-gb"))
    );
  };

  const getUsVoice = () => {
    return (
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() === "en-us" &&
          voice.name.toLowerCase().includes("google"),
      ) || voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us"))
    );
  };


  const handleSpeakUk = () => {
    if (!vocabulary?.word) return;

    const voice = getUkVoice();

    speakText(vocabulary.word, {
      voice,
      lang: "en-GB",
      rate: 0.9,
    });
  };


  const handleSpeakUs = () => {
    if (!vocabulary?.word) return;

    const voice = getUsVoice();

    speakText(vocabulary.word, {
      voice,
      lang: "en-US",
      rate: 0.9,
    });
  };


  const handleSave = () => {
    if (saving) return;

    onSave(vocabulary);
  };

  return (
    <div className={styles.vocabularyResult}>
      {/* WORD HEADER */}

      <div className={styles.wordHeaderFlex}>
        <div className={styles.wordInfo}>
          <div className={styles.wordTitleRow}>
            <h1 className={styles.wordTitle}>{vocabulary.word}</h1>
          </div>

          {/* PRONUNCIATION */}

          <div className={styles.pronunciationRow}>
            {/* UK */}

            <div className={styles.pronunciationItem}>
              <span className={styles.accentLabel}>UK</span>

              <button
                type="button"
                className={styles.accentSpeakerBtn}
                onClick={handleSpeakUk}
                title={`Phát âm UK: ${vocabulary.word}`}
                aria-label={`Phát âm UK ${vocabulary.word}`}
              >
                <FontAwesomeIcon icon={faVolumeHigh} />
              </button>

              <span className={styles.pronunciationText}>
                {vocabulary.pronunciationUk ||
                  vocabulary.pronunciation ||
                  "/.../"}
              </span>
            </div>

            {/* US */}

            <div className={styles.pronunciationItem}>
              <span className={styles.accentLabel}>US</span>

              <button
                type="button"
                className={styles.accentSpeakerBtn}
                onClick={handleSpeakUs}
                title={`Phát âm US: ${vocabulary.word}`}
                aria-label={`Phát âm US ${vocabulary.word}`}
              >
                <FontAwesomeIcon icon={faVolumeHigh} />
              </button>

              <span className={styles.pronunciationText}>
                {vocabulary.pronunciationUs ||
                  vocabulary.pronunciation ||
                  "/.../"}
              </span>
            </div>
          </div>
        </div>

        {/* SAVE */}

        <button
          type="button"
          className={styles.saveWordBtn}
          onClick={handleSave}
          disabled={saving}
        >
          <FontAwesomeIcon icon={saving ? faSpinner : faPlus} spin={saving} />

          <span>{saving ? "Đang lưu..." : "Lưu từ"}</span>
        </button>
      </div>

      {/* MEANINGS */}

      <div className={styles.meaningsList}>
        {vocabulary.meanings?.map((item, index) => (
          <div key={index} className={styles.meaningCardItem}>
            <div className={styles.meaningTopRow}>
              <span className={styles.posBadge}>{item.partOfSpeech}</span>

              <span className={styles.meaningText}>{item.meaning}</span>
            </div>

            {item.example && (
              <div className={styles.exampleRow}>
                <span className={styles.exampleLine} />

                <p className={styles.exampleText}>"{item.example}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VocabularyResult;
