import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faRobot,
  faPaperPlane,
  faCheckCircle,
  faTimesCircle,
  faLightbulb,
  faStar,
  faSpinner,
  faChartBar,
  faHistory,
  faChevronDown,
  faChevronUp,
  faClock,
  faTriangleExclamation,
  faBolt,
  faMicrophone,
  faUser,
  faBullseye,
  faTag,
  faStopwatch,
  faLocationDot,
  faSpellCheck,
  faLanguage,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import practiceService from "../../../../services/practiceService";
import { useLoading } from "../../../../contexts/LoadingContext";
import styles from "./StudentAIPracticeChat.module.css";

function StudentAIPracticeChat() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  // State
  const [practice, setPractice] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [turnHistory, setTurnHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [activeTurn, setActiveTurn] = useState(null);
  const [selectedHistoryTurn, setSelectedHistoryTurn] = useState(null);
  const chatEndRef = useRef(null);
  const feedbackRef = useRef(null);

  // Fetch practice chat
  useEffect(() => {
    if (chatId) {
      fetchPracticeChat(chatId);
    }
  }, [chatId]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [evaluation, turnHistory]);

  const fetchPracticeChat = async (id) => {
    try {
      showLoading();
      const response = await practiceService.getPracticeChat(id);
      const data = response?.data?.data;
      console.log("Practice data:", data);

      setPractice(data);
      setCurrentTurn(data?.currentTurn || null);
      setActiveTurn(data?.currentTurn?.questionOrder || 1);

      // Load history from backend
      if (data?.turnHistory && data.turnHistory.length > 0) {
        // Sắp xếp lịch sử theo thứ tự giảm dần (mới nhất lên đầu)
        const sortedHistory = [...data.turnHistory].sort(
          (a, b) => b.questionOrder - a.questionOrder,
        );
        setTurnHistory(sortedHistory);
        setShowHistory(true);
        // Set the latest turn as selected by default (lấy câu mới nhất)
        setSelectedHistoryTurn(sortedHistory[0]);
      }

      if (data?.status === "COMPLETED") {
        fetchResult(id);
      }
    } catch (error) {
      console.error("Lỗi lấy practice chat:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải bài luyện tập.",
      );
    } finally {
      hideLoading();
    }
  };

  const fetchResult = async (id) => {
    try {
      const response = await practiceService.getPracticeResult(id);
      setResult(response?.data?.data);
    } catch (error) {
      console.error("Lỗi lấy kết quả:", error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.warning("Vui lòng nhập câu trả lời.");
      return;
    }

    if (!currentTurn) {
      toast.error("Không có câu hỏi để trả lời.");
      return;
    }

    try {
      setIsSubmitting(true);
      showLoading();

      const response = await practiceService.submitAnswer(chatId, {
        turnId: currentTurn.id,
        studentAnswer: answer.trim(),
      });

      const data = response?.data?.data;

      // Add answered turn to history
      const answeredTurn = {
        id: currentTurn.id,
        questionOrder: currentTurn.questionOrder,
        vietnameseSentence: currentTurn.vietnameseSentence,
        studentAnswer: answer.trim(),
        score: data.score,
        isCorrect: data.isCorrect,
        feedback: data.feedback,
        naturalnessScore: data.naturalnessScore,
        errors: data.errors || [],
        // ✅ Lấy betterAnswers từ response (backend đã trả về)
        betterAnswers:
          data.betterAnswers?.map((item) => item.text || item) || [],
        answeredAt: new Date().toISOString(),
      };

      // Thêm vào đầu mảng (mới nhất lên trên)
      setTurnHistory((prev) => [answeredTurn, ...prev]);
      setSelectedHistoryTurn(answeredTurn);

      setEvaluation(data);
      setAnswer("");

      setPractice((prev) => ({
        ...prev,
        questionCount: data.questionCount,
        correctCount: data.isCorrect
          ? (prev?.correctCount || 0) + 1
          : prev?.correctCount || 0,
        status: data.isCompleted ? "COMPLETED" : prev?.status,
      }));

      if (data.nextQuestion) {
        setCurrentTurn(data.nextQuestion);
        setActiveTurn(data.nextQuestion.questionOrder);
        setEvaluation(null);
      } else {
        setCurrentTurn(null);
      }

      if (data.isCompleted) {
        toast.success("🎉 Chúc mừng! Bạn đã hoàn thành bài luyện tập!");
        fetchResult(chatId);
        setShowResult(true);
      }

      toast.success("Đã nộp câu trả lời!");

      // Scroll to feedback
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } catch (error) {
      console.error("Lỗi nộp câu trả lời:", error);
      toast.error(
        error.response?.data?.message || "Không thể nộp câu trả lời.",
      );
    } finally {
      setIsSubmitting(false);
      hideLoading();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const handleBack = () => {
    navigate("/dashboard/student/ai-practice");
  };

  const handleViewResult = () => {
    if (!result && chatId) {
      fetchResult(chatId);
    }
    setShowResult(true);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleHistoryClick = (turn) => {
    setSelectedHistoryTurn(turn);
    setActiveTurn(turn.questionOrder);
    // Scroll to feedback section
    setTimeout(() => {
      feedbackRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200);
  };

  const getLevelColor = (level) => {
    const colors = {
      A1: "#22c55e",
      A2: "#84cc16",
      B1: "#eab308",
      B2: "#f97316",
      C1: "#ef4444",
      C2: "#8b5cf6",
    };
    return colors[level] || "#64748b";
  };

  // Loading state
  if (!practice) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải bài luyện tập...</p>
        </div>
      </div>
    );
  }

  const isCompleted = practice.status === "COMPLETED";
  const progress = (practice.questionCount / practice.questionLimit) * 100;
  const totalTurns = practice.questionLimit || 10;
  const completedTurns = turnHistory.length;
  const correctTurns = turnHistory.filter((t) => t.isCorrect).length;
  const accuracy =
    completedTurns > 0 ? Math.round((correctTurns / completedTurns) * 100) : 0;

  // Render feedback for a turn
  const renderTurnFeedback = (turn) => {
    if (!turn) return null;

    return (
      <div className={styles.feedbackCard} ref={feedbackRef}>
        <div className={styles.feedbackHeaderTop}>
          <div className={styles.feedbackTitleTag}>
            <FontAwesomeIcon
              icon={faRobot}
              className={styles.feedbackRobotIcon}
            />
            <span>Đánh giá câu {turn.questionOrder}</span>
            {turn.answeredAt && (
              <span className={styles.subTagBadge}>
                {new Date(turn.answeredAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          <span
            className={
              turn.isCorrect ? styles.successBadge : styles.warningBadge
            }
          >
            <FontAwesomeIcon
              icon={turn.isCorrect ? faCheckCircle : faCircleXmark}
            />
            <span>{turn.isCorrect ? "Chính xác" : "Cần cải thiện"}</span>
          </span>
        </div>

        {/* Question & Answer Compare */}
        <div className={styles.questionCompareBox}>
          <div className={styles.targetText}>
            <strong>Đề câu {turn.questionOrder}:</strong> "
            {turn.vietnameseSentence}"
          </div>
          <div
            className={
              turn.isCorrect ? styles.userTextCorrect : styles.userTextWrong
            }
          >
            <strong>Câu của bạn:</strong>{" "}
            {turn.isCorrect ? (
              <span className={styles.myAnswer}>{turn.studentAnswer}</span>
            ) : (
              <span className={styles.lineThrough}>{turn.studentAnswer}</span>
            )}
          </div>
        </div>

        {/* Analysis */}
        <div className={styles.analysisHeaderRow}>
          <h3 className={styles.sectionHeading}>Phân tích chi tiết</h3>
          <div className={styles.scoreBadges}>
            <div className={styles.scoreItem}>
              <span className={styles.scoreVal}>{turn.score}</span>
              <span className={styles.scoreLabel}>Điểm</span>
            </div>
            <div className={styles.scoreItem}>
              <span className={styles.scoreVal}>{turn.naturalnessScore}</span>
              <span className={styles.scoreLabel}>Tự nhiên</span>
            </div>
          </div>
        </div>

        {turn.feedback && (
          <p className={styles.feedbackDesc}>{turn.feedback}</p>
        )}

        {/* Error Display */}
        {turn.errors && turn.errors.length > 0 && (
          <div className={styles.errorBoxesContainer}>
            {turn.errors.map((err, idx) => (
              <div key={idx} className={styles.errorBox}>
                <div className={styles.errorCategory}>
                  {err.errorType || "LỖI"}
                </div>
                <div className={styles.errorWrong}>
                  <span className={styles.errorIconWrong}>✕</span>
                  {err.userText || err.wrong || ""}
                </div>
                <div className={styles.errorRight}>
                  <span className={styles.errorIconRight}>✓</span>
                  {err.correctText || err.right || ""}
                </div>
                {err.explanation && (
                  <p className={styles.errorNote}>{err.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ✅ Suggestions - Better Answers */}
        {turn.betterAnswers && turn.betterAnswers.length > 0 && (
          <div className={styles.betterWaysContainer}>
            <div className={styles.betterWaysLabel}>
              <FontAwesomeIcon icon={faLightbulb} />
              <span>Các cách diễn đạt tốt hơn:</span>
            </div>
            {turn.betterAnswers.map((sug, idx) => (
              <div key={idx} className={styles.suggestionBox}>

                {sug}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        {/* Progress Section */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressTitle}>
              <FontAwesomeIcon icon={faClock} className={styles.inlineIcon} />
              Tiến độ luyện tập
            </span>
            <span className={styles.progressCountText}>
              {isCompleted
                ? `Đã hoàn thành ${totalTurns} câu`
                : `Đang làm: Câu ${currentTurn?.questionOrder || 0} / ${totalTurns} (Đã hoàn thành ${completedTurns} lượt)`}
            </span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: isCompleted
                  ? "linear-gradient(90deg, #0ea792, #059669)"
                  : "linear-gradient(90deg, #0ea792, #059669)",
              }}
            />
          </div>
        </div>

        {/* Feedback Section */}
        {selectedHistoryTurn && renderTurnFeedback(selectedHistoryTurn)}

        {/* Divider - Only show if not completed */}
        {!isCompleted && (
          <div className={styles.dividerDoing}>
            <span className={styles.dividerBadge}>
              <FontAwesomeIcon icon={faBolt} />
              <span>
                ĐANG THỰC HIỆN: CÂU {currentTurn?.questionOrder || 0} /{" "}
                {totalTurns}
              </span>
            </span>
          </div>
        )}

        {/* AI Tutor */}
        {isCompleted ? (
          <div className={styles.completedContainer}>
            <div className={styles.completedIcon}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h2>🎉 Chúc mừng bạn đã hoàn thành!</h2>
            <p>
              Bạn đã trả lời đúng{" "}
              <strong>
                {practice.correctCount || correctTurns}/{totalTurns}
              </strong>{" "}
              câu.
            </p>
            <button className={styles.viewResultBtn} onClick={handleViewResult}>
              <FontAwesomeIcon icon={faChartBar} />
              <span>Xem kết quả chi tiết</span>
            </button>
          </div>
        ) : (
          <div className={styles.aiTutorCardActive}>
            <div className={styles.aiTutorLabel}>
              <FontAwesomeIcon icon={faRobot} className={styles.aiIcon} />
              <span>Gia sư AI</span>
              <span className={styles.subTurnLabel}>
                Câu {currentTurn?.questionOrder || 0} (Lượt{" "}
                {currentTurn?.questionOrder || 0}/{totalTurns})
              </span>
              <span className={styles.waitingBadge}>
                <span className={styles.waitingDot} />
                <span>Đang chờ trả lời</span>
              </span>
            </div>

            <div className={styles.aiPromptBox}>
              <div className={styles.promptTitle}>
                DỊCH CÂU SAU SANG TIẾNG ANH:
              </div>
              <p className={styles.aiMessageText}>
                "{currentTurn?.vietnameseSentence || ""}"
              </p>
              {currentTurn?.hint && (
                <div className={styles.aiHintText}>
                  <FontAwesomeIcon icon={faLanguage} />
                  <span>Gợi ý: {currentTurn.hint}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Answer Input */}
        {!isCompleted && (
          <form onSubmit={handleSubmitAnswer} className={styles.inputSection}>
            <div className={styles.textareaWrapper}>
              <textarea
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập bản dịch tiếng Anh của bạn..."
                maxLength={500}
                disabled={isSubmitting}
                autoFocus
              />
              <span className={styles.charCounter}>{answer.length}/500</span>
            </div>

            <div className={styles.inputFooter}>
              <button type="button" className={styles.micBtn}>
                <FontAwesomeIcon icon={faMicrophone} />
                <span>Nhập bằng giọng nói</span>
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !answer.trim()}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <span>Kiểm tra đáp án / Gửi câu trả lời</span>
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        {/* Profile */}
        <div className={styles.sidebarProfile}>
          <div className={styles.avatarPlaceholder}>
            <FontAwesomeIcon icon={faUser} />
          </div>
          <h3>Tiến độ luyện tập</h3>
          <p className={styles.levelText}>
            Cấp độ {practice.level || "B1"}{" "}
            {practice.level === "B1" ? "Intermediate" : ""}
          </p>
          {turnHistory.length > 0 && (
            <button className={styles.historyLink} onClick={toggleHistory}>
              {showHistory ? "Ẩn lịch sử" : "Xem lịch sử"} ({turnHistory.length}
              )
            </button>
          )}
        </div>

        {/* Session Stats */}
        <div className={styles.sessionBox}>
          <div className={styles.sessionHeader}>PHIÊN HIỆN TẠI</div>
          <div className={styles.sessionStats}>
            <div className={styles.statBox}>
              <span className={styles.statIconSuccess}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </span>
              <span className={styles.statNumber}>{correctTurns}</span>
              <span className={styles.statSub}>Chính xác</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statIconWarning}>
                <FontAwesomeIcon icon={faCircleXmark} />
              </span>
              <span className={styles.statNumber}>
                {completedTurns - correctTurns}
              </span>
              <span className={styles.statSub}>Cần cải thiện</span>
            </div>
          </div>

          <div className={styles.accuracyBarContainer}>
            <span className={styles.accuracyLabelText}>Độ chính xác</span>
            <span className={styles.accuracyPercent}>{accuracy}%</span>
          </div>
          <div className={styles.smallProgressBarBg}>
            <div
              className={styles.smallProgressBarFill}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* History - LỊCH SỬ CÁC LƯỢT (đã sắp xếp ngược) */}
        {showHistory && (
          <div className={styles.historySection} id="history">
            <div className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faHistory} />
              <span>LỊCH SỬ CÁC LƯỢT</span>
            </div>

            {/* Hiển thị câu đang làm (chưa có trong history) - luôn ở trên cùng */}
            {!isCompleted && currentTurn && (
              <div
                className={`${styles.historyItemRow} ${styles.historyItemDoing}`}
              >
                <span className={styles.historyItemName}>
                  <span>Câu {currentTurn.questionOrder}</span>
                  <span className={styles.badgeDoing}>Đang làm</span>
                </span>
                <span className={styles.scoreBlue}>Chờ nộp...</span>
              </div>
            )}

            {/* Hiển thị lịch sử các câu đã làm (mới nhất lên đầu) */}
            {turnHistory.map((turn) => (
              <div
                key={turn.id || turn.questionOrder}
                className={`${styles.historyItemRow} ${
                  selectedHistoryTurn?.questionOrder === turn.questionOrder
                    ? styles.activeHistoryRow
                    : ""
                }`}
                onClick={() => handleHistoryClick(turn)}
              >
                <span className={styles.historyItemName}>
                  <span>Câu {turn.questionOrder}</span>
                  {turn.isCorrect ? (
                    <span className={styles.iconCheck}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </span>
                  ) : (
                    <span className={styles.iconWarning}>
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </span>
                  )}
                </span>
                <span
                  className={
                    turn.isCorrect ? styles.scoreGreen : styles.scoreRed
                  }
                >
                  {turn.score}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Vocabulary */}
        {practice?.vocabularyWords && practice.vocabularyWords.length > 0 && (
          <div className={styles.vocabSection}>
            <div className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faBullseye} />
              <span>TỪ VỰNG MỤC TIÊU</span>
            </div>
            <div className={styles.vocabTags}>
              {practice.vocabularyWords.map((word, idx) => (
                <span key={idx} className={styles.tag}>
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Focus Areas */}
        <div className={styles.focusSection}>
          <div className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBullseye} />
            <span>ĐIỂM CẦN TẬP TRUNG</span>
          </div>
          <div className={styles.focusItem}>
            <FontAwesomeIcon icon={faTag} />
            <span>Articles</span>
          </div>
          <div className={styles.focusItem}>
            <FontAwesomeIcon icon={faStopwatch} />
            <span>Present Perfect</span>
          </div>
          <div className={styles.focusItem}>
            <FontAwesomeIcon icon={faLocationDot} />
            <span>Prepositions</span>
          </div>
          <div className={styles.focusItem}>
            <FontAwesomeIcon icon={faSpellCheck} />
            <span>Spelling</span>
          </div>
        </div>
      </aside>

      {/* Result Modal */}
      {showResult && (result || isCompleted) && (
        <div
          className={styles.resultModal}
          onClick={() => setShowResult(false)}
        >
          <div
            className={styles.resultModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.resultModalClose}
              onClick={() => setShowResult(false)}
              aria-label="Đóng"
            >
              ✕
            </button>
            <h2>Kết quả luyện tập</h2>

            <div className={styles.resultStats}>
              <div className={`${styles.resultStat} ${styles.statTotal}`}>
                <span className={styles.resultStatValue}>
                  {result?.totalQuestions ||
                    result?.questionCount ||
                    practice?.questionLimit ||
                    totalTurns}
                </span>
                <span className={styles.resultStatLabel}>Tổng câu</span>
              </div>
              <div className={`${styles.resultStat} ${styles.statCorrect}`}>
                <span className={styles.resultStatValue}>
                  {result?.correctAnswers ??
                    practice?.correctCount ??
                    correctTurns}
                </span>
                <span className={styles.resultStatLabel}>Đúng</span>
              </div>
              <div className={`${styles.resultStat} ${styles.statAccuracy}`}>
                <span className={styles.resultStatValue}>
                  {result?.accuracy ?? accuracy}%
                </span>
                <span className={styles.resultStatLabel}>Độ chính xác</span>
              </div>
              <div className={`${styles.resultStat} ${styles.statAverage}`}>
                <span className={styles.resultStatValue}>
                  {result?.averageScore != null
                    ? `${result.averageScore}%`
                    : turnHistory.length > 0
                      ? `${Math.round(
                          turnHistory.reduce(
                            (s, t) => s + (Number(t.score) || 0),
                            0,
                          ) / turnHistory.length,
                        )}%`
                      : "0%"}
                </span>
                <span className={styles.resultStatLabel}>Điểm TB</span>
              </div>
            </div>

            {((result?.commonErrors && result.commonErrors.length > 0) ||
              turnHistory.some((t) => t.errors && t.errors.length > 0)) && (
              <div className={styles.resultErrors}>
                <h4>📝 Lỗi thường gặp</h4>
                <div className={styles.resultErrorList}>
                  {(
                    result?.commonErrors ||
                    (() => {
                      const counts = {};
                      turnHistory.forEach((t) => {
                        (t.errors || []).forEach((err) => {
                          const type = err.errorType || "OTHER";
                          counts[type] = (counts[type] || 0) + 1;
                        });
                      });
                      return Object.entries(counts)
                        .map(([errorType, count]) => ({ errorType, count }))
                        .sort((a, b) => b.count - a.count);
                    })()
                  ).map((error, index) => (
                    <div key={index} className={styles.resultErrorItem}>
                      <span className={styles.errorTypeName}>
                        {error.errorType}
                      </span>
                      <span className={styles.errorTypeCount}>
                        {error.count} lần
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className={styles.closeResultBtn}
              onClick={() => setShowResult(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentAIPracticeChat;
