import React, { useMemo, useState } from "react";
import styles from "./StudyFlashcard.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faVolumeHigh,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { useLocation, useNavigate } from "react-router-dom";
import { speakText } from "../../../utils/textToSpeech";

function StudyFlashcard() {
  const navigate = useNavigate();
  const location = useLocation();

  const wordsFromState = location.state?.words ?? [];
  const sourceFromState = location.state?.source ?? "all";

  const [flashcards] = useState(wordsFromState);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;

  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  const getMeaning = (word) => {
    if (!word?.meanings || word.meanings.length === 0) {
      return "Chưa có nghĩa";
    }

    return word.meanings[0]?.meaning ?? "Chưa có nghĩa";
  };

  const getPartOfSpeech = (word) => {
    if (!word?.meanings || word.meanings.length === 0) {
      return "";
    }

    return word.meanings[0]?.partOfSpeech ?? "";
  };

  const getExample = (word) => {
    if (!word?.meanings || word.meanings.length === 0) {
      return "";
    }

    return word.meanings[0]?.example ?? "";
  };

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

  const renderExample = () => {
    const sentence = getExample(currentCard);

    if (!sentence) {
      return "Chưa có ví dụ.";
    }

    const word = currentCard?.word;

    if (!word) {
      return sentence;
    }

    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(`(${escapedWord})`, "gi");
    const parts = sentence.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === word.toLowerCase()) {
        return <strong key={index}>{part}</strong>;
      }

      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const sessionTitle = useMemo(() => {
    if (sourceFromState === "learned") {
      return "TỪ VỰNG ĐÃ HỌC";
    }

    if (sourceFromState === "unlearned") {
      return "TỪ VỰNG CHƯA NHỚ";
    }

    return "PHIÊN HỌC TỪ VỰNG";
  }, [sourceFromState]);

  if (!currentCard) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>Không có từ vựng để học</h2>

          <p>Vui lòng quay lại và chọn ít nhất một từ để bắt đầu phiên học.</p>

          <button type="button" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
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

            <span className={styles.title}>{sessionTitle}</span>

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

      <div className={styles.mainContent}>
        <div className={styles.cardContainer}>
          <div
            className={`${styles.card} ${isFlipped ? styles.flipped : ""}`}
            onClick={handleFlip}
          >
            <div className={styles.cardFront}>
              <span className={styles.badge}>
                {getPartOfSpeech(currentCard)}
              </span>

              <h2 className={styles.word}>{currentCard.word}</h2>

              <p className={styles.pronunciation}>
                {currentCard.pronunciation || "Chưa có phiên âm"}
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

            <div className={styles.cardBack}>
              <div className={styles.backHeader}>
                <span className={styles.badge}>
                  {getPartOfSpeech(currentCard)}
                </span>

                <h2 className={styles.backWord}>{currentCard.word}</h2>

                <p className={styles.backPronunciation}>
                  {currentCard.pronunciation || "Chưa có phiên âm"}
                </p>
              </div>

              <div className={styles.meaning}>{getMeaning(currentCard)}</div>

              <div className={styles.exampleCard}>
                <div className={styles.exampleLine} />

                <div className={styles.exampleContent}>
                  <p className={styles.exampleEn}>{renderExample()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyFlashcard;
