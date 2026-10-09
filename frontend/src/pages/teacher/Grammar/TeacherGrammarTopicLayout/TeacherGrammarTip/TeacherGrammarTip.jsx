import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSpinner,
  faSave,
  faTrash,
  faXmark,
  faLock,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../../services/grammarService";
import Loading from "../../../../../components/common/Loading/Loading";
import styles from "./TeacherGrammarTip.module.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

// =====================================================
// INLINE TIP EDITOR
// =====================================================
function InlineTip({
  tip,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onDelete,
  onChange,
  onRemovePending,
  isNew,
  onCancelNew,
  topicId,
  defaultOrder,
  readOnly,
}) {
  const [form, setForm] = useState({
    title: tip?.title || "",
    content: tip?.content || "",
    displayOrder: tip?.displayOrder ?? defaultOrder ?? 0,
  });

  const [applySteps, setApplySteps] = useState(
    tip?.applySteps?.length ? tip.applySteps : [""],
  );
  const [question, setQuestion] = useState(tip?.question || "");
  const [options, setOptions] = useState(
    tip?.options?.length === 4 ? tip.options : ["", "", "", ""],
  );
  const [correctAnswer, setCorrectAnswer] = useState(tip?.correctAnswer || "A");
  const [explanation, setExplanation] = useState(tip?.explanation || "");

  const [isDirty, setIsDirty] = useState(false);

  const updateForm = (updater) => {
    setForm(updater);
    setIsDirty(true);
  };

  const isFormEmpty = () => {
    return (
      form.title.trim().length === 0 &&
      form.content.trim().length === 0 &&
      applySteps.every((s) => s.trim().length === 0) &&
      question.trim().length === 0 &&
      options.every((o) => o.trim().length === 0) &&
      explanation.trim().length === 0
    );
  };

  useEffect(() => {
    if (!isEditing) return;

    if (isFormEmpty()) {
      if (onRemovePending) onRemovePending(tip?.id || "new");
      return;
    }

    if (!isDirty) return;

    const payload = {
      id: tip?.id || null,
      topicId: Number(topicId),
      title: form.title.trim(),
      content: form.content.trim(),
      applySteps: applySteps.map((s) => s.trim()).filter(Boolean),
      question: question.trim(),
      options: options.map((o) => o.trim()),
      correctAnswer,
      explanation: explanation.trim(),
      displayOrder: form.displayOrder || 0,
      isNew: !!isNew,
    };
    onChange(payload);
  }, [
    form,
    applySteps,
    question,
    options,
    correctAnswer,
    explanation,
    isDirty,
  ]);

  const addStep = () => {
    setApplySteps([...applySteps, ""]);
    setIsDirty(true);
  };
  const removeStep = (i) => {
    setApplySteps(applySteps.filter((_, idx) => idx !== i));
    setIsDirty(true);
  };
  const updateStep = (i, v) => {
    const copy = [...applySteps];
    copy[i] = v;
    setApplySteps(copy);
    setIsDirty(true);
  };

  const updateOption = (i, v) => {
    const copy = [...options];
    copy[i] = v;
    setOptions(copy);
    setIsDirty(true);
  };

  // ===== VIEW MODE =====
  if (!isEditing) {
    return (
      <div
        className={`${styles.tipCard} ${readOnly ? styles.tipCardReadOnly : ""}`}
        onClick={() => !readOnly && onStartEdit(tip)}
        title={readOnly ? "" : "Click để sửa"}
      >
        <div className={styles.tipHeader}>
          <div className={styles.tipIcon}>
            <FontAwesomeIcon icon={faLightbulb} />
          </div>
          <h3 className={styles.tipTitle}>{tip.title}</h3>

          {!readOnly && (
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(tip);
              }}
              title="Xóa"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>

        {tip.content && <p className={styles.tipContent}>{tip.content}</p>}

        {tip.applySteps?.length > 0 && (
          <div className={styles.applyBox}>
            <span className={styles.boxLabel}>CÁCH ÁP DỤNG</span>
            <ol className={styles.stepList}>
              {tip.applySteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        {tip.question && (
          <div className={styles.quizBox}>
            <span className={styles.boxLabel}>THỬ ÁP DỤNG NGAY</span>
            <p className={styles.question}>{tip.question}</p>
            <div className={styles.optionsPreview}>
              {tip.options?.map((opt, i) => {
                const label = OPTION_LABELS[i];
                const isCorrect = label === tip.correctAnswer;
                return (
                  <div
                    key={i}
                    className={`${styles.optionPreview} ${
                      isCorrect ? styles.optionCorrect : ""
                    }`}
                  >
                    <span className={styles.optionLabel}>{label}.</span>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>

            {tip.explanation && (
              <div className={styles.explanationBox}>
                <strong>Đáp án đúng: {tip.correctAnswer}</strong>
                <p>{tip.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ===== EDIT MODE =====
  return (
    <div className={`${styles.tipCard} ${styles.tipCardEditing}`}>
      <div className={styles.editHeader}>
        <input
          className={styles.titleInput}
          value={form.title}
          onChange={(e) => updateForm({ ...form, title: e.target.value })}
          placeholder="Tiêu đề mẹo..."
          autoFocus
        />
        <input
          type="number"
          className={styles.orderInput}
          value={form.displayOrder}
          onChange={(e) =>
            updateForm({ ...form, displayOrder: Number(e.target.value) })
          }
          min={0}
          title="Thứ tự"
        />
      </div>

      <textarea
        className={styles.contentInput}
        rows={4}
        value={form.content}
        onChange={(e) => updateForm({ ...form, content: e.target.value })}
        placeholder="Đoạn giải thích mẹo..."
      />

      <div className={styles.section}>
        <span className={styles.boxLabel}>CÁCH ÁP DỤNG</span>
        {applySteps.map((step, i) => (
          <div key={i} className={styles.stepRow}>
            <span className={styles.stepNum}>{i + 1}.</span>
            <input
              className={styles.stepInput}
              value={step}
              onChange={(e) => updateStep(i, e.target.value)}
              placeholder={`Bước ${i + 1}...`}
            />
            <button
              type="button"
              className={styles.rowDeleteBtn}
              onClick={() => removeStep(i)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ))}
        <button type="button" className={styles.addRowBtn} onClick={addStep}>
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm bước</span>
        </button>
      </div>

      <div className={styles.section}>
        <span className={styles.boxLabel}>THỬ ÁP DỤNG NGAY</span>
        <textarea
          className={styles.questionInput}
          rows={2}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Câu hỏi có chỗ trống: The ____ feedback from the client..."
        />

        <div className={styles.optionsGrid}>
          {OPTION_LABELS.map((label, i) => {
            const isCorrect = correctAnswer === label;
            return (
              <div
                key={label}
                className={`${styles.optionRow} ${
                  isCorrect ? styles.optionRowCorrect : ""
                }`}
              >
                <button
                  type="button"
                  className={`${styles.correctBtn} ${
                    isCorrect ? styles.correctBtnActive : ""
                  }`}
                  onClick={() => {
                    setCorrectAnswer(label);
                    setIsDirty(true);
                  }}
                  title="Chọn làm đáp án đúng"
                >
                  {label}
                </button>
                <input
                  className={styles.optionInput}
                  value={options[i]}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Đáp án ${label}`}
                />
              </div>
            );
          })}
        </div>

        <textarea
          className={styles.explanationInput}
          rows={3}
          value={explanation}
          onChange={(e) => {
            setExplanation(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Giải thích đáp án đúng..."
        />
      </div>

      <div className={styles.editFooter}>
        <button
          className={styles.cancelBtn}
          onClick={() => (isNew ? onCancelNew() : onCancelEdit())}
        >
          <FontAwesomeIcon icon={faXmark} />
          <span>Đóng</span>
        </button>
      </div>
    </div>
  );
}

// =====================================================
// MAIN
// =====================================================
function TeacherGrammarTip() {
  const { topicId, topic } = useOutletContext();

  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  const canEdit =
    !topic || topic.status === "DRAFT" || topic.status === "REJECTED";

  useEffect(() => {
    if (topicId) fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getTips(topicId);
      setTips(res?.data?.data || []);
      setPendingChanges({});
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (payload) => {
    const key = payload.id || "new";
    setPendingChanges((prev) => ({ ...prev, [key]: payload }));
  };

  const handleRemovePending = (key) => {
    setPendingChanges((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleDelete = async (tip) => {
    if (!window.confirm(`Xóa mẹo "${tip.title}"?`)) return;
    try {
      await grammarService.deleteTip(tip.id);
      toast.success("Xóa thành công!");
      setPendingChanges((prev) => {
        const copy = { ...prev };
        delete copy[tip.id];
        return copy;
      });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể xóa.");
    }
  };

  const handleSaveAll = async () => {
    const changes = Object.values(pendingChanges);
    if (changes.length === 0) {
      toast.info("Không có thay đổi nào để lưu.");
      return;
    }

    try {
      setSaving(true);
      let successCount = 0;

      for (const payload of changes) {
        const body = {
          topicId: payload.topicId,
          title: payload.title,
          content: payload.content,
          applySteps: payload.applySteps,
          question: payload.question,
          options: payload.options,
          correctAnswer: payload.correctAnswer,
          explanation: payload.explanation,
          displayOrder: payload.displayOrder,
        };

        if (payload.isNew) {
          await grammarService.createTip(body);
        } else {
          await grammarService.updateTip(payload.id, body);
        }
        successCount++;
      }

      toast.success(`Đã lưu ${successCount} thay đổi!`);
      setEditingId(null);
      setIsCreatingNew(false);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể lưu.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    if (!canEdit) {
      toast.warning(
        "Chỉ có thể thêm mẹo khi chủ điểm ở trạng thái NHÁP hoặc TỪ CHỐI.",
      );
      return;
    }
    setEditingId(null);
    setIsCreatingNew(true);
  };

  const hasPending = Object.keys(pendingChanges).length > 0;
  const nextOrder = tips.length + 1;

  // ===== LOADING =====
  if (loading) {
    return <Loading fullScreen={false} text="Đang tải mẹo..." />;
  }

  return (
    <>
      <div className={styles.actionRow}>
        <button
          className={styles.addBtn}
          onClick={handleAddNew}
          disabled={!canEdit}
          title={!canEdit ? "Chủ điểm không ở trạng thái cho phép sửa" : ""}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm mẹo</span>
        </button>
      </div>

      <div className={styles.list}>
        {tips.map((tip) => (
          <InlineTip
            key={tip.id}
            tip={tip}
            isEditing={editingId === tip.id}
            onStartEdit={(t) => {
              if (!canEdit) return;
              setIsCreatingNew(false);
              setEditingId(t.id);
            }}
            onCancelEdit={() => setEditingId(null)}
            onDelete={handleDelete}
            onChange={handleChange}
            onRemovePending={handleRemovePending}
            topicId={topicId}
            readOnly={!canEdit}
          />
        ))}

        {isCreatingNew && (
          <InlineTip
            tip={null}
            isEditing={true}
            isNew={true}
            defaultOrder={nextOrder}
            onCancelNew={() => setIsCreatingNew(false)}
            onChange={handleChange}
            onRemovePending={handleRemovePending}
            topicId={topicId}
          />
        )}

        {tips.length === 0 && !isCreatingNew && (
          <div className={styles.emptyBox}>
            <p>
              {canEdit
                ? 'Chưa có mẹo nào. Bấm "Thêm mẹo" để bắt đầu.'
                : "Chủ điểm này chưa có mẹo nào."}
            </p>
          </div>
        )}
      </div>

      {hasPending && (
        <div className={styles.saveBar}>
          <span className={styles.saveBarText}>
            Bạn có {Object.keys(pendingChanges).length} thay đổi chưa lưu
          </span>
          <button
            className={styles.saveAllBtn}
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            <span>Lưu tất cả</span>
          </button>
        </div>
      )}
    </>
  );
}

export default TeacherGrammarTip;
