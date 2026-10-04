import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faArrowLeft,
  faFileAlt,
  faCheck,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../../services/grammarService";
import styles from "./AdminGrammarQuizDetail.module.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

function AdminGrammarQuizDetail() {
  const navigate = useNavigate();
  const { topicId, quizId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await grammarService.adminGetQuizDetail(quizId);
      setQuiz(res?.data?.data || null);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải chi tiết đề.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/dashboard/admin/grammar/topics/${topicId}/quiz`);
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={styles.errorBox}>
        <p>Không tải được đề.</p>
        <button onClick={handleBack}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={handleBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại danh sách đề</span>
      </button>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FontAwesomeIcon icon={faFileAlt} />
        </div>
        <div className={styles.headerText}>
          <h1>{quiz.title}</h1>
          {quiz.description && <p>{quiz.description}</p>}
          <div className={styles.headerMeta}>
            <span>{quiz.totalQuestions} câu hỏi</span>
          </div>
        </div>
      </div>

      {/* QUESTIONS */}
      <div className={styles.questions}>
        {quiz.questions?.map((q, qIdx) => (
          <div key={q.id} className={styles.questionCard}>
            {/* QUESTION HEADER */}
            <div className={styles.qHeader}>
              <span className={styles.qNumber}>Câu {qIdx + 1}</span>
            </div>

            {/* QUESTION TEXT */}
            <p className={styles.qText}>{q.question}</p>

            {/* OPTIONS */}
            <div className={styles.options}>
              {q.options?.map((opt, oIdx) => {
                const label = OPTION_LABELS[oIdx];
                const isCorrect = label === q.correctAnswer;
                return (
                  <div
                    key={oIdx}
                    className={`${styles.option} ${
                      isCorrect ? styles.optionCorrect : ""
                    }`}
                  >
                    <span
                      className={`${styles.optionLabel} ${
                        isCorrect ? styles.optionLabelCorrect : ""
                      }`}
                    >
                      {label}
                    </span>
                    <span className={styles.optionText}>{opt}</span>
                    {isCorrect && (
                      <span className={styles.correctMark}>
                        <FontAwesomeIcon icon={faCheck} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* GENERAL EXPLANATION */}
            {q.explanation && (
              <div className={styles.explanationBlock}>
                <div className={styles.explanationLabel}>
                  <FontAwesomeIcon icon={faLightbulb} />
                  Giải thích
                </div>
                <p className={styles.explanationText}>{q.explanation}</p>
              </div>
            )}

            {/* OPTION EXPLANATIONS */}
            {q.optionExplanations &&
              Object.keys(q.optionExplanations).length > 0 && (
                <div className={styles.optionExplanationsBlock}>
                  <div className={styles.explanationLabel}>
                    <FontAwesomeIcon icon={faLightbulb} />
                    Phân tích từng đáp án
                  </div>
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
                          <span className={styles.optExpText}>{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminGrammarQuizDetail;
