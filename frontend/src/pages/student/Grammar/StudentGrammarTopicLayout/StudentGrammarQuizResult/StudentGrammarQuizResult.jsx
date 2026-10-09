import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheck,
  faXmark,
  faRedo,
  faEye,
  faChevronDown,
  faChevronUp,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../../services/grammarService";
import Loading from "../../../../../components/common/Loading/Loading";
import styles from "./StudentGrammarQuizResult.module.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

function StudentGrammarQuizResult() {
  const navigate = useNavigate();
  const { topicId, quizId } = useParams();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [openExplanation, setOpenExplanation] = useState({});

  const initRef = useRef(false);

  useEffect(() => {
    if (!quizId) return;
    if (initRef.current) return;
    initRef.current = true;
    initResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll("*").forEach((el) => {
      if (el.scrollTop > 0) el.scrollTop = 0;
    });
  }, []);

  const initResult = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getQuizAttempt(quizId);
      const data = res?.data?.data;

      if (!data || data.status !== "COMPLETED") {
        toast.info("Vui lòng hoàn thành bài làm trước.");
        navigate(
          `/dashboard/student/grammar/topics/${topicId}/quiz/${quizId}`,
          { replace: true },
        );
        return;
      }

      setAttempt(data);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải kết quả.");
      navigate(`/dashboard/student/grammar/topics/${topicId}/quiz`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    if (!window.confirm("Bắt đầu làm lại từ đầu?")) return;
    navigate(`/dashboard/student/grammar/topics/${topicId}/quiz/${quizId}`, {
      replace: true,
    });
  };

  const handleBack = () => {
    navigate(`/dashboard/student/grammar/topics/${topicId}/quiz`);
  };

  const toggleExplanation = (qId) => {
    setOpenExplanation((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (loading || !attempt) {
    return <Loading fullScreen={false} text="Đang tải kết quả..." />;
  }

  const questions = attempt.quiz?.questions || [];
  const localAnswers = attempt.answers || {};
  const { correctCount, totalQuestions, score } = attempt;
  const isExcellent = score >= 80;
  const isGood = score >= 60 && score < 80;

  let evalText = "CẦN CỐ GẮNG";
  let evalClass = styles.evalLow;
  if (isExcellent) {
    evalText = "XUẤT SẮC";
    evalClass = styles.evalExcellent;
  } else if (isGood) {
    evalText = "KHÁ TỐT";
    evalClass = styles.evalGood;
  }

  return (
    <>
      {/* RESULT SUMMARY */}
      <div className={styles.resultSummary}>
        <div className={styles.resultLeft}>
          <h2 className={styles.resultHeading}>Hoàn thành bài làm</h2>
          <p className={styles.resultMeta}>
            <strong>{correctCount}</strong>/{totalQuestions} câu đúng
            <span className={styles.resultDot}>·</span>
            <strong>{score}%</strong>
          </p>
        </div>

        <div className={styles.resultRight}>
          <span className={`${styles.evalBadge} ${evalClass}`}>{evalText}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className={styles.resultActions}>
        <button className={styles.restartBtn} onClick={handleRestart}>
          <FontAwesomeIcon icon={faRedo} />
          <span>Làm lại</span>
        </button>

        <button
          className={styles.detailBtn}
          onClick={() => setShowDetail((v) => !v)}
        >
          <FontAwesomeIcon icon={faEye} />
          <span>{showDetail ? "Ẩn chi tiết" : "Xem lại chi tiết"}</span>
          <FontAwesomeIcon icon={showDetail ? faChevronUp : faChevronDown} />
        </button>

        <button className={styles.backBtn} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Về danh sách đề</span>
        </button>
      </div>

      {/* DETAIL LIST */}
      {showDetail && (
        <div className={styles.detailList}>
          {questions.map((q, idx) => {
            const userAns = localAnswers[q.id];
            const isRight = userAns === q.correctAnswer;
            const hasExplanation = !!q.explanation;
            const hasOptionExp =
              q.optionExplanations &&
              Object.keys(q.optionExplanations).length > 0;
            const hasAnyExplanation = hasExplanation || hasOptionExp;

            return (
              <div
                key={q.id}
                className={`${styles.detailItem} ${
                  isRight ? styles.detailItemRight : styles.detailItemWrong
                }`}
              >
                <div className={styles.detailHeader}>
                  <span className={styles.detailNum}>Câu {idx + 1}</span>
                  <span className={styles.detailBadge}>
                    {isRight ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} /> Đúng
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faXmark} /> Sai
                      </>
                    )}
                  </span>
                </div>

                <p className={styles.detailQuestion}>{q.question}</p>

                <div className={styles.detailOptions}>
                  {q.options?.map((opt, i) => {
                    const label = OPTION_LABELS[i];
                    const isCorrect = label === q.correctAnswer;
                    const isUser = label === userAns;
                    let cls = "";
                    if (isCorrect) cls = styles.optCorrect;
                    else if (isUser) cls = styles.optWrong;
                    return (
                      <div key={i} className={`${styles.optRow} ${cls}`}>
                        <span className={styles.optLabel}>{label}.</span>
                        <span className={styles.optText}>{opt}</span>
                        {isCorrect && (
                          <span className={styles.optMark}>
                            <FontAwesomeIcon icon={faCheck} />
                          </span>
                        )}
                        {isUser && !isCorrect && (
                          <span className={styles.optMark}>
                            <FontAwesomeIcon icon={faXmark} />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {hasAnyExplanation && (
                  <div className={styles.toggleRow}>
                    <button
                      type="button"
                      className={styles.toggleLink}
                      onClick={() => toggleExplanation(q.id)}
                    >
                      <FontAwesomeIcon
                        icon={
                          openExplanation[q.id] ? faChevronUp : faChevronDown
                        }
                      />
                      <span>
                        {openExplanation[q.id]
                          ? "Ẩn giải thích"
                          : "Xem giải thích"}
                      </span>
                    </button>
                  </div>
                )}

                {hasAnyExplanation && openExplanation[q.id] && (
                  <div className={styles.explanationWrapper}>
                    {hasExplanation && (
                      <div className={styles.explanationBox}>
                        <span className={styles.explanationLabel}>
                          <FontAwesomeIcon icon={faLightbulb} /> Giải thích
                        </span>
                        <p>{q.explanation}</p>
                      </div>
                    )}

                    {hasOptionExp && (
                      <div className={styles.optionExplanationsBox}>
                        <span className={styles.explanationLabel}>
                          <FontAwesomeIcon icon={faLightbulb} /> Phân tích từng
                          đáp án
                        </span>
                        <div className={styles.optExpList}>
                          {OPTION_LABELS.map((label) => {
                            const text = q.optionExplanations[label];
                            if (!text) return null;
                            const isCorrect = label === q.correctAnswer;
                            return (
                              <div
                                key={label}
                                className={`${styles.optExpItem} ${
                                  isCorrect ? styles.optExpItemCorrect : ""
                                }`}
                              >
                                <span
                                  className={`${styles.optExpLabel} ${
                                    isCorrect ? styles.optExpLabelCorrect : ""
                                  }`}
                                >
                                  {label}
                                </span>
                                <span className={styles.optExpText}>
                                  {text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default StudentGrammarQuizResult;
