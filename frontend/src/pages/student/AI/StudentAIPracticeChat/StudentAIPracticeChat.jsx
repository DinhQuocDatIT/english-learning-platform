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
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import practiceService from "../../../../services/practiceService";
import { useLoading } from "../../../../contexts/LoadingContext";
import ErrorAnalysis from "../../../../components/ErrorAnalysis/ErrorAnalysis";
import styles from "./StudentAIPracticeChat.module.css";

function StudentAIPracticeChat() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [practice, setPractice] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [turnHistory, setTurnHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchPracticeChat(chatId);
    }
  }, [chatId]);

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

      // ✅ Load lịch sử từ backend nếu có
      if (data?.turnHistory && data.turnHistory.length > 0) {
        setTurnHistory(data.turnHistory);
        setShowHistory(true);
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

      // ✅ Thêm turn vừa trả lời vào lịch sử
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
        answeredAt: new Date().toISOString(),
      };
      setTurnHistory((prev) => [...prev, answeredTurn]);

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
    setShowResult(true);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
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

  if (!practice) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải bài luyện tập...</p>
        </div>
      </div>
    );
  }

  const isCompleted = practice.status === "COMPLETED";
  const progress = (practice.questionCount / practice.questionLimit) * 100;

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Quay lại
        </button>
        <div className={styles.headerCenter}>
          <h1 className={styles.headerTitle}>
            <FontAwesomeIcon icon={faRobot} className={styles.headerIcon} />
            Luyện dịch AI
          </h1>
        </div>
        <div className={styles.headerRight}>
          <span
            className={styles.headerLevel}
            style={{ color: getLevelColor(practice.level) }}
          >
            {practice.level}
          </span>
        </div>
      </div>

      {/* Practice Info */}
      <div className={styles.practiceInfo}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Chủ đề</span>
            <span className={styles.infoValue}>{practice.topic}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Tiến độ</span>
            <span className={styles.infoValue}>
              {practice.questionCount}/{practice.questionLimit}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Đúng</span>
            <span className={styles.infoValue} style={{ color: "#22c55e" }}>
              {practice.correctCount}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Trạng thái</span>
            <span
              className={styles.infoValue}
              style={{ color: isCompleted ? "#22c55e" : "#f59e0b" }}
            >
              <FontAwesomeIcon
                icon={isCompleted ? faCheckCircle : faSpinner}
                className={styles.statusIcon}
                spin={!isCompleted}
              />
              {isCompleted ? "Hoàn thành" : "Đang học"}
            </span>
          </div>
        </div>

        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: isCompleted
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #0ea792, #059669)",
              }}
            />
          </div>
          <span className={styles.progressText}>{Math.round(progress)}%</span>
        </div>

        {practice.vocabularyWords?.length > 0 && (
          <div className={styles.vocabTags}>
            <span className={styles.vocabLabel}>📚 Từ vựng:</span>
            {practice.vocabularyWords.map((word, index) => (
              <span key={index} className={styles.vocabTag}>
                {word}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ✅ History Toggle Button */}
      {turnHistory.length > 0 && (
        <button className={styles.historyToggle} onClick={toggleHistory}>
          <FontAwesomeIcon icon={faHistory} />
          {showHistory ? "Ẩn" : "Xem"} lịch sử các câu trước (
          {turnHistory.length})
          <FontAwesomeIcon icon={showHistory ? faChevronUp : faChevronDown} />
        </button>
      )}

      {/* ✅ History List - Hiển thị đầy đủ lịch sử từ backend */}
      {showHistory && turnHistory.length > 0 && (
        <div className={styles.historyList}>
          {turnHistory.map((turn, index) => (
            <div
              key={index}
              className={`${styles.historyItem} ${
                turn.isCorrect ? styles.historyCorrect : styles.historyIncorrect
              }`}
            >
              <div className={styles.historyItemHeader}>
                <span className={styles.historyItemNumber}>
                  Câu {turn.questionOrder}
                </span>
                <span
                  className={styles.historyItemResult}
                  style={{ color: turn.isCorrect ? "#22c55e" : "#ef4444" }}
                >
                  {turn.isCorrect ? (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} /> Đúng
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTimesCircle} /> Sai
                    </>
                  )}
                </span>
                <span className={styles.historyItemScore}>
                  {turn.score}/100
                </span>
              </div>

              <div className={styles.historyItemQuestion}>
                <span className={styles.historyItemLabel}>🇻🇳</span>
                <span>{turn.vietnameseSentence}</span>
              </div>

              <div className={styles.historyItemAnswer}>
                <span className={styles.historyItemLabel}>✏️</span>
                <span>{turn.studentAnswer}</span>
              </div>

              {/* ✅ Hiển thị chi tiết lỗi bằng ErrorAnalysis */}
              {turn.errors?.length > 0 && (
                <div className={styles.historyErrorWrapper}>
                  <ErrorAnalysis errors={turn.errors} showAll={false} />
                </div>
              )}

              {/* Hiển thị feedback nếu có */}
              {turn.feedback && (
                <div className={styles.historyFeedback}>
                  <span className={styles.historyItemLabel}>💬</span>
                  <span>{turn.feedback}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {isCompleted ? (
          <div className={styles.completedContainer}>
            <div className={styles.completedIcon}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h2>🎉 Chúc mừng bạn đã hoàn thành!</h2>
            <p>
              Bạn đã trả lời đúng {practice.correctCount}/
              {practice.questionLimit} câu.
            </p>
            <button className={styles.viewResultBtn} onClick={handleViewResult}>
              <FontAwesomeIcon icon={faChartBar} />
              Xem kết quả chi tiết
            </button>
          </div>
        ) : (
          <>
            {/* Question */}
            {currentTurn && (
              <div className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionNumber}>
                    Câu {currentTurn.questionOrder}
                  </span>
                  <span className={styles.questionType}>
                    {practice.sentenceType || "QUESTION"}
                  </span>
                </div>
                <div className={styles.questionContent}>
                  <div className={styles.vietnameseFlag}>🇻🇳</div>
                  <p className={styles.vietnameseText}>
                    {currentTurn.vietnameseSentence}
                  </p>
                </div>
              </div>
            )}

            {/* Answer Input */}
            <div className={styles.answerSection}>
              <h4 className={styles.answerLabel}>
                <FontAwesomeIcon icon={faPaperPlane} />
                Câu trả lời của bạn
              </h4>
              <textarea
                className={styles.answerInput}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập câu trả lời tiếng Anh của bạn..."
                rows={4}
                disabled={isSubmitting}
                autoFocus
              />
              <div className={styles.answerActions}>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !answer.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Gửi câu trả lời
                    </>
                  )}
                </button>
                <span className={styles.hintText}>
                  Nhấn Enter để gửi, Shift+Enter để xuống dòng
                </span>
              </div>
            </div>

            {/* ✅ Evaluation Result - Sử dụng ErrorAnalysis */}
            {evaluation && (
              <div className={styles.evaluationCard}>
                <div className={styles.evaluationHeader}>
                  <div className={styles.evaluationStatus}>
                    {evaluation.isCorrect ? (
                      <>
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className={styles.correctIcon}
                        />
                        <span className={styles.correctText}>Đúng</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className={styles.incorrectIcon}
                        />
                        <span className={styles.incorrectText}>Sai</span>
                      </>
                    )}
                  </div>
                  <div className={styles.evaluationScores}>
                    <span className={styles.scoreItem}>
                      <FontAwesomeIcon icon={faStar} />
                      {evaluation.score}/100
                    </span>
                    <span className={styles.scoreItem}>
                      <FontAwesomeIcon icon={faLightbulb} />
                      {evaluation.naturalnessScore}/100
                    </span>
                  </div>
                </div>

                {evaluation.feedback && (
                  <div className={styles.feedbackSection}>
                    <h5>💬 Nhận xét</h5>
                    <p>{evaluation.feedback}</p>
                  </div>
                )}

                {evaluation.betterAnswers?.length > 0 && (
                  <div className={styles.betterAnswersSection}>
                    <h5>💡 Cách diễn đạt hay hơn</h5>
                    {evaluation.betterAnswers.map((item, index) => (
                      <div key={index} className={styles.betterAnswerItem}>
                        <span className={styles.betterAnswerIcon}>✨</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ Sử dụng ErrorAnalysis component */}
                {evaluation.errors?.length > 0 && (
                  <ErrorAnalysis errors={evaluation.errors} showAll={false} />
                )}
              </div>
            )}

            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Result Modal */}
      {showResult && result && (
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
            >
              ✕
            </button>
            <h2>📊 Kết quả luyện tập</h2>

            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>
                  {result.totalQuestions}
                </span>
                <span className={styles.resultStatLabel}>Tổng câu</span>
              </div>
              <div className={styles.resultStat}>
                <span
                  className={styles.resultStatValue}
                  style={{ color: "#22c55e" }}
                >
                  {result.correctAnswers}
                </span>
                <span className={styles.resultStatLabel}>Đúng</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>
                  {result.accuracy}%
                </span>
                <span className={styles.resultStatLabel}>Độ chính xác</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatValue}>
                  {result.averageScore}%
                </span>
                <span className={styles.resultStatLabel}>Điểm TB</span>
              </div>
            </div>

            {result.commonErrors?.length > 0 && (
              <div className={styles.resultErrors}>
                <h4>📝 Lỗi thường gặp</h4>
                {result.commonErrors.map((error, index) => (
                  <div key={index} className={styles.resultErrorItem}>
                    <span>{error.errorType}</span>
                    <span>{error.count} lần</span>
                  </div>
                ))}
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
