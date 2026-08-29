import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faRotateRight,
  faPlay,
  faPause,
  faChevronRight,
  faKeyboard,
  faMicrophone,
  faCheck,
  faTriangleExclamation,
  faArrowLeft,
  faEye,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { speakText } from "../../../../../utils/textToSpeech";
import listeningLessonService from "../../../../../services/listeningLessonService";
import listeningSentenceService from "../../../../../services/listeningSentenceService";
import { useLoading } from "../../../../../contexts/LoadingContext";
import PlaybackSpeedPopup from "../../../../../components/PlaybackSpeedPopup/PlaybackSpeedPopup";
import PlaybackVoicePopup from "../../../../../components/PlaybackVoicePopup/PlaybackVoicePopup";
import {
  STATUS_MAP,
  STATUS_BG_COLOR_MAP,
} from "../../../../../constants/status";
import styles from "./AdminListeningPreview.module.css";

function AdminListeningPreview() {
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

  const [completedSentences, setCompletedSentences] = useState({});
  const [revealedWordsMap, setRevealedWordsMap] = useState({});
  const [showAllWordsMap, setShowAllWordsMap] = useState({});
  const [showTranslationMap, setShowTranslationMap] = useState({});

  const inputRef = useRef(null);

  const getNumericSpeed = (speedStr) =>
    parseFloat(speedStr.replace("x", "")) || 1.0;

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
    navigate(`/dashboard/admin/topics/${topicId}/listening-lessons`);
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
      setShowTranslationMap((prev) => ({
        ...prev,
        [currentSentenceIndex]: true,
      }));
      setCompletedSentences((prev) => ({
        ...prev,
        [currentSentenceIndex]: true,
      }));
    } else {
      toast.info("Chưa chính xác, thử lại nhé!");
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
    setShowTranslationMap((prev) => ({
      ...prev,
      [currentSentenceIndex]: nextState,
    }));
    if (inputRef.current) inputRef.current.focus();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
            gridColumn: "1 / -1",
          }}
        >
          <p>Đang tải bài nghe...</p>
        </div>
      </div>
    );
  }

  const currentSentence = sentences[currentSentenceIndex];
  const targetWords = currentSentence
    ? currentSentence.englishText.trim().split(/\s+/)
    : [];
  const userTypedWords = userInput.trim().split(/\s+/);
  const progressPercent =
    sentences.length > 0
      ? Math.round(
          (Object.keys(completedSentences).length / sentences.length) * 100,
        )
      : 0;

  const isCurrentAllShown = showAllWordsMap[currentSentenceIndex];
  const currentRevealed = revealedWordsMap[currentSentenceIndex] || {};

  const statusColor = STATUS_BG_COLOR_MAP[lesson?.status] || "#64748b";

  return (
    <div className={styles.container}>
      <div className={styles.leftMainSection}>
        <div className={styles.headerTop}>
          <button onClick={handleGoBack} className={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách bài nghe
          </button>
          {/* <div className={styles.headerInfo}>
            <span
              className={styles.statusBadge}
              style={{ backgroundColor: statusColor }}
            >
              {STATUS_MAP[lesson?.status] || lesson?.status}
            </span>
            <span className={styles.headerLocked}>
              <FontAwesomeIcon icon={faLock} />
              Chỉ xem
            </span>
          </div> */}
        </div>

        {/* <div className={styles.lessonInfo}>
          <h2 className={styles.lessonTitle}>{lesson?.title}</h2>
          {lesson?.description && (
            <p className={styles.lessonDescription}>{lesson?.description}</p>
          )}
        </div> */}

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
              className={styles.controlIconBtn}
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
          <div className={styles.micButtonAbsolute}>
            <FontAwesomeIcon icon={faMicrophone} />
          </div>
        </div>

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
                completedSentences[currentSentenceIndex];

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
                    className={styles.wordBoxValue}
                    style={{
                      color: isTypedCorrectly
                        ? "var(--color-primary)"
                        : "var(--color-text)",
                    }}
                  >
                    {isShown ? targetWord : "*".repeat(targetWord.length)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className={styles.hintWarningText}>
          Các từ được tiết lộ sẽ bị tính là lỗi và ảnh hưởng đến điểm số của
          bạn.
        </p>

        <button
          className={styles.showAllBtn}
          onClick={handleShowAllWords}
          disabled={!currentSentence}
        >
          {isCurrentAllShown ? "ẨN TẤT CẢ TỪ" : "HIỆN TẤT CẢ TỪ"}
        </button>

        {showResult && (
          <div
            className={styles.resultBanner}
            style={{
              backgroundColor: isCorrect ? "var(--color-tertiary)" : "#fef2f2",
              borderColor: isCorrect ? "var(--color-primary)" : "#fecaca",
              color: isCorrect ? "var(--color-accent)" : "#dc2626",
            }}
          >
            <span className={styles.resultCheckIcon}>
              <FontAwesomeIcon
                icon={isCorrect ? faCheck : faTriangleExclamation}
              />
            </span>
            <span className={styles.resultText}>
              {isCorrect ? "CHÍNH XÁC!" : "CHƯA CHÍNH XÁC, THỬ LẠI NHÉ!"}
            </span>
          </div>
        )}

        {showTranslationMap[currentSentenceIndex] &&
          currentSentence?.vietnameseMeaning && (
            <div className={styles.translationCard}>
              <div className={styles.translationTag}>BẢN DỊCH</div>
              <p className={styles.translationContent}>
                {currentSentence.vietnameseMeaning}
              </p>
            </div>
          )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className={styles.nextButton}
            style={{ flex: 1 }}
            onClick={handleCheckResult}
            disabled={!currentSentence || !userInput.trim()}
          >
            KIỂM TRA KẾT QUẢ
          </button>

          {currentSentenceIndex < sentences.length - 1 && (
            <button
              className={styles.nextButtonOutline}
              style={{ flex: 1 }}
              onClick={handleNextSentence}
            >
              TIẾP THEO{" "}
              <FontAwesomeIcon
                icon={faChevronRight}
                className={styles.nextArrow}
              />
            </button>
          )}
        </div>
      </div>

      <div className={styles.rightSidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>BẢN CHÉP</span>
          <span className={styles.progressPercentBadge}>
            {progressPercent}%
          </span>
        </div>

        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className={styles.transcriptList}>
          {sentences.map((item, index) => {
            const isActive = index === currentSentenceIndex;
            const isCompleted = completedSentences[index];
            const displaySnippet =
              isCompleted || revealedWordsMap[index] || showAllWordsMap[index]
                ? item.englishText
                : item.englishText.replace(/[a-zA-Z0-9]/g, "*");

            return (
              <div
                key={item.id}
                className={`${styles.transcriptCardItem} ${isActive ? styles.transcriptActive : ""}`}
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
                <div className={styles.transcriptCardHeader}>
                  <span className={styles.itemIndexBadge}>#{index + 1}</span>
                  <div className={styles.itemActionIcons}>
                    {isCompleted && (
                      <span className={styles.checkIconGreen}>
                        <FontAwesomeIcon icon={faCheck} />
                      </span>
                    )}
                  </div>
                </div>
                <p className={styles.transcriptTextSnippet}>{displaySnippet}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminListeningPreview;
