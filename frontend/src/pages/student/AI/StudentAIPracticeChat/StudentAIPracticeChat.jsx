import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faPaperPlane,
  faCheckCircle,
  faLightbulb,
  faStar,
  faSpinner,
  faChartBar,
  faHistory,
  faClock,
  faTriangleExclamation,
  faBolt,
  faMicrophone,
  faUser,
  faBullseye,
  faLanguage,
  faCircleXmark,
  faLock,
  faCrown,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import practiceService from "../../../../services/practiceService";
import studentMembershipService from "../../../../services/studentMembershipService";
import { useLoading } from "../../../../contexts/LoadingContext";
import AnswerCheckingLoading from "../../../../components/AnswerCheckingLoading/AnswerCheckingLoading";
import {
  getDisplayName,
  getDescription,
  getExample,
  buildErrorKey,
} from "../../../../constants/errorTypeConstants";
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
  const [submittingAnswer, setSubmittingAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [turnHistory, setTurnHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [activeTurn, setActiveTurn] = useState(null);
  const [selectedHistoryTurn, setSelectedHistoryTurn] = useState(null);
  const [hasMembership, setHasMembership] = useState(false);
  const [aiUsage, setAiUsage] = useState(null);

  // ✅ State cho dropdown mô tả lỗi
  const [expandedErrorKey, setExpandedErrorKey] = useState(null);
  const [expandedResultErrorKey, setExpandedResultErrorKey] = useState(null);

  const chatEndRef = useRef(null);
  const feedbackRef = useRef(null);

  // ✅ Icon chung cho TẤT CẢ lỗi
  const ERROR_ICON = faTriangleExclamation;

  // ✅ LOAD DỮ LIỆU
  useEffect(() => {
    fetchData();
  }, [chatId]);

  const fetchData = async () => {
    try {
      showLoading();

      const [membershipResponse, usageResponse] = await Promise.all([
        studentMembershipService.getCurrentMembership(),
        studentMembershipService.getAIUsage(),
      ]);

      const membershipInfo = membershipResponse?.data?.data;
      const usageInfo = usageResponse?.data?.data;

      setHasMembership(!!membershipInfo);
      setAiUsage(usageInfo);

      if (chatId) {
        await fetchPracticeChat(chatId);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      toast.error("Không thể tải dữ liệu.");
    } finally {
      hideLoading();
    }
  };

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [evaluation, turnHistory]);

  // ✅ Tính điểm yếu từ turnHistory - group theo errorKey
  const calculateWeaknessesFromHistory = () => {
    if (turnHistory.length === 0) return [];

    const errorMap = {};

    turnHistory.forEach((turn) => {
      if (turn.errors && turn.errors.length > 0) {
        turn.errors.forEach((err) => {
          const key = buildErrorKey(err);

          if (!errorMap[key]) {
            errorMap[key] = {
              errorKey: key,
              errorCategory: err.errorCategory || err.errorType,
              errorSubtype: err.errorSubtype,
              count: 0,
            };
          }
          errorMap[key].count += 1;
        });
      }
    });

    return Object.values(errorMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const fetchPracticeChat = async (id) => {
    try {
      const response = await practiceService.getPracticeChat(id);
      const data = response?.data?.data;
      console.log("Practice data:", data);

      setPractice(data);
      setCurrentTurn(data?.currentTurn || null);
      setActiveTurn(data?.currentTurn?.questionOrder || 1);

      if (data?.turnHistory && data.turnHistory.length > 0) {
        const sortedHistory = [...data.turnHistory].sort(
          (a, b) => a.questionOrder - b.questionOrder,
        );
        setTurnHistory(sortedHistory);
        setShowHistory(true);
        setSelectedHistoryTurn(
          sortedHistory[sortedHistory.length - 1] || sortedHistory[0],
        );
      }

      if (data?.status === "COMPLETED") {
        fetchResult(id);
      }
    } catch (error) {
      console.error("Lỗi lấy practice chat:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải bài luyện tập.",
      );
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

  // ✅ SUBMIT ANSWER
  const handleSubmitAnswer = async () => {
    if (!hasMembership) {
      toast.warning(
        "Chức năng Luyện tập AI yêu cầu gói Premium. Vui lòng đăng ký để tiếp tục!",
        { position: "top-center", autoClose: 5000 },
      );
      return;
    }

    if (aiUsage && !aiUsage.canMakeRequest) {
      toast.warning(
        "Bạn đã hết lượt sử dụng AI hôm nay. Vui lòng quay lại vào ngày mai!",
        { position: "top-center", autoClose: 5000 },
      );
      return;
    }

    if (!answer.trim()) {
      toast.warning("Vui lòng nhập câu trả lời.");
      return;
    }

    if (!currentTurn) {
      toast.error("Không có câu hỏi để trả lời.");
      return;
    }

    const currentAnswer = answer.trim();

    try {
      setSubmittingAnswer(currentAnswer);
      setIsSubmitting(true);

      const response = await practiceService.submitAnswer(chatId, {
        turnId: currentTurn.id,
        studentAnswer: currentAnswer,
      });

      const data = response?.data?.data;

      // Cập nhật số lượt còn lại
      try {
        const usageResponse = await studentMembershipService.getAIUsage();
        setAiUsage(usageResponse?.data?.data || null);
      } catch (err) {
        console.error("Lỗi cập nhật lượt AI:", err);
      }

      const answeredTurn = {
        id: currentTurn.id,
        questionOrder: currentTurn.questionOrder,
        vietnameseSentence: currentTurn.vietnameseSentence,
        studentAnswer: currentAnswer,
        score: data.score,
        isCorrect: data.isCorrect,
        feedback: data.feedback,
        naturalnessScore: data.naturalnessScore,
        errors: data.errors || [],
        betterAnswers:
          data.betterAnswers?.map((item) => item.text || item) || [],
        answeredAt: new Date().toISOString(),
      };

      setTurnHistory((prev) => {
        const newHistory = [...prev, answeredTurn].sort(
          (a, b) => a.questionOrder - b.questionOrder,
        );
        return newHistory;
      });
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
      setSubmittingAnswer("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
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

  const handleHistoryClick = (turn, displayIndex) => {
    setSelectedHistoryTurn({ ...turn, displayIndex });
    setActiveTurn(turn.questionOrder);
    setTimeout(() => {
      feedbackRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200);
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

    const displayNumber = turn.displayIndex || turn.questionOrder;

    return (
      <div className={styles.feedbackCard} ref={feedbackRef}>
        <div className={styles.feedbackHeaderTop}>
          <div className={styles.feedbackTitleTag}>
            <FontAwesomeIcon
              icon={faRobot}
              className={styles.feedbackRobotIcon}
            />
            <span>Đánh giá câu {displayNumber}</span>
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

        <div className={styles.questionCompareBox}>
          <div className={styles.targetText}>
            <strong>Đề câu {displayNumber}:</strong> "{turn.vietnameseSentence}"
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

        {turn.errors && turn.errors.length > 0 && (
          <div className={styles.errorBoxesContainer}>
            {turn.errors.map((err, idx) => (
              <div key={idx} className={styles.errorBox}>
                <div className={styles.errorCategory}>
                  {getDisplayName(err) || "LỖI"}
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
      <main className={styles.mainContent}>
        {/* USAGE BANNER */}
        {aiUsage && hasMembership && !isCompleted && (
          <div
            className={`${styles.usageBanner} ${
              aiUsage.remainingRequests <= 3 ? styles.usageBannerWarning : ""
            } ${
              aiUsage.remainingRequests === 0 ? styles.usageBannerDanger : ""
            }`}
          >
            <FontAwesomeIcon icon={faBolt} />
            <span>
              Còn <strong>{aiUsage.remainingRequests}</strong> lượt sử dụng AI
              hôm nay
              {aiUsage.remainingRequests <= 3 &&
                aiUsage.remainingRequests > 0 &&
                " - Sắp hết, hãy tiết kiệm nhé!"}
              {aiUsage.remainingRequests === 0 &&
                " - Đã hết lượt, quay lại vào ngày mai!"}
            </span>
          </div>
        )}

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
                background: "linear-gradient(90deg, #0ea792, #059669)",
              }}
            />
          </div>
        </div>

        {/* Feedback Section */}
        {selectedHistoryTurn && renderTurnFeedback(selectedHistoryTurn)}

        {/* Divider */}
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
              {!hasMembership ? (
                <span className={styles.lockedBadge}>
                  <FontAwesomeIcon icon={faLock} />
                  <span>Cần Premium</span>
                </span>
              ) : aiUsage && !aiUsage.canMakeRequest ? (
                <span className={styles.lockedBadge}>
                  <FontAwesomeIcon icon={faLock} />
                  <span>Hết lượt</span>
                </span>
              ) : isSubmitting ? (
                <span className={styles.evaluatingBadge}>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>AI đang chấm điểm...</span>
                </span>
              ) : (
                <span className={styles.waitingBadge}>
                  <span className={styles.waitingDot} />
                  <span>Đang chờ trả lời</span>
                </span>
              )}
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

        {/* Answer Input or Checking Loading */}
        {!isCompleted &&
          (isSubmitting ? (
            <AnswerCheckingLoading studentAnswer={submittingAnswer || answer} />
          ) : !hasMembership ? (
            <div className={styles.expiredNotice}>
              <div className={styles.expiredIcon}>
                <FontAwesomeIcon icon={faCrown} />
              </div>
              <h3>Gói Premium đã hết hạn</h3>
              <p>
                Bạn vẫn có thể xem lại lịch sử luyện tập. Để tiếp tục gửi câu
                trả lời và nhận phân tích từ AI, vui lòng gia hạn gói Premium.
              </p>
              <button
                className={styles.renewBtn}
                onClick={() =>
                  navigate("/dashboard/student/student-membership")
                }
              >
                <FontAwesomeIcon icon={faCrown} />
                Gia hạn ngay
              </button>
            </div>
          ) : aiUsage && !aiUsage.canMakeRequest ? (
            <div className={styles.expiredNotice}>
              <div className={styles.expiredIcon}>
                <FontAwesomeIcon icon={faBolt} />
              </div>
              <h3>Hết lượt sử dụng AI hôm nay</h3>
              <p>
                Bạn đã sử dụng hết{" "}
                <strong>{aiUsage.remainingRequests + 0}</strong> lượt AI trong
                ngày hôm nay. Vui lòng quay lại vào ngày mai!
              </p>
              <button
                className={styles.renewBtn}
                onClick={() =>
                  navigate("/dashboard/student/student-membership")
                }
              >
                <FontAwesomeIcon icon={faCrown} />
                Nâng cấp gói
              </button>
            </div>
          ) : (
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
                  <span>Kiểm tra đáp án / Gửi câu trả lời</span>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
            </form>
          ))}
        <div ref={chatEndRef} />
      </main>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
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

        {/* History */}
        {showHistory && (
          <div className={styles.historySection} id="history">
            <div className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faHistory} />
              <span>LỊCH SỬ CÁC LƯỢT</span>
            </div>

            {!isCompleted && currentTurn && (
              <div
                className={`${styles.historyItemRow} ${styles.historyItemDoing}`}
              >
                <span className={styles.historyItemName}>
                  <span>Câu {completedTurns + 1}</span>
                  <span className={styles.badgeDoing}>
                    {isSubmitting ? "Đang chấm..." : "Đang làm"}
                  </span>
                </span>
                <span className={styles.scoreBlue}>
                  {isSubmitting ? "Đang xử lý..." : "Chờ nộp..."}
                </span>
              </div>
            )}

            {turnHistory.map((turn, index) => (
              <div
                key={turn.id || turn.questionOrder}
                className={`${styles.historyItemRow} ${
                  selectedHistoryTurn?.questionOrder === turn.questionOrder
                    ? styles.activeHistoryRow
                    : ""
                }`}
                onClick={() => handleHistoryClick(turn, index + 1)}
              >
                <span className={styles.historyItemName}>
                  <span>Câu {index + 1}</span>
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

        {/* ✅ FOCUS AREAS với DROPDOWN */}
        <div className={styles.focusSection}>
          <div className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faBullseye} />
            <span>ĐIỂM CẦN TẬP TRUNG</span>
          </div>
          {(() => {
            const weaknesses = calculateWeaknessesFromHistory();
            if (weaknesses && weaknesses.length > 0) {
              return weaknesses.map((item, idx) => {
                const itemKey = buildErrorKey(item);
                const isExpanded = expandedErrorKey === itemKey;
                const description = getDescription(item);
                const example = getExample(item);

                return (
                  <div key={idx} className={styles.focusItemWrapper}>
                    <div
                      className={`${styles.focusItem} ${
                        isExpanded ? styles.focusItemExpanded : ""
                      }`}
                      onClick={() =>
                        setExpandedErrorKey(isExpanded ? null : itemKey)
                      }
                    >
                      <FontAwesomeIcon
                        icon={ERROR_ICON}
                        className={styles.focusIconCommon}
                      />
                      <span className={styles.focusName}>
                        {getDisplayName(item)}
                      </span>
                      <span className={styles.errorCountBadge}>
                        {item.count} lần
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`${styles.focusChevron} ${
                          isExpanded ? styles.focusChevronRotated : ""
                        }`}
                      />
                    </div>

                    {/* DROPDOWN MÔ TẢ */}
                    {isExpanded && (description || example) && (
                      <div className={styles.focusDropdown}>
                        {description && (
                          <div className={styles.focusDropdownRow}>
                            <span className={styles.focusDropdownLabel}>
                              Giải thích:
                            </span>
                            <span className={styles.focusDropdownText}>
                              {description}
                            </span>
                          </div>
                        )}
                        {example && (
                          <div className={styles.focusDropdownRow}>
                            <span className={styles.focusDropdownLabel}>
                              Ví dụ:
                            </span>
                            <span className={styles.focusDropdownExample}>
                              {example}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            } else {
              return (
                <div className={styles.focusItem}>
                  <FontAwesomeIcon icon={faLightbulb} />
                  <span>Chưa có dữ liệu lỗi</span>
                </div>
              );
            }
          })()}
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
                <h4>Lỗi thường gặp</h4>
                <div className={styles.resultErrorList}>
                  {(() => {
                    // Lấy danh sách errors (ưu tiên result.commonErrors)
                    let errors = [];
                    if (
                      result?.commonErrors &&
                      result.commonErrors.length > 0
                    ) {
                      errors = result.commonErrors;
                    } else {
                      const errorMap = {};
                      turnHistory.forEach((t) => {
                        (t.errors || []).forEach((err) => {
                          const key = buildErrorKey(err);
                          if (!errorMap[key]) {
                            errorMap[key] = {
                              errorKey: key,
                              errorCategory: err.errorCategory || err.errorType,
                              errorSubtype: err.errorSubtype,
                              count: 0,
                            };
                          }
                          errorMap[key].count += 1;
                        });
                      });
                      errors = Object.values(errorMap).sort(
                        (a, b) => b.count - a.count,
                      );
                    }

                    return errors.map((error, index) => {
                      const itemKey = buildErrorKey(error);
                      const isExpanded = expandedResultErrorKey === itemKey;
                      const description = getDescription(error);
                      const example = getExample(error);

                      return (
                        <div key={index} className={styles.resultErrorWrapper}>
                          <div
                            className={`${styles.resultErrorItem} ${
                              isExpanded ? styles.resultErrorItemExpanded : ""
                            }`}
                            onClick={() =>
                              setExpandedResultErrorKey(
                                isExpanded ? null : itemKey,
                              )
                            }
                          >
                            <span className={styles.errorTypeName}>
                              {getDisplayName(error)}
                            </span>
                            <span className={styles.errorTypeCount}>
                              {error.count} lần
                            </span>
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`${styles.resultErrorChevron} ${
                                isExpanded
                                  ? styles.resultErrorChevronRotated
                                  : ""
                              }`}
                            />
                          </div>

                          {/* DROPDOWN */}
                          {isExpanded && (description || example) && (
                            <div className={styles.resultErrorDropdown}>
                              {description && (
                                <div className={styles.resultErrorDropdownRow}>
                                  <span
                                    className={styles.resultErrorDropdownLabel}
                                  >
                                    Giải thích:
                                  </span>
                                  <span
                                    className={styles.resultErrorDropdownText}
                                  >
                                    {description}
                                  </span>
                                </div>
                              )}
                              {example && (
                                <div className={styles.resultErrorDropdownRow}>
                                  <span
                                    className={styles.resultErrorDropdownLabel}
                                  >
                                    Ví dụ:
                                  </span>
                                  <span
                                    className={
                                      styles.resultErrorDropdownExample
                                    }
                                  >
                                    {example}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
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
