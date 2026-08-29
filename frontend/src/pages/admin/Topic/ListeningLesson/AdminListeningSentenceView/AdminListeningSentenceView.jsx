import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeadphones,
  faLanguage,
  faPlay,
  faSpinner,
  faBook,
  faTag,
  faCrown,
  faLock,
  faEye,
  faList,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import listeningLessonService from "../../../../../services/listeningLessonService";
import listeningSentenceService from "../../../../../services/listeningSentenceService";
import getImageUrl from "../../../../../utils/imageUrl";
import { useLoading } from "../../../../../contexts/LoadingContext";
import { speakText } from "../../../../../utils/textToSpeech";
import {
  STATUS_MAP,
  STATUS_BG_COLOR_MAP,
} from "../../../../../constants/status";
import PlaybackSpeedPopup from "../../../../../components/PlaybackSpeedPopup/PlaybackSpeedPopup";
import PlaybackVoicePopup from "../../../../../components/PlaybackVoicePopup/PlaybackVoicePopup";
import styles from "./AdminListeningSentenceView.module.css";

function AdminListeningSentenceView() {
  const navigate = useNavigate();
  const { topicId, lessonId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [lesson, setLesson] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho câu đang chọn để nghe
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // State cho text-to-speech
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);

  // State cho tốc độ và popup
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [showSpeedPopup, setShowSpeedPopup] = useState(false);
  const [showVoicePopup, setShowVoicePopup] = useState(false);

  // Helper để lấy tốc độ dạng số
  const getNumericSpeed = (speedStr) =>
    parseFloat(speedStr.replace("x", "")) || 1.0;

  // Khởi tạo voices
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

      const lessonData = lessonResponse?.data?.data;
      const sentenceData = sentenceResponse?.data?.data;

      setLesson(lessonData || null);
      setSentences(Array.isArray(sentenceData) ? sentenceData : []);

      if (sentenceData && sentenceData.length > 0) {
        setSelectedSentence(sentenceData[0]);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
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

  // ===== TEXT-TO-SPEECH =====
  const handleSpeak = (text, sentenceId) => {
    if (speakingId === sentenceId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsPlaying(false);
      return;
    }

    if (speakingId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsPlaying(false);
    }

    setIsPlaying(true);

    speakText(text, {
      lang: selectedVoice ? selectedVoice.lang : "en-US",
      voice: selectedVoice,
      rate: getNumericSpeed(playbackSpeed),
      onStart: () => {
        setSpeakingId(sentenceId);
      },
      onEnd: () => {
        setSpeakingId(null);
        setIsPlaying(false);
      },
      onError: () => {
        setSpeakingId(null);
        setIsPlaying(false);
        toast.error("Lỗi khi phát âm. Vui lòng thử lại.");
      },
    });
  };

  // ===== CLICK VÀO CÂU =====
  const handleSelectSentence = (sentence) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsPlaying(false);
    }
    setSelectedSentence(sentence);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_BG_COLOR_MAP[lesson?.status] || "#64748b";

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Quay lại</span>
        </button>

        <div className={styles.headerRight}>
          <button
            className={styles.previewBtn}
            onClick={() =>
              navigate(
                `/dashboard/admin/topics/${topicId}/listening-lessons/${lessonId}/preview`,
              )
            }
          >
            <FontAwesomeIcon icon={faEye} />
            Xem trước
          </button>
        </div>
      </div>

      {/* Two columns layout */}
      <div className={styles.twoColumns}>
        {/* LEFT COLUMN - Lesson Info */}
        <div className={styles.leftColumn}>
          {/* Lesson Card */}
          <div className={styles.lessonCard}>
            {/* Image */}
            <div className={styles.lessonImageWrapper}>
              {getImageUrl(lesson?.lessonImage) ? (
                <img
                  src={getImageUrl(lesson?.lessonImage)}
                  alt={lesson?.title}
                  className={styles.lessonImage}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : (
                <div className={styles.lessonImageFallback}>
                  <FontAwesomeIcon icon={faHeadphones} />
                </div>
              )}
              <div className={styles.lessonImageOverlay}>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: statusColor }}
                >
                  {STATUS_MAP[lesson?.status] || lesson?.status}
                </span>
                {lesson?.isPremium && (
                  <span className={styles.premiumBadge}>
                    <FontAwesomeIcon icon={faCrown} />
                    Pro
                  </span>
                )}
              </div>
            </div>

            {/* Lesson Info compact */}
            <div className={styles.lessonInfoCompact}>
              <h2 className={styles.lessonTitleCompact}>{lesson?.title}</h2>
              {lesson?.description && (
                <p className={styles.lessonDescCompact}>
                  {lesson?.description}
                </p>
              )}
              <div className={styles.lessonMetaCompact}>
                <span>
                  <FontAwesomeIcon icon={faBook} />
                  {lesson?.topicTitle || "N/A"}
                </span>
                <span style={{ color: lesson?.levelColor || "#64748b" }}>
                  <FontAwesomeIcon icon={faTag} />
                  {lesson?.levelName || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Player Section */}
          <div className={styles.playerSection}>
            <div className={styles.playerHeader}>
              <span className={styles.playerTitle}>
                <FontAwesomeIcon icon={faPlay} />
                Nghe
              </span>
              {selectedSentence && (
                <span className={styles.playerOrder}>
                  #{selectedSentence.sentenceOrder}
                </span>
              )}
            </div>

            {selectedSentence ? (
              <div className={styles.playerContent}>
                <div className={styles.playerText}>
                  <p className={styles.playerEnglish}>
                    {selectedSentence.englishText}
                  </p>
                  {selectedSentence.vietnameseMeaning && (
                    <p className={styles.playerVietnamese}>
                      {selectedSentence.vietnameseMeaning}
                    </p>
                  )}
                </div>

                <div className={styles.playerControls}>
                  {/* Play Button */}
                  <button
                    type="button"
                    className={`${styles.playBtn} ${
                      isPlaying && speakingId === selectedSentence.id
                        ? styles.playing
                        : ""
                    }`}
                    onClick={() =>
                      handleSpeak(
                        selectedSentence.englishText,
                        selectedSentence.id,
                      )
                    }
                    disabled={!selectedSentence}
                    title={
                      isPlaying && speakingId === selectedSentence.id
                        ? "Đang phát..."
                        : "Phát"
                    }
                  >
                    {isPlaying && speakingId === selectedSentence.id ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Đang phát...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlay} />
                        Phát
                      </>
                    )}
                  </button>

                  <div className={styles.controlsGroup}>
                    {/* Voice Selector */}
                    <PlaybackVoicePopup
                      voices={voices}
                      selectedVoice={selectedVoice}
                      setSelectedVoice={setSelectedVoice}
                      showVoicePopup={showVoicePopup}
                      setShowVoicePopup={setShowVoicePopup}
                    />
                    {/* Speed Selector */}
                    <PlaybackSpeedPopup
                      playbackSpeed={playbackSpeed}
                      setPlaybackSpeed={setPlaybackSpeed}
                      showSpeedPopup={showSpeedPopup}
                      setShowSpeedPopup={setShowSpeedPopup}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.playerEmpty}>
                <p>Chọn một câu ở bên phải để nghe</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Sentences List */}
        <div className={styles.rightColumn}>
          <div className={styles.sentencesHeader}>
            <div className={styles.sentencesTitle}>
              <FontAwesomeIcon icon={faLanguage} />
              <span>Danh sách câu hỏi</span>
            </div>
            <span className={styles.sentenceCount}>{sentences.length}</span>
          </div>

          {sentences.length === 0 ? (
            <div className={styles.emptySentences}>
              <FontAwesomeIcon icon={faLanguage} className={styles.emptyIcon} />
              <p>Chưa có câu hỏi nào</p>
            </div>
          ) : (
            <div className={styles.sentencesList}>
              {sentences.map((sentence) => (
                <div
                  key={sentence.id}
                  className={`${styles.sentenceItem} ${
                    selectedSentence?.id === sentence.id
                      ? styles.sentenceActive
                      : ""
                  }`}
                  onClick={() => handleSelectSentence(sentence)}
                >
                  <div className={styles.sentenceOrder}>
                    {sentence.sentenceOrder}
                  </div>
                  <div className={styles.sentenceContent}>
                    <div className={styles.englishText}>
                      {sentence.englishText}
                    </div>
                    {sentence.vietnameseMeaning && (
                      <div className={styles.vietnameseText}>
                        {sentence.vietnameseMeaning}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminListeningSentenceView;
