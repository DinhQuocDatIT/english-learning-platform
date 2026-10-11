import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faVolumeHigh,
  faVolumeXmark,
  faLanguage,
  faLightbulb,
  faCircleQuestion,
  faWandMagicSparkles,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { speakText } from "../../utils/textToSpeech";
import styles from "./ChatMessageItem.module.css";

function ChatMessageItem({
  message,
  onSuggestionClick,
  speechRate = "1x",
  selectedVoice = null,
}) {
  const [showReplyTranslation, setShowReplyTranslation] = useState(false);
  const [showQuestionTranslation, setShowQuestionTranslation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === "USER";
  const hasCorrection = message.correction && message.correction.hasError;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getNumericSpeed = (speedStr) =>
    parseFloat(String(speedStr).replace("x", "")) || 1.0;

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = message.nextQuestion
      ? `${message.content}. ${message.nextQuestion}`
      : message.content;

    setIsSpeaking(true);
    speakText(textToRead, {
      lang: selectedVoice ? selectedVoice.lang : "en-US",
      voice: selectedVoice,
      rate: getNumericSpeed(speechRate),
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // ===== USER MESSAGE =====
  if (isUser) {
    return (
      <div className={styles.userRow}>
        <div className={styles.userContent}>
          <div className={styles.userBubble}>{message.content}</div>
          <span className={styles.userTime}>
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    );
  }

  // ===== AI MESSAGE =====
  return (
    <div className={styles.aiRow}>
      {/* Avatar AI (robot tròn) */}
      <div className={styles.aiAvatar}>
        <FontAwesomeIcon icon={faRobot} />
      </div>

      <div className={styles.aiContent}>
        <div className={styles.bubble}>
          {/* Header bar */}
          <div className={styles.bubbleHeader}>
            <span className={styles.buddyName}>Gia sư AI</span>
            <div className={styles.actionsBar}>
              <button
                className={`${styles.actionBtn} ${
                  isSpeaking ? styles.actionBtnActive : ""
                }`}
                onClick={handleSpeak}
                title={isSpeaking ? "Dừng đọc" : "Nghe"}
              >
                <FontAwesomeIcon
                  icon={isSpeaking ? faVolumeXmark : faVolumeHigh}
                />
                <span>{isSpeaking ? "Dừng" : "Nghe"}</span>
              </button>
              {message.replyTranslation && (
                <button
                  className={`${styles.actionBtn} ${
                    showReplyTranslation ? styles.actionBtnActive : ""
                  }`}
                  onClick={() => setShowReplyTranslation(!showReplyTranslation)}
                  title="Dịch"
                >
                  <FontAwesomeIcon icon={faLanguage} />
                  <span>Dịch</span>
                </button>
              )}
            </div>
          </div>

          {/* Reply text */}
          <div className={styles.replyText}>{message.content}</div>

          {/* Reply translation */}
          {showReplyTranslation && message.replyTranslation && (
            <div className={styles.translationBox}>
              <span className={styles.translationLabel}>
                Bản dịch tiếng Việt:
              </span>
              <p className={styles.translationText}>
                {message.replyTranslation}
              </p>
            </div>
          )}

          {/* Correction box — COLLAPSIBLE */}
          {hasCorrection && (
            <div className={styles.feedbackCard}>
              <div
                className={styles.feedbackHeader}
                onClick={() => setShowFeedback((v) => !v)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowFeedback((v) => !v);
                  }
                }}
              >
                <div className={styles.feedbackIcon}>
                  <FontAwesomeIcon icon={faLightbulb} />
                </div>
                <span className={styles.feedbackTitle}>
                  Góp ý cải thiện câu tiếng Anh
                </span>
                <FontAwesomeIcon
                  icon={showFeedback ? faChevronUp : faChevronDown}
                  className={styles.feedbackToggleIcon}
                />
              </div>

              {showFeedback && (
                <div className={styles.feedbackBody}>
                  {message.correction.userOriginal && (
                    <div className={styles.feedbackBlock}>
                      <span className={styles.feedbackBlockLabel}>
                        Câu của bạn:
                      </span>
                      <p className={styles.feedbackWrong}>
                        "{message.correction.userOriginal}"
                      </p>
                    </div>
                  )}

                  {message.correction.correctedText && (
                    <div className={styles.feedbackBlockGreen}>
                      <div className={styles.feedbackBlockHeader}>
                        <span className={styles.feedbackBlockLabelGreen}>
                          <FontAwesomeIcon icon={faWandMagicSparkles} />
                          <span>Cách diễn đạt tự nhiên hơn:</span>
                        </span>
                        <button
                          className={styles.listenSampleBtn}
                          onClick={() => {
                            speakText(message.correction.correctedText, {
                              lang: selectedVoice
                                ? selectedVoice.lang
                                : "en-US",
                              voice: selectedVoice,
                              rate: getNumericSpeed(speechRate),
                            });
                          }}
                        >
                          <FontAwesomeIcon icon={faVolumeHigh} />
                          <span>Nghe mẫu</span>
                        </button>
                      </div>
                      <p className={styles.feedbackCorrect}>
                        "{message.correction.correctedText}"
                      </p>
                    </div>
                  )}

                  {message.correction.explanation && (
                    <div className={styles.feedbackExplain}>
                      <span className={styles.feedbackExplainLabel}>
                        Giải thích:
                      </span>
                      <span>{message.correction.explanation}</span>
                    </div>
                  )}

                  {message.correction.grammarNotes &&
                    message.correction.grammarNotes.length > 0 && (
                      <div className={styles.grammarNotes}>
                        <span className={styles.grammarLabel}>
                          📌 Điểm ngữ pháp cần ghi nhớ:
                        </span>
                        <ul className={styles.grammarList}>
                          {message.correction.grammarNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Next question */}
          {message.nextQuestion && (
            <div className={styles.followUpBox}>
              <FontAwesomeIcon
                icon={faCircleQuestion}
                className={styles.followUpIcon}
              />
              <div className={styles.followUpContent}>
                <div className={styles.followUpHeader}>
                  <span className={styles.followUpLabel}>
                    Câu hỏi tiếp theo dành cho bạn:
                  </span>
                  {message.nextQuestionTranslation && (
                    <button
                      className={styles.translateBtnSmall}
                      onClick={() =>
                        setShowQuestionTranslation(!showQuestionTranslation)
                      }
                    >
                      <FontAwesomeIcon icon={faLanguage} />
                      <span>
                        {showQuestionTranslation ? "Ẩn dịch" : "Dịch"}
                      </span>
                    </button>
                  )}
                </div>

                <p className={styles.followUpText}>"{message.nextQuestion}"</p>

                {showQuestionTranslation && message.nextQuestionTranslation && (
                  <div className={styles.translationBoxSmall}>
                    "{message.nextQuestionTranslation}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Suggested answers */}
        {message.suggestedAnswers &&
          message.suggestedAnswers.length > 0 &&
          onSuggestionClick && (
            <div className={styles.suggestedBox}>
              <button
                type="button"
                className={`${styles.suggestedToggleBtn} ${
                  showSuggestions ? styles.suggestedToggleBtnOpen : ""
                }`}
                onClick={() => setShowSuggestions((v) => !v)}
              >
                <FontAwesomeIcon icon={faLightbulb} />
                <span>
                  {showSuggestions ? "Ẩn gợi ý trả lời" : "Xem gợi ý trả lời"}
                </span>
              </button>

              {showSuggestions && (
                <div className={styles.suggestedList}>
                  {message.suggestedAnswers.map((answer, idx) => (
                    <button
                      key={idx}
                      className={styles.suggestedChip}
                      onClick={() => onSuggestionClick(answer)}
                    >
                      &ldquo;{answer}&rdquo;
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        <span className={styles.aiTime}>{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}

export default ChatMessageItem;
