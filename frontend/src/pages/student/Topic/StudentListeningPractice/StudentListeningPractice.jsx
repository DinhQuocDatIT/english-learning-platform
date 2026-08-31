import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faRotateRight,
  faPlay,
  faPause,
  faChevronRight,
  faMicrophone,
  faCheck,
  faArrowLeft,
  faEye,
  faCrown,
  faStar,
  faSpinner,
  faXmark,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import { speakText } from "../../../../utils/textToSpeech";
import listeningLessonService from "../../../../services/listeningLessonService";
import listeningSentenceService from "../../../../services/listeningSentenceService";
import listeningAnswerService from "../../../../services/listeningAnswerService";

import { useLoading } from "../../../../contexts/LoadingContext";
import PlaybackSpeedPopup from "../../../../components/PlaybackSpeedPopup/PlaybackSpeedPopup";
import PlaybackVoicePopup from "../../../../components/PlaybackVoicePopup/PlaybackVoicePopup";

import getImageUrl from "../../../../utils/imageUrl";

import styles from "./StudentListeningPractice.module.css";
import ListeningSentenceFeedback from "../../../../components/ListeningSentenceFeedback/ListeningSentenceFeedback";

function StudentListeningPractice() {
  const navigate = useNavigate();
  const { topicId, lessonId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [lesson, setLesson] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [showSpeedPopup, setShowSpeedPopup] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoicePopup, setShowVoicePopup] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [sentenceInputs, setSentenceInputs] = useState({});
  const [completedSentences, setCompletedSentences] = useState({});
  const [totalXP, setTotalXP] = useState(0);
  const [revealedWordsMap, setRevealedWordsMap] = useState({});
  const [showAllWordsMap, setShowAllWordsMap] = useState({});
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);

  const inputRef = useRef(null);

  const getNumericSpeed = (speedStr) =>
    parseFloat(speedStr.replace("x", "")) || 1.0;

  // ==========================================
  // Load voices
  // ==========================================
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter((voice) =>
        voice.lang.startsWith("en"),
      );
      const listToUse =
        englishVoices.length > 0 ? englishVoices : availableVoices;

      setVoices(listToUse);
      setSelectedVoice((prev) => {
        if (prev && listToUse.some((voice) => voice.name === prev.name)) {
          return prev;
        }
        return (
          listToUse.find((voice) => voice.lang === "en-US") ||
          listToUse[0] ||
          null
        );
      });
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  // ==========================================
  // Fetch data
  // ==========================================
  useEffect(() => {
    fetchData();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [lessonId]);

  const fetchData = async () => {
    try {
      showLoading();

      const [
        lessonResponse,
        sentenceResponse,
        answersResponse,
        progressResponse,
      ] = await Promise.all([
        listeningLessonService.getById(lessonId),
        listeningSentenceService.getByLesson(lessonId),
        listeningAnswerService.getMyAnswersByLesson(lessonId),
        listeningAnswerService.getLessonProgress(lessonId),
      ]);

      const fetchedSentences = Array.isArray(sentenceResponse?.data?.data)
        ? sentenceResponse.data.data
        : [];
      const savedAnswers = Array.isArray(answersResponse?.data?.data)
        ? answersResponse.data.data
        : [];

      const progressData = progressResponse?.data?.data;
      if (progressData) {
        setIsLessonCompleted(progressData.isCompleted || false);
      }

      setLesson(lessonResponse?.data?.data || null);
      setSentences(fetchedSentences);

      const inputs = {};
      const completed = {};
      let xpTotal = 0;

      fetchedSentences.forEach((sentence, index) => {
        const answer = savedAnswers.find(
          (item) => item.listeningSentenceId === sentence.id,
        );

        if (answer) {
          inputs[index] = answer.userText || "";
          if (answer.isCorrect === true) {
            completed[sentence.id] = true;
            if (answer.experienceEarned) {
              xpTotal += answer.experienceEarned;
            }
          }
        }
      });

      setSentenceInputs(inputs);
      setCompletedSentences(completed);
      setTotalXP(xpTotal);

      if (fetchedSentences.length > 0) {
        const firstSentence = fetchedSentences[0];
        const firstAnswer = savedAnswers.find(
          (answer) => answer.listeningSentenceId === firstSentence.id,
        );

        setUserInput(firstAnswer?.userText || "");
        if (firstAnswer) {
          setShowResult(true);
          setIsCorrect(firstAnswer.isCorrect === true);
          if (firstAnswer.experienceEarned) {
            setEarnedXP(firstAnswer.experienceEarned);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu listening:", error);
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu.");
    } finally {
      hideLoading();
    }
  };

  // ==========================================
  // HANDLE RESET LESSON
  // ==========================================
  const handleResetLesson = async () => {
    if (!window.confirm("Bạn có chắc muốn làm lại bài học này?")) {
      return;
    }

    try {
      showLoading();
      await listeningAnswerService.resetLessonAnswers(lessonId);
      toast.success("Đặt lại bài học thành công! Bạn có thể làm lại từ đầu.");

      await fetchData();

      setCurrentSentenceIndex(0);
      setUserInput("");
      setShowResult(false);
      setIsCorrect(false);
      setEarnedXP(0);
      setCompletedSentences({});
      setTotalXP(0);
      setSentenceInputs({});
      setRevealedWordsMap({});
      setShowAllWordsMap({});
      setIsLessonCompleted(false);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể đặt lại bài học.",
      );
    } finally {
      hideLoading();
    }
  };

  // ==========================================
  // Khi đổi câu
  // ==========================================
  useEffect(() => {
    if (!sentences[currentSentenceIndex]) return;

    const savedInput = sentenceInputs[currentSentenceIndex] || "";
    setUserInput(savedInput);

    const currentSentence = sentences[currentSentenceIndex];
    const isCompleted = completedSentences[currentSentence.id] === true;

    if (isCompleted) {
      setShowResult(true);
      setIsCorrect(true);
    } else {
      setShowResult(false);
      setIsCorrect(false);
      setEarnedXP(0);
    }

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, [currentSentenceIndex, sentences, sentenceInputs, completedSentences]);

  // ==========================================
  // Play sentence
  // ==========================================
  const handlePlaySentence = (sentence, index) => {
    if (!sentence) return;

    if (speakingId === sentence.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsPlaying(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }

    if (speakingId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }

    setCurrentSentenceIndex(index);
    setIsPlaying(true);

    speakText(sentence.englishText, {
      lang: selectedVoice ? selectedVoice.lang : "en-US",
      voice: selectedVoice,
      rate: getNumericSpeed(playbackSpeed),
      onStart: () => {
        setSpeakingId(sentence.id);
      },
      onEnd: () => {
        setSpeakingId(null);
        setIsPlaying(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      onError: () => {
        setSpeakingId(null);
        setIsPlaying(false);
        toast.error("Lỗi khi phát âm.");
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
    });
  };

  // ==========================================
  // CHECK RESULT
  // ==========================================
  const handleCheckResult = async () => {
    const sentence = sentences[currentSentenceIndex];

    if (!sentence || !userInput.trim()) {
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSpeakingId(null);
    setIsSubmitting(true);

    try {
      const response = await listeningAnswerService.answer({
        listeningSentenceId: sentence.id,
        userText: userInput,
      });

      const answerData = response?.data?.data;

      if (!answerData) {
        throw new Error("Không nhận được dữ liệu trả lời từ server.");
      }

      const correct = answerData.isCorrect === true;
      const xpEarned = answerData.experienceEarned || 0;

      setIsCorrect(correct);
      setShowResult(true);
      setEarnedXP(xpEarned);

      setSentenceInputs((prev) => ({
        ...prev,
        [currentSentenceIndex]: userInput,
      }));

      if (correct) {
        setCompletedSentences((prev) => ({
          ...prev,
          [sentence.id]: true,
        }));

        if (xpEarned > 0) {
          setTotalXP((prev) => prev + xpEarned);
          toast.success(`🎉 +${xpEarned} XP!`);
        } else {
          toast.info("🎉 Bạn đã hoàn thành câu này rồi!");
        }
      } else {
        setCompletedSentences((prev) => {
          const next = { ...prev };
          delete next[sentence.id];
          return next;
        });
        toast.info("Chưa chính xác, thử lại nhé! 💪");
      }
    } catch (error) {
      console.error("Lỗi gửi kết quả:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể lưu kết quả. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // ==========================================
  // Input change
  // ==========================================
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    setSentenceInputs((prev) => ({
      ...prev,
      [currentSentenceIndex]: value,
    }));
    setShowResult(false);
    setEarnedXP(0);
  };

  // ==========================================
  // Next / Prev sentence
  // ==========================================
  const handleNextSentence = () => {
    if (currentSentenceIndex >= sentences.length - 1) {
      return;
    }

    setSentenceInputs((prev) => ({
      ...prev,
      [currentSentenceIndex]: userInput,
    }));

    const nextIndex = currentSentenceIndex + 1;
    setCurrentSentenceIndex(nextIndex);
    setEarnedXP(0);

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSpeakingId(null);
  };

  const handlePrevSentence = () => {
    if (currentSentenceIndex <= 0) {
      return;
    }

    setSentenceInputs((prev) => ({
      ...prev,
      [currentSentenceIndex]: userInput,
    }));

    const prevIndex = currentSentenceIndex - 1;
    setCurrentSentenceIndex(prevIndex);
    setEarnedXP(0);

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSpeakingId(null);
  };

  // ==========================================
  // Go back
  // ==========================================
  const handleGoBack = () => {
    window.speechSynthesis.cancel();
    navigate(`/dashboard/student/topics/${topicId}/lessons`);
  };

  // ==========================================
  // Replay
  // ==========================================
  const handleReplay = () => {
    const sentence = sentences[currentSentenceIndex];
    if (sentence) {
      handlePlaySentence(sentence, currentSentenceIndex);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // ==========================================
  // Reveal one word
  // ==========================================
  const toggleRevealWord = (wordIdx) => {
    setRevealedWordsMap((prev) => {
      const currentSentenceMap = prev[currentSentenceIndex] || {};
      return {
        ...prev,
        [currentSentenceIndex]: {
          ...currentSentenceMap,
          [wordIdx]: !currentSentenceMap[wordIdx],
        },
      };
    });

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // ==========================================
  // Show / hide all words
  // ==========================================
  const handleShowAllWords = () => {
    const nextState = !showAllWordsMap[currentSentenceIndex];

    setShowAllWordsMap((prev) => ({
      ...prev,
      [currentSentenceIndex]: nextState,
    }));

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // ==========================================
  // Loading
  // ==========================================
  if (!sentences.length) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Current sentence
  // ==========================================
  const currentSentence = sentences[currentSentenceIndex];

  const targetWords = currentSentence
    ? currentSentence.englishText.trim().split(/\s+/)
    : [];

  const userTypedWords = userInput.trim().split(/\s+/);

  const totalSentences = sentences.length;
  const completedCount = Object.keys(completedSentences).length;

  const progressPercent =
    totalSentences > 0
      ? Math.round((completedCount / totalSentences) * 100)
      : 0;

  const isCurrentAllShown = showAllWordsMap[currentSentenceIndex];
  const currentRevealed = revealedWordsMap[currentSentenceIndex] || {};
  const isCurrentCompleted = currentSentence
    ? completedSentences[currentSentence.id]
    : false;

  // ==========================================
  // Render
  // ==========================================
  return (
    <div className={styles.container}>
      {/* ====================================== */}
      {/* LEFT MAIN SECTION */}
      {/* ====================================== */}
      <div className={styles.leftMainSection}>
        {/* Hero Header Banner */}
        <div
          className={styles.heroHeader}
          style={{
            backgroundImage: getImageUrl(lesson?.lessonImage)
              ? `linear-gradient(135deg, rgba(13, 148, 136, 0.85), rgba(15, 23, 42, 0.95)), url(${getImageUrl(lesson.lessonImage)})`
              : `linear-gradient(135deg, var(--color-primary, #0ea792), var(--color-secondary, #0f172a))`,
          }}
        >
          <div className={styles.heroTopRow}>
            <button onClick={handleGoBack} className={styles.backButton}>
              <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
            </button>
            <div className={styles.heroBadges}>
              {lesson?.isPremium && (
                <span className={styles.premiumBadge}>
                  <FontAwesomeIcon icon={faCrown} /> Premium
                </span>
              )}
              <span className={styles.progressText}>
                {progressPercent}% hoàn thành
              </span>
            </div>
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.lessonTitle}>{lesson?.title}</h1>
            {lesson?.description && (
              <p className={styles.lessonDescription}>{lesson.description}</p>
            )}
          </div>
        </div>

        {/* ==================================== */}
        {/* PLAYER BAR */}
        {/* ==================================== */}
        <div className={styles.playerBar}>
          <div className={styles.playerControlsLeft}>
            <button
              className={styles.controlIconBtn}
              onClick={handlePrevSentence}
              disabled={currentSentenceIndex === 0}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <button className={styles.controlIconBtn} onClick={handleReplay}>
              <FontAwesomeIcon icon={faRotateRight} />
            </button>

            <button
              className={`${styles.controlIconBtn} ${styles.playBtn}`}
              onClick={() =>
                currentSentence &&
                handlePlaySentence(currentSentence, currentSentenceIndex)
              }
              disabled={!currentSentence}
            >
              <FontAwesomeIcon
                icon={
                  isPlaying && speakingId === currentSentence?.id
                    ? faPause
                    : faPlay
                }
              />
            </button>

            <button
              className={styles.controlIconBtn}
              onClick={handleNextSentence}
              disabled={currentSentenceIndex >= sentences.length - 1}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>

            <span className={styles.sentenceCounter}>
              {currentSentenceIndex + 1} / {sentences.length}
            </span>
          </div>

          <div className={styles.playerControlsRight}>
            <PlaybackVoicePopup
              voices={voices}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              showVoicePopup={showVoicePopup}
              setShowVoicePopup={setShowVoicePopup}
              onVoiceChange={() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            />

            <PlaybackSpeedPopup
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              showSpeedPopup={showSpeedPopup}
              setShowSpeedPopup={setShowSpeedPopup}
              onSpeedChange={() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            />
          </div>
        </div>

        {/* ==================================== */}
        {/* INPUT BOX */}
        {/* ==================================== */}
        <div className={styles.inputBoxCard}>
          <div className={styles.inputLabelHeader}>
            GÕ NHỮNG GÌ BẠN NGHE ĐƯỢC:
            {isCurrentCompleted && (
              <span className={styles.completedBadge}>
                <FontAwesomeIcon icon={faCheck} /> Đã hoàn thành
              </span>
            )}
          </div>

          <textarea
            ref={inputRef}
            className={`${styles.textareaField} ${
              isCurrentCompleted ? styles.textareaCompleted : ""
            }`}
            placeholder="Gõ câu trả lời của bạn ở đây..."
            value={userInput}
            onChange={handleInputChange}
            disabled={isSubmitting}
            rows={3}
          />

          <button
            className={styles.micButtonAbsolute}
            disabled={isSubmitting}
            title="Nhập bằng giọng nói (đang phát triển)"
            onClick={() =>
              toast.info("🎤 Tính năng nhập bằng giọng nói đang phát triển!")
            }
          >
            <FontAwesomeIcon icon={faMicrophone} />
          </button>
        </div>

        {/* ==================================== */}
        {/* WORD BOXES */}
        {/* ==================================== */}
        {targetWords.length > 0 && (
          <div className={styles.wordBoxesContainer}>
            {targetWords.map((targetWord, idx) => {
              const cleanTarget = targetWord
                .toLowerCase()
                .replace(/[.,!?;:'"()]/g, "");

              const typedWord = userTypedWords[idx]
                ? userTypedWords[idx].toLowerCase().replace(/[.,!?;:'"()]/g, "")
                : "";

              const isTypedCorrectly = typedWord && typedWord === cleanTarget;

              const isShown =
                isCurrentAllShown ||
                currentRevealed[idx] ||
                isTypedCorrectly ||
                isCurrentCompleted;

              return (
                <div key={idx} className={styles.wordBoxItem}>
                  <button
                    className={styles.wordEyeBtn}
                    onClick={() => toggleRevealWord(idx)}
                    title="Hiện/ẩn từ này"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>

                  <div
                    className={`${styles.wordBoxValue} ${
                      isTypedCorrectly || isCurrentCompleted
                        ? styles.wordCorrect
                        : styles.wordNormal
                    }`}
                  >
                    {isShown ? targetWord : "*".repeat(targetWord.length)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          className={styles.showAllBtn}
          onClick={handleShowAllWords}
          disabled={!currentSentence}
        >
          {isCurrentAllShown ? "ẨN TẤT CẢ TỪ" : "HIỆN TẤT CẢ TỪ"}
        </button>

        {/* ==================================== */}
        {/* RESULT BANNER */}
        {/* ==================================== */}
        {showResult && (
          <div
            className={`${styles.resultBanner} ${
              isCorrect ? styles.resultCorrect : styles.resultIncorrect
            }`}
          >
            <div className={styles.resultIconWrapper}>
              <FontAwesomeIcon icon={isCorrect ? faCircleCheck : faXmark} />
            </div>

            <div className={styles.resultContent}>
              <div className={styles.resultTitle}>
                {isCorrect ? "CHÍNH XÁC!" : "CHƯA CHÍNH XÁC"}
              </div>
              <div className={styles.resultSubtitle}>
                {isCorrect
                  ? "Bạn đã nghe và gõ chính xác câu này!"
                  : "Hãy nghe lại và thử một lần nữa nhé!"}
              </div>
            </div>

            {isCorrect && earnedXP > 0 && (
              <div className={styles.resultXPBadge}>
                <FontAwesomeIcon icon={faStar} style={{ marginRight: "4px" }} />
                +{earnedXP} XP
              </div>
            )}
          </div>
        )}

        {/* ==================================== */}
        {/* ACTION BUTTONS */}
        {/* ==================================== */}
        <div className={styles.actionButtons}>
          <button
            className={styles.checkButton}
            onClick={handleCheckResult}
            disabled={!currentSentence || !userInput.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...
              </>
            ) : (
              "KIỂM TRA KẾT QUẢ"
            )}
          </button>

          {currentSentenceIndex < sentences.length - 1 && (
            <button className={styles.nextButton} onClick={handleNextSentence}>
              TIẾP THEO{" "}
              <FontAwesomeIcon
                icon={faChevronRight}
                className={styles.nextArrow}
              />
            </button>
          )}
        </div>

        {/* ==================================== */}
        {/* COMPLETE LESSON BANNER */}
        {/* ==================================== */}
        {isLessonCompleted && (
          <div className={styles.completeLessonBanner}>
            <div className={styles.completeContent}>
              <div className={styles.completeTitle}>
                🎉 Chúc mừng! Bạn đã <span>hoàn thành</span> tất cả{" "}
                {totalSentences} câu!
              </div>
              <div className={styles.completeSubtitle}>
                Bài học đã được hoàn thành xuất sắc!
              </div>
            </div>
            <button className={styles.resetButton} onClick={handleResetLesson}>
              <FontAwesomeIcon icon={faRotateRight} /> Làm lại bài học
            </button>
          </div>
        )}

        {currentSentence && (
          <ListeningSentenceFeedback
            sentenceId={currentSentence.id}
            lessonId={lessonId}
          />
        )}
      </div>

      {/* ====================================== */}
      {/* RIGHT SIDEBAR */}
      {/* ====================================== */}
      <div className={styles.rightSidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>TIẾN ĐỘ</span>
          <span className={styles.progressPercentBadge}>
            {progressPercent}%
          </span>
        </div>

        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>

        {/* ==================================== */}
        {/* TRANSCRIPT */}
        {/* ==================================== */}
        <div className={styles.transcriptList}>
          {sentences.map((item, index) => {
            const isActive = index === currentSentenceIndex;
            const isCompleted = completedSentences[item.id];
            const isShowAll = showAllWordsMap[index];

            const shouldShowContent = isCompleted || isShowAll;

            return (
              <div
                key={item.id}
                className={`${styles.sentenceCard} ${
                  isActive ? styles.sentenceActive : ""
                } ${isCompleted ? styles.sentenceCompleted : ""}`}
                onClick={() => {
                  setSentenceInputs((prev) => ({
                    ...prev,
                    [currentSentenceIndex]: userInput,
                  }));

                  setCurrentSentenceIndex(index);
                  setEarnedXP(0);

                  window.speechSynthesis.cancel();
                  setIsPlaying(false);
                  setSpeakingId(null);
                }}
                style={{
                  cursor: "pointer",
                }}
              >
                <div className={styles.sentenceHeader}>
                  <span className={styles.sentenceOrder}>{index + 1}</span>
                  {isCompleted && (
                    <span className={styles.checkIconGreen}>
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                  )}
                </div>

                <div className={styles.sentenceContent}>
                  <div className={styles.englishText}>
                    {shouldShowContent
                      ? item.englishText
                      : "Nhấp để nghe & trả lời"}
                  </div>
                  {shouldShowContent && item.vietnameseMeaning && (
                    <div className={styles.vietnameseText}>
                      {item.vietnameseMeaning}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudentListeningPractice;
