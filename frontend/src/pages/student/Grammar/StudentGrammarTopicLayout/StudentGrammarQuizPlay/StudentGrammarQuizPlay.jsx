import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faArrowLeft,
  faArrowRight,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../../services/grammarService";
import styles from "./StudentGrammarQuizPlay.module.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

function StudentGrammarQuizPlay() {
  const navigate = useNavigate();
  const { topicId, quizId } = useParams();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [localAnswers, setLocalAnswers] = useState({});

  const initRef = useRef(false);

  useEffect(() => {
    if (!quizId) return;
    if (initRef.current) return;
    initRef.current = true;
    initQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const initQuiz = async () => {
    try {
      setLoading(true);
      const res = await grammarService.startOrResumeQuizAttempt(quizId);
      const data = res?.data?.data;

      if (data?.status === "COMPLETED") {
        navigate(
          `/dashboard/student/grammar/topics/${topicId}/quiz/${quizId}/result`,
          { replace: true },
        );
        return;
      }

      setAttempt(data);
      setLocalAnswers(data?.answers || {});
      setCurrentIdx(0);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Không thể tải đề.");
      navigate(`/dashboard/student/grammar/topics/${topicId}/quiz`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lưu đáp án chạy NGẦM — không hiện loading gì cả
  const handleSelect = async (questionId, label) => {
    if (attempt?.status !== "IN_PROGRESS") return;

    // Cập nhật UI ngay
    setLocalAnswers((prev) => ({ ...prev, [questionId]: label }));

    // Gọi API lưu ngầm (fire and forget, không setSaving, không hiện spinner)
    if (!attempt?.id) return;
    try {
      await grammarService.saveQuizAnswer(attempt.id, questionId, label);
    } catch (e) {
      console.error("Lỗi lưu đáp án:", e);
      toast.error("Không thể lưu đáp án. Vui lòng thử lại.");
    }
  };

  const goToQuestion = (newIdx) => {
    setCurrentIdx(newIdx);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handlePrev = () => {
    if (currentIdx > 0) goToQuestion(currentIdx - 1);
  };

  const handleNext = () => {
    const questions = attempt?.quiz?.questions || [];
    if (currentIdx < questions.length - 1) goToQuestion(currentIdx + 1);
  };

  const handleSubmit = async () => {
    const questions = attempt?.quiz?.questions || [];
    const answeredCount = questions.filter((q) => localAnswers[q.id]).length;

    if (answeredCount < questions.length) {
      if (
        !window.confirm(
          `Bạn còn ${questions.length - answeredCount} câu chưa trả lời. Vẫn nộp bài?`,
        )
      )
        return;
    } else {
      if (!window.confirm("Nộp bài?")) return;
    }

    try {
      setSubmitting(true);
      await grammarService.submitQuizAttempt(attempt.id);
      toast.success("Nộp bài thành công!");

      navigate(
        `/dashboard/student/grammar/topics/${topicId}/quiz/${quizId}/result`,
        { replace: true },
      );
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể nộp bài.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/dashboard/student/grammar/topics/${topicId}/quiz`);
  };

  if (loading || !attempt) {
    return (
      <div className={styles.loadingBox}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
      </div>
    );
  }

  const questions = attempt.quiz?.questions || [];
  const q = questions[currentIdx];
  const selected = localAnswers[q?.id];

  return (
    <>
      <div className={styles.playHeader}>
        <button className={styles.exitBtn} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Thoát</span>
        </button>
        <div className={styles.playTitle}>
          <h2>{attempt.quiz?.title}</h2>
        </div>

        {/* ✅ Chỉ hiện "Câu X/Y", không spinner, không "Đang lưu..." */}
        <div className={styles.playProgressText}>
          <span>
            Câu {currentIdx + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className={styles.questionCard}>
        <p className={styles.questionText}>{q?.question}</p>

        <div className={styles.optionList}>
          {q?.options?.map((opt, i) => {
            const label = OPTION_LABELS[i];
            const isSelected = selected === label;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.optionItem} ${
                  isSelected ? styles.optionItemSelected : ""
                }`}
                onClick={() => handleSelect(q.id, label)}
              >
                <span className={styles.optionLabel}>{label}.</span>
                <span className={styles.optionText}>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.navRow}>
        <button
          className={styles.navBtn}
          onClick={handlePrev}
          disabled={currentIdx === 0}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Câu trước</span>
        </button>

        {currentIdx < questions.length - 1 ? (
          <button className={styles.navBtnPrimary} onClick={handleNext}>
            <span>Câu tiếp</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        ) : (
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faClipboardCheck} />
            )}
            <span>Nộp bài</span>
          </button>
        )}
      </div>
    </>
  );
}

export default StudentGrammarQuizPlay;
