import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSave,
  faArrowLeft,
  faPlus,
  faTrash,
  faChevronUp,
  faChevronDown,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../../services/grammarService";
import Loading from "../../../../../components/common/Loading/Loading";
import styles from "./TeacherGrammarQuizEditor.module.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

const QUIZ_TAB_URL = (topicId) =>
  `/dashboard/teacher/grammar/topics/${topicId}/quiz`;

const emptyQuestion = (order) => ({
  id: null,
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "A",
  explanation: "",
  optionExplanations: { A: "", B: "", C: "", D: "" },
  displayOrder: order,
});

function TeacherGrammarQuizEditor() {
  const navigate = useNavigate();
  const { topicId, quizId } = useParams();
  const isEdit = !!quizId;

  const [form, setForm] = useState({
    topicId: Number(topicId),
    title: "",
    description: "",
    displayOrder: 0,
    questions: [emptyQuestion(1)],
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getQuiz(quizId);
      const d = res?.data?.data;
      if (d) {
        setForm({
          topicId: Number(topicId),
          title: d.title || "",
          description: d.description || "",
          displayOrder: d.displayOrder || 0,
          questions:
            d.questions?.length > 0
              ? d.questions.map((q) => ({
                  id: q.id,
                  question: q.question,
                  options:
                    q.options?.length === 4 ? q.options : ["", "", "", ""],
                  correctAnswer: q.correctAnswer || "A",
                  explanation: q.explanation || "",
                  optionExplanations: {
                    A: q.optionExplanations?.A || "",
                    B: q.optionExplanations?.B || "",
                    C: q.optionExplanations?.C || "",
                    D: q.optionExplanations?.D || "",
                  },
                  displayOrder: q.displayOrder,
                }))
              : [emptyQuestion(1)],
        });
      }
    } catch (e) {
      toast.error("Không thể tải đề.");
      navigate(QUIZ_TAB_URL(topicId));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuestion = (idx, updater) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[idx] = updater(questions[idx]);
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion(prev.questions.length + 1)],
    }));
  };

  const removeQuestion = (idx) => {
    if (form.questions.length <= 1) {
      toast.warning("Phải có ít nhất 1 câu hỏi.");
      return;
    }
    if (!window.confirm(`Xóa câu hỏi ${idx + 1}?`)) return;
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  const moveQuestion = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= form.questions.length) return;
    setForm((prev) => {
      const questions = [...prev.questions];
      [questions[idx], questions[newIdx]] = [questions[newIdx], questions[idx]];
      return { ...prev, questions };
    });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    updateQuestion(qIdx, (q) => {
      const options = [...q.options];
      options[oIdx] = value;
      return { ...q, options };
    });
  };

  const handleOptionExplanationChange = (qIdx, label, value) => {
    updateQuestion(qIdx, (q) => ({
      ...q,
      optionExplanations: {
        ...q.optionExplanations,
        [label]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.warning("Vui lòng nhập tiêu đề đề.");
      return;
    }

    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.question.trim()) {
        toast.warning(`Câu hỏi ${i + 1} chưa có nội dung.`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        toast.warning(`Câu hỏi ${i + 1} chưa đủ 4 đáp án.`);
        return;
      }
    }

    const payload = {
      topicId: Number(topicId),
      title: form.title.trim(),
      description: form.description.trim(),
      displayOrder: form.displayOrder,
      questions: form.questions.map((q, i) => {
        const cleanedOptExpl = {};
        OPTION_LABELS.forEach((label) => {
          const val = q.optionExplanations?.[label];
          if (val && val.trim()) cleanedOptExpl[label] = val.trim();
        });

        return {
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation?.trim() || null,
          optionExplanations:
            Object.keys(cleanedOptExpl).length > 0 ? cleanedOptExpl : null,
          displayOrder: i + 1,
        };
      }),
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await grammarService.updateQuiz(quizId, payload);
        toast.success("Cập nhật đề thành công!");
      } else {
        await grammarService.createQuiz(payload);
        toast.success("Tạo đề thành công!");
      }
      navigate(QUIZ_TAB_URL(topicId));
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể lưu đề.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Hủy thay đổi?")) {
      navigate(QUIZ_TAB_URL(topicId));
    }
  };

  // ===== LOADING =====
  if (loading) {
    return <Loading fullScreen={false} text="Đang tải đề..." />;
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={handleCancel}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại</span>
      </button>

      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Thông tin đề</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>
                Tiêu đề <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="VD: Đề 1: Từ loại cơ bản"
                maxLength={255}
              />
            </div>
            <div className={styles.field}>
              <label>Thứ tự hiển thị</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  handleChange("displayOrder", Number(e.target.value))
                }
                min={0}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label>Mô tả</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mô tả ngắn về đề..."
              maxLength={500}
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Câu hỏi ({form.questions.length})
            </h2>
            <button
              type="button"
              className={styles.addQuestionBtn}
              onClick={addQuestion}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Thêm câu hỏi</span>
            </button>
          </div>

          {form.questions.map((q, qIdx) => (
            <div key={qIdx} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.qNumber}>Câu {qIdx + 1}</span>

                <div className={styles.qActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => moveQuestion(qIdx, -1)}
                    disabled={qIdx === 0}
                    title="Lên"
                  >
                    <FontAwesomeIcon icon={faChevronUp} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => moveQuestion(qIdx, 1)}
                    disabled={qIdx === form.questions.length - 1}
                    title="Xuống"
                  >
                    <FontAwesomeIcon icon={faChevronDown} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                    onClick={() => removeQuestion(qIdx)}
                    title="Xóa"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              <textarea
                className={styles.questionText}
                rows={2}
                value={q.question}
                onChange={(e) =>
                  updateQuestion(qIdx, (prev) => ({
                    ...prev,
                    question: e.target.value,
                  }))
                }
                placeholder="Nhập câu hỏi (VD: The marketing director gave a brief ______.)"
              />

              <div className={styles.optionsGrid}>
                {q.options.map((opt, oIdx) => {
                  const label = OPTION_LABELS[oIdx];
                  const isCorrect = q.correctAnswer === label;
                  return (
                    <div
                      key={oIdx}
                      className={`${styles.optionRow} ${
                        isCorrect ? styles.optionRowCorrect : ""
                      }`}
                    >
                      <button
                        type="button"
                        className={`${styles.correctBtn} ${
                          isCorrect ? styles.correctBtnActive : ""
                        }`}
                        onClick={() =>
                          updateQuestion(qIdx, (prev) => ({
                            ...prev,
                            correctAnswer: label,
                          }))
                        }
                        title="Đánh dấu đáp án đúng"
                      >
                        {label}
                      </button>
                      <input
                        type="text"
                        className={styles.optionInput}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(qIdx, oIdx, e.target.value)
                        }
                        placeholder={`Đáp án ${label}`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className={styles.explanationBlock}>
                <label className={styles.explanationLabel}>
                  <FontAwesomeIcon icon={faLightbulb} />
                  Giải thích chung
                </label>
                <textarea
                  className={styles.explanationInput}
                  rows={2}
                  value={q.explanation}
                  onChange={(e) =>
                    updateQuestion(qIdx, (prev) => ({
                      ...prev,
                      explanation: e.target.value,
                    }))
                  }
                  placeholder="Giải thích tổng quan cho câu hỏi này..."
                />
              </div>

              <div className={styles.explanationBlock}>
                <label className={styles.explanationLabel}>
                  <FontAwesomeIcon icon={faLightbulb} />
                  Phân tích từng đáp án
                </label>
                <div className={styles.optionExplanationsGrid}>
                  {OPTION_LABELS.map((label) => {
                    const isCorrect = q.correctAnswer === label;
                    return (
                      <div
                        key={label}
                        className={`${styles.optionExplanationRow} ${
                          isCorrect ? styles.optionExplanationRowCorrect : ""
                        }`}
                      >
                        <span
                          className={`${styles.optExpLabel} ${
                            isCorrect ? styles.optExpLabelCorrect : ""
                          }`}
                        >
                          {label}
                        </span>
                        <textarea
                          className={styles.optExpInput}
                          rows={2}
                          value={q.optionExplanations?.[label] || ""}
                          onChange={(e) =>
                            handleOptionExplanationChange(
                              qIdx,
                              label,
                              e.target.value,
                            )
                          }
                          placeholder={`Giải thích đáp án ${label}...`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            <span>{isEdit ? "Cập nhật" : "Lưu"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default TeacherGrammarQuizEditor;
