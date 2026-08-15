import React, { useState } from "react";
import styles from "./StudyFlashcard.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faVolumeHigh,
  faCheck,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import { speakText } from "../../../utils/textToSpeech";

function StudyFlashcard() {
  const navigate = useNavigate();

  const [flashcards] = useState([
    {
      id: 1,
      partOfSpeech: "adjective",
      word: "ubiquitous",
      pronunciation: "/juːˈbɪk.wə.təs/",
      meaning: "có mặt ở khắp nơi",
      exampleEn: "The company's logo is ubiquitous.",
      exampleVi: "Logo của công ty có mặt ở khắp mọi nơi.",
    },
    {
      id: 2,
      partOfSpeech: "adjective",
      word: "ephemeral",
      pronunciation: "/ɪˈfem.ər.əl/",
      meaning: "chóng tàn, phù du",
      exampleEn: "Fame in the world of pop music is ephemeral.",
      exampleVi: "Danh tiếng trong thế giới nhạc pop rất phù du.",
    },
    {
      id: 3,
      partOfSpeech: "verb",
      word: "mitigate",
      pronunciation: "/ˈmɪt.ɪ.ɡeɪt/",
      meaning: "làm nhẹ, làm dịu",
      exampleEn: "We need to mitigate the risks involved.",
      exampleVi: "Chúng ta cần giảm thiểu các rủi ro liên quan.",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;

  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleSpeak = (e, word) => {
    e.stopPropagation();

    if (!word) return;

    speakText(word);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;

    setIsFlipped(false);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex >= totalCards - 1) return;

    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleAnswer = (status) => {
    console.log("Vocabulary:", currentCard.word);
    console.log("Status:", status);

    if (currentIndex < totalCards - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      console.log("Đã hoàn thành phiên học");
    }
  };

  /**
   * Highlight vocabulary inside example sentence.
   */
  const renderExample = () => {
    const sentence = currentCard.exampleEn;
    const word = currentCard.word;

    const regex = new RegExp(`(${word})`, "gi");
    const parts = sentence.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === word.toLowerCase()) {
        return <strong key={index}>{part}</strong>;
      }

      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  if (!currentCard) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>Không có từ vựng để học</h2>

          <button type="button" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* =========================
          TOP BAR
      ========================= */}

      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => navigate(-1)}
          aria-label="Đóng"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className={styles.progressSection}>
          <div className={styles.navRow}>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Từ trước"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <span className={styles.title}>ADVANCED VOCABULARY SET</span>

            <button
              type="button"
              className={styles.arrowBtn}
              onClick={handleNext}
              disabled={currentIndex === totalCards - 1}
              aria-label="Từ tiếp theo"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>

        <div className={styles.counter}>
          {currentIndex + 1} / {totalCards}
        </div>
      </div>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <div className={styles.mainContent}>
        <div className={styles.cardContainer}>
          <div
            className={`${styles.card} ${isFlipped ? styles.flipped : ""}`}
            onClick={handleFlip}
          >
            {/* =========================
                FRONT
            ========================= */}

            <div className={styles.cardFront}>
              <span className={styles.badge}>{currentCard.partOfSpeech}</span>

              <h2 className={styles.word}>{currentCard.word}</h2>

              <p className={styles.pronunciation}>
                {currentCard.pronunciation}
              </p>

              <button
                type="button"
                className={styles.speakBtn}
                onClick={(e) => handleSpeak(e, currentCard.word)}
                aria-label={`Phát âm ${currentCard.word}`}
              >
                <FontAwesomeIcon icon={faVolumeHigh} />
              </button>

              <p className={styles.flipHint}>Nhấn vào thẻ để xem nghĩa</p>
            </div>

            {/* =========================
                BACK
            ========================= */}

            <div className={styles.cardBack}>
              <div className={styles.backHeader}>
                <span className={styles.badge}>{currentCard.partOfSpeech}</span>

                <h2 className={styles.backWord}>{currentCard.word}</h2>

                <p className={styles.backPronunciation}>
                  {currentCard.pronunciation}
                </p>
              </div>

              <div className={styles.meaning}>{currentCard.meaning}</div>

              <div className={styles.exampleCard}>
               
                <div className={styles.exampleLine} />

                <div className={styles.exampleContent}>
                  <p className={styles.exampleEn}>{renderExample()}</p>

                  <p className={styles.exampleVi}>{currentCard.exampleVi}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          ANSWER BAR
      ========================= */}

      {isFlipped && (
        <div className={styles.bottomBar}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.unlearnedBtn}`}
            onClick={() => handleAnswer("unlearned")}
          >
            <FontAwesomeIcon icon={faXmark} className={styles.redIcon} />

            <span className={styles.labelMain}>Chưa nhớ</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.learnedBtn}`}
            onClick={() => handleAnswer("learned")}
          >
            <FontAwesomeIcon icon={faCheck} className={styles.greenIcon} />

            <span className={styles.labelMain}>Đã nhớ</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default StudyFlashcard;
