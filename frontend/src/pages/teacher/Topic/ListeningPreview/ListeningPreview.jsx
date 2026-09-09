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
  faXmark,
  faCircleCheck,
  faHeadphones,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { speakText } from "../../../../utils/textToSpeech";
import listeningLessonService from "../../../../services/listeningLessonService";
import listeningSentenceService from "../../../../services/listeningSentenceService";
import { useLoading } from "../../../../contexts/LoadingContext";
import PlaybackSpeedPopup from "../../../../components/PlaybackSpeedPopup/PlaybackSpeedPopup";
import PlaybackVoicePopup from "../../../../components/PlaybackVoicePopup/PlaybackVoicePopup";
import getImageUrl from "../../../../utils/imageUrl";
import styles from "./ListeningPreview.module.css";

function ListeningPreview() {
  const navigate = useNavigate();
  const { topicId, lessonId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [lesson, setLesson] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Player state
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [showSpeedPopup, setShowSpeedPopup] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  // Voice state
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoicePopup, setShowVoicePopup] = useState(false);

  // Typing & UI state
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [revealedWordsMap, setRevealedWordsMap] = useState({});
  const [showAllWordsMap, setShowAllWordsMap] = useState({});

  const inputRef = useRef(null);

  const getNumericSpeed = (speedStr) =>
    parseFloat(speedStr.replace("x", "")) || 1.0;

  // Load voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter((v) =>
        v.lang.startsWith("en"),
      );
      const listToUse =
        englishVoices.length > 0 ? englishVoices : availableVoices;

      setVoices(listToUse);
      setSelectedVoice((prev) => {
        if (prev && listToUse.some((v) => v.name === prev.name)) return prev;
        return (
          listToUse.find((v) => v.lang === "en-US") || listToUse[0] || null
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

  useEffect(() => {
    fetchData();
    return () => window.speechSynthesis.cancel();
  }, [lessonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      showLoading();
      const [lessonResponse, sentenceResponse] = await Promise.all([
        listeningLessonService.getById(lessonId),
        listeningSentenceService.getByLesson(lessonId),
      ]);
      const fetchedSentences = Array.isArray(sentenceResponse?.data?.data)
        ? sentenceResponse.data.data
        : [];
      setLesson(lessonResponse?.data?.data || null);
      setSentences(fetchedSentences);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleGoBack = () => {
    window.speechSynthesis.cancel();
    navigate(
      `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}/sentences`,
    );
  };

  const handlePlaySentence = (sentence, index) => {
    if (!sentence) return;
    if (speakingId === sentence.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsPlaying(false);
      if (inputRef.current) inputRef.current.focus();
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
      onStart: () => setSpeakingId(sentence.id),
      onEnd: () => {
        setSpeakingId(null);
        setIsPlaying(false);
        if (inputRef.current) inputRef.current.focus();
      },
      onError: () => {
        setSpeakingId(null);
        setIsPlaying(false);
        toast.error("Lỗi khi phát âm.");
        if (inputRef.current) inputRef.current.focus();
      },
    });
  };

  const handleCheckResult = () => {
    const sentence = sentences[currentSentenceIndex];
    if (!sentence) return;

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSpeakingId(null);

    const normalize = (str) =>
      str
        .toLowerCase()
        .replace(/[.,!?;:'"()]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const userNormalized = normalize(userInput);
    const targetNormalized = normalize(sentence.englishText);

    const isMatch =
      userNormalized === targetNormalized ||
      (() => {
        const userWords = new Set(userNormalized.split(" "));
        const targetWords = targetNormalized.split(" ");
        const matched = targetWords.filter((word) =>
          userWords.has(word),
        ).length;
        return targetWords.length > 0 && matched / targetWords.length >= 0.9;
      })();

    setIsCorrect(isMatch);
    setShowResult(true);

    if (isMatch) {
      toast.success("🎉 Chính xác!");
    } else {
      toast.info("Chưa chính xác, thử lại nhé! 💪");
    }

    if (inputRef.current) inputRef.current.focus();
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
      setUserInput("");
      setShowResult(false);
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setSpeakingId(null);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex((prev) => prev - 1);
      setUserInput("");
      setShowResult(false);
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setSpeakingId(null);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleReplay = () => {
    const sentence = sentences[currentSentenceIndex];
    if (sentence) {
      handlePlaySentence(sentence, currentSentenceIndex);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

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
    if (inputRef.current) inputRef.current.focus();
  };

  const handleShowAllWords = () => {
    const nextState = !showAllWordsMap[currentSentenceIndex];
    setShowAllWordsMap((prev) => ({
      ...prev,
      [currentSentenceIndex]: nextState,
    }));
    if (inputRef.current) inputRef.current.focus();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  const currentSentence = sentences[currentSentenceIndex];
  const targetWords = currentSentence
    ? currentSentence.englishText.trim().split(/\s+/)
    : [];
  const userTypedWords = userInput.trim().split(/\s+/);

  const isCurrentAllShown = showAllWordsMap[currentSentenceIndex];
  const currentRevealed = revealedWordsMap[currentSentenceIndex] || {};

  return (
    <div className={styles.container}>
      {/* LEFT MAIN SECTION */}
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
              <span className={styles.previewBadge}>
                <FontAwesomeIcon icon={faEye} /> Xem trước
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

        {/* Player Bar */}
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
                if (inputRef.current) inputRef.current.focus();
              }}
            />

            <PlaybackSpeedPopup
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              showSpeedPopup={showSpeedPopup}
              setShowSpeedPopup={setShowSpeedPopup}
              onSpeedChange={() => {
                if (inputRef.current) inputRef.current.focus();
              }}
            />
          </div>
        </div>

        {/* Input Box */}
        <div className={styles.inputBoxCard}>
          <div className={styles.inputLabelHeader}>
            GÕ NHỮNG GÌ BẠN NGHE ĐƯỢC:
          </div>

          <textarea
            ref={inputRef}
            className={styles.textareaField}
            placeholder="Gõ câu trả lời của bạn ở đây..."
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              setShowResult(false);
            }}
            rows={3}
          />

          <button
            className={styles.micButtonAbsolute}
            title="Nhập bằng giọng nói (đang phát triển)"
            onClick={() =>
              toast.info("🎤 Tính năng nhập bằng giọng nói đang phát triển!")
            }
          >
            <FontAwesomeIcon icon={faMicrophone} />
          </button>
        </div>

        {/* Word Boxes */}
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
                isTypedCorrectly;

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
                      isTypedCorrectly ? styles.wordCorrect : styles.wordNormal
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

        {/* Result Banner */}
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
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            className={styles.checkButton}
            onClick={handleCheckResult}
            disabled={!currentSentence || !userInput.trim()}
          >
            KIỂM TRA KẾT QUẢ
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
      </div>

      {/* RIGHT SIDEBAR - Transcript */}
      <div className={styles.rightSidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>
            <FontAwesomeIcon icon={faHeadphones} /> BẢN CHÉP
          </span>
          <span className={styles.sentenceCount}>
            {sentences.length} câu
          </span>
        </div>

        <div className={styles.transcriptList}>
          {sentences.map((item, index) => {
            const isActive = index === currentSentenceIndex;

            return (
              <div
                key={item.id}
                className={`${styles.sentenceCard} ${
                  isActive ? styles.sentenceActive : ""
                }`}
                onClick={() => {
                  setCurrentSentenceIndex(index);
                  setUserInput("");
                  setShowResult(false);
                  window.speechSynthesis.cancel();
                  setIsPlaying(false);
                  setSpeakingId(null);
                  if (inputRef.current) inputRef.current.focus();
                }}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.sentenceHeader}>
                  <span className={styles.sentenceOrder}>{index + 1}</span>
                </div>

                <div className={styles.sentenceContent}>
                  <div className={styles.englishText}>
                    {item.englishText.length > 60
                      ? item.englishText.slice(0, 60) + "..."
                      : item.englishText}
                  </div>
                  {item.vietnameseMeaning && (
                    <div className={styles.vietnameseText}>
                      {item.vietnameseMeaning.length > 60
                        ? item.vietnameseMeaning.slice(0, 60) + "..."
                        : item.vietnameseMeaning}
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

export default ListeningPreview;