import React, { useMemo, useState, useEffect, useRef } from "react";
import styles from "./StudyFlashcard.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faVolumeHigh,
  faChevronLeft,
  faChevronRight,
  faEye,
  faCheck,
  faArrowRight,
  faTrophy,
  faRotateRight,
  faHouse,
  faLightbulb,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

import { useLocation, useNavigate } from "react-router-dom";
import { speakText } from "../../../utils/textToSpeech";

function StudyFlashcard() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  const wordsFromState = location.state?.words ?? [];
  const sourceFromState = location.state?.source ?? "all";

  const [flashcards] = useState(wordsFromState);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInput, setUserInput] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [results, setResults] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;

  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  useEffect(() => {
    if (inputRef.current && !isFinished) {
      inputRef.current.focus();
    }
  }, [currentIndex, isFinished]);

  const getMeaning = (word) => {
    if (!word?.meanings || word.meanings.length === 0) return "Chưa có nghĩa";
    return word.meanings[0]?.meaning ?? "Chưa có nghĩa";
  };

  const getPartOfSpeech = (word) => {
    if (!word?.meanings || word.meanings.length === 0) return "";
    return word.meanings[0]?.partOfSpeech ?? "";
  };

  const getExample = (word) => {
    if (!word?.meanings || word.meanings.length === 0) return "";
    return word.meanings[0]?.example ?? "";
  };

  const normalize = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]/g, "")
      .replace(/\s+/g, " ");

  const handleSpeak = () => {
    if (!currentCard?.word) return;
    speakText(currentCard.word);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    resetCardState();
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex >= totalCards - 1) {
      setIsFinished(true);
      return;
    }
    resetCardState();
    setCurrentIndex((prev) => prev + 1);
  };

  const resetCardState = () => {
    setUserInput("");
    setIsChecked(false);
    setIsCorrect(false);
    setShowAnswer(false);
    setShowHint(false);
  };

  const handleCheck = () => {
    if (!userInput.trim()) return;

    const answer = currentCard?.word ?? "";
    const isMatch = normalize(userInput) === normalize(answer);

    setIsCorrect(isMatch);
    setIsChecked(true);

    if (isMatch && currentCard?.word) speakText(currentCard.word);

    setResults((prev) => [
      ...prev,
      {
        word: currentCard?.word,
        meaning: getMeaning(currentCard),
        pronunciation: currentCard?.pronunciation || "",
        userAnswer: userInput,
        correct: isMatch,
      },
    ]);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setIsChecked(true);
    setIsCorrect(false);

    if (currentCard?.word) speakText(currentCard.word);

    setResults((prev) => [
      ...prev,
      {
        word: currentCard?.word,
        meaning: getMeaning(currentCard),
        pronunciation: currentCard?.pronunciation || "",
        userAnswer: null,
        correct: false,
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isChecked) handleCheck();
      else handleNext();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    resetCardState();
    setResults([]);
    setIsFinished(false);
  };

  const sessionTitle = useMemo(() => {
    if (sourceFromState === "learned") return "TỪ VỰNG ĐÃ HỌC";
    if (sourceFromState === "unlearned") return "TỪ VỰNG CHƯA NHỚ";
    return "PHIÊN HỌC TỪ VỰNG";
  }, [sourceFromState]);

  /* ---------- EMPTY ---------- */
  if (!currentCard && !isFinished) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIconBox}>
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <h2>Không có từ vựng để học</h2>
          <p>
            Vui lòng quay lại danh sách từ vựng và chọn ít nhất một từ để bắt
            đầu luyện tập.
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => navigate(-1)}
          >
            Quay lại trang trước
          </button>
        </div>
      </div>
    );
  }

  /* ---------- RESULT ---------- */
  if (isFinished) {
    const correctCount = results.filter((r) => r.correct).length;
    const totalAnswered = results.length;
    const percent =
      totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    let resultMessage = "Cùng tiếp tục luyện tập nhé! 🌱";
    if (percent >= 90)
      resultMessage = "Xuất sắc! Bạn đã làm chủ hoàn toàn bộ từ vựng này! 🎉";
    else if (percent >= 70)
      resultMessage = "Khá lắm! Bạn nắm vững đa số từ vựng rồi 💪";
    else if (percent >= 50)
      resultMessage = "Tốt! Hãy ôn lại một chút để nhớ lâu hơn nữa 📚";

    return (
      <div className={styles.container}>
        <div className={styles.resultWrapper}>
          <div className={styles.resultCard}>
            <div className={styles.resultIconBox}>
              <FontAwesomeIcon icon={faTrophy} />
            </div>

            <h1 className={styles.resultTitle}>Hoàn thành phiên học!</h1>
            <p className={styles.resultSubtitle}>{resultMessage}</p>

            <div className={styles.scoreSection}>
              <div className={styles.scoreCircle}>
                <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    className={styles.scoreCircleBg}
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    className={styles.scoreCircleFill}
                    style={{ strokeDasharray: `${percent * 3.27} 327` }}
                  />
                </svg>
                <div className={styles.scoreText}>
                  <span className={styles.scorePercent}>{percent}%</span>
                  <span className={styles.scoreLabel}>Chính xác</span>
                </div>
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <div className={`${styles.statValue} ${styles.statCorrect}`}>
                  {correctCount}
                </div>
                <div className={styles.statLabel}>Đúng</div>
              </div>
              <div className={styles.statBox}>
                <div className={`${styles.statValue} ${styles.statWrong}`}>
                  {totalAnswered - correctCount}
                </div>
                <div className={styles.statLabel}>Sai</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{totalAnswered}</div>
                <div className={styles.statLabel}>Tổng câu</div>
              </div>
            </div>

            <div className={styles.resultActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => navigate(-1)}
              >
                <FontAwesomeIcon icon={faHouse} />
                Quay về
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleRestart}
              >
                <FontAwesomeIcon icon={faRotateRight} />
                Học lại từ đầu
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className={styles.detailCard}>
              <h3 className={styles.detailTitle}>Danh sách từ vựng đã học</h3>
              <div className={styles.detailList}>
                {results.map((r, index) => (
                  <div
                    key={index}
                    className={`${styles.detailItem} ${
                      r.correct ? styles.detailCorrect : styles.detailWrong
                    }`}
                  >
                    <div className={styles.detailLeft}>
                      <div className={styles.detailWordRow}>
                        <span className={styles.detailWord}>{r.word}</span>
                        {r.pronunciation && (
                          <span className={styles.detailPronun}>
                            {r.pronunciation}
                          </span>
                        )}
                        <button
                          type="button"
                          className={styles.miniAudioBtn}
                          onClick={() => r.word && speakText(r.word)}
                          title="Nghe âm"
                        >
                          <FontAwesomeIcon icon={faVolumeHigh} />
                        </button>
                      </div>
                      <span className={styles.detailMeaning}>{r.meaning}</span>
                    </div>

                    <div className={styles.detailRight}>
                      {r.correct ? (
                        <div className={styles.badgeCorrect}>
                          <FontAwesomeIcon icon={faCircleCheck} />
                          <span>Đúng</span>
                        </div>
                      ) : (
                        <div className={styles.badgeWrong}>
                          <FontAwesomeIcon icon={faCircleXmark} />
                          <span>Chưa đúng</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------- PLAY ---------- */
  const isLastCard = currentIndex === totalCards - 1;
  const answerText = currentCard?.word ?? "";
  const exampleText = getExample(currentCard);

  return (
    <div className={styles.container}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => navigate(-1)}
          aria-label="Đóng phiên học"
          title="Quay lại"
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
              title="Từ trước"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <span className={styles.title}>{sessionTitle}</span>

            <button
              type="button"
              className={styles.arrowBtn}
              onClick={handleNext}
              disabled={isLastCard && !isChecked}
              title="Từ tiếp theo"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className={styles.counterBadge}>
          <span>{currentIndex + 1}</span> / {totalCards}
        </div>
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            {/* CARD HEADER */}
            <div className={styles.cardHeader}>
              {getPartOfSpeech(currentCard) ? (
                <span className={styles.badge}>
                  {getPartOfSpeech(currentCard)}
                </span>
              ) : (
                <span className={styles.badgePlaceholder}>TỪ VỰNG</span>
              )}

              {(isChecked || showAnswer) && currentCard.pronunciation && (
                <div className={styles.pronunciationTag}>
                  <span>{currentCard.pronunciation}</span>
                  <button
                    type="button"
                    className={styles.speakBtnHeader}
                    onClick={handleSpeak}
                    title="Nghe phát âm"
                  >
                    <FontAwesomeIcon icon={faVolumeHigh} />
                  </button>
                </div>
              )}
            </div>

            {/* QUESTION */}
            <div className={styles.questionSection}>
              <p className={styles.questionLabel}>Nghĩa tiếng Việt</p>
              <h2 className={styles.questionText}>{getMeaning(currentCard)}</h2>

              {exampleText && (
                <div className={styles.hintContainer}>
                  {!showHint ? (
                    <button
                      type="button"
                      className={styles.hintToggleBtn}
                      onClick={() => setShowHint(true)}
                    >
                      <FontAwesomeIcon icon={faLightbulb} />
                      <span>Xem gợi ý câu ví dụ</span>
                    </button>
                  ) : (
                    <div className={styles.hintBox}>
                      <FontAwesomeIcon
                        icon={faLightbulb}
                        className={styles.hintIcon}
                      />
                      <p className={styles.hintText}>
                        &ldquo;{exampleText}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ANSWER */}
            <div className={styles.answerSection}>
              <div className={styles.inputWrapper}>
                <input
                  ref={inputRef}
                  type="text"
                  className={`${styles.input} ${
                    isChecked
                      ? isCorrect
                        ? styles.inputCorrect
                        : styles.inputWrong
                      : ""
                  }`}
                  placeholder="Gõ từ tiếng Anh tương ứng..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isChecked}
                  autoComplete="off"
                  spellCheck="false"
                />
                {!isChecked && userInput.trim() && (
                  <span className={styles.kbdShortcut}>↵ Enter</span>
                )}
              </div>

              {isChecked && (
                <div
                  className={`${styles.feedback} ${
                    isCorrect ? styles.feedbackCorrect : styles.feedbackWrong
                  }`}
                >
                  <div className={styles.feedbackIconBox}>
                    <FontAwesomeIcon icon={isCorrect ? faCheck : faXmark} />
                  </div>
                  <div className={styles.feedbackTextGroup}>
                    <span className={styles.feedbackTitle}>
                      {isCorrect ? "Chính xác! Tuyệt vời!" : "Chưa đúng rồi"}
                    </span>
                    {!isCorrect && (
                      <span className={styles.feedbackSub}>
                        Đáp án đúng là: <strong>{answerText}</strong>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.speakBtnFeedback}
                    onClick={handleSpeak}
                    title="Phát âm từ này"
                  >
                    <FontAwesomeIcon icon={faVolumeHigh} />
                  </button>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className={styles.cardActions}>
              {!isChecked ? (
                <>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={handleShowAnswer}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    <span>Xem đáp án</span>
                  </button>

                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={handleCheck}
                    disabled={!userInput.trim()}
                  >
                    <span>Kiểm tra</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.primaryBtnFull}
                  onClick={handleNext}
                >
                  <span>
                    {isLastCard ? "Xem kết quả phiên học" : "Từ tiếp theo"}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyFlashcard;
