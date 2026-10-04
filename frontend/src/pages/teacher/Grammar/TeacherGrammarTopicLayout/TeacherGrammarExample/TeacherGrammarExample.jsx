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
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../../services/grammarService";
import styles from "./TeacherGrammarExample.module.css";

// =====================================================
// INLINE EXAMPLE EDITOR
// =====================================================
function InlineExample({
  example,
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
    sentenceEn: example?.sentenceEn || "",
    sentenceVi: example?.sentenceVi || "",
    note: example?.note || "",
    displayOrder: example?.displayOrder ?? defaultOrder ?? 0,
  });

  const [isDirty, setIsDirty] = useState(false);

  const updateForm = (updater) => {
    setForm(updater);
    setIsDirty(true);
  };

  const isFormEmpty = () => {
    return (
      form.sentenceEn.trim().length === 0 &&
      form.sentenceVi.trim().length === 0 &&
      form.note.trim().length === 0
    );
  };

  useEffect(() => {
    if (!isEditing) return;

    if (isFormEmpty()) {
      if (onRemovePending) onRemovePending(example?.id || "new");
      return;
    }

    if (!isDirty) return;

    const payload = {
      id: example?.id || null,
      topicId: Number(topicId),
      sentenceEn: form.sentenceEn.trim(),
      sentenceVi: form.sentenceVi.trim(),
      note: form.note.trim(),
      displayOrder: form.displayOrder || 0,
      isNew: !!isNew,
    };
    onChange(payload);
  }, [form, isDirty]);

  // ===== VIEW MODE =====
  if (!isEditing) {
    return (
      <div
        className={`${styles.item} ${readOnly ? styles.itemReadOnly : ""}`}
        onClick={() => !readOnly && onStartEdit(example)}
        title={readOnly ? "" : "Click để sửa"}
      >
        <span className={styles.order}>{example.displayOrder}</span>

        <div className={styles.itemBody}>
          <p className={styles.sentenceEn}>{example.sentenceEn}</p>
          {example.sentenceVi && (
            <p className={styles.sentenceVi}>— {example.sentenceVi}</p>
          )}
          {example.note && <div className={styles.note}>{example.note}</div>}
        </div>

        {!readOnly && (
          <button
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(example);
            }}
            title="Xóa"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>
    );
  }

  // ===== EDIT MODE =====
  return (
    <div className={`${styles.item} ${styles.itemEditing}`}>
      <span className={styles.order}>{form.displayOrder}</span>

      <div className={styles.itemBody}>
        <input
          className={styles.inputEn}
          value={form.sentenceEn}
          onChange={(e) => updateForm({ ...form, sentenceEn: e.target.value })}
          placeholder="Câu tiếng Anh (VD: The management has approved...)"
          autoFocus
        />

        <input
          className={styles.inputVi}
          value={form.sentenceVi}
          onChange={(e) => updateForm({ ...form, sentenceVi: e.target.value })}
          placeholder="Dịch tiếng Việt (VD: Ban quản lý đã phê duyệt...)"
        />

        <textarea
          className={styles.inputNote}
          rows={2}
          value={form.note}
          onChange={(e) => updateForm({ ...form, note: e.target.value })}
          placeholder="Giải thích ngữ pháp (VD: Danh từ 'proposal' đứng sau...)"
        />

        <div className={styles.editFooter}>
          <label className={styles.orderLabel}>
            Thứ tự
            <input
              type="number"
              className={styles.orderInput}
              value={form.displayOrder}
              onChange={(e) =>
                updateForm({ ...form, displayOrder: Number(e.target.value) })
              }
              min={0}
            />
          </label>

          <button
            className={styles.cancelBtn}
            onClick={() => (isNew ? onCancelNew() : onCancelEdit())}
            title="Đóng"
          >
            <FontAwesomeIcon icon={faXmark} />
            <span>Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN
// =====================================================
function TeacherGrammarExample() {
  const { topicId, topic } = useOutletContext();

  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  // Topic chỉ cho sửa khi DRAFT / REJECTED
  const canEdit =
    !topic || topic.status === "DRAFT" || topic.status === "REJECTED";

  useEffect(() => {
    if (topicId) fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getExamples(topicId);
      setExamples(res?.data?.data || []);
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

  const handleDelete = async (ex) => {
    if (!window.confirm(`Xóa ví dụ "${ex.sentenceEn.slice(0, 50)}..."?`))
      return;
    try {
      await grammarService.deleteExample(ex.id);
      toast.success("Xóa thành công!");
      setPendingChanges((prev) => {
        const copy = { ...prev };
        delete copy[ex.id];
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
        if (payload.isNew) {
          await grammarService.createExample({
            topicId: payload.topicId,
            sentenceEn: payload.sentenceEn,
            sentenceVi: payload.sentenceVi,
            note: payload.note,
            displayOrder: payload.displayOrder,
          });
        } else {
          await grammarService.updateExample(payload.id, {
            topicId: payload.topicId,
            sentenceEn: payload.sentenceEn,
            sentenceVi: payload.sentenceVi,
            note: payload.note,
            displayOrder: payload.displayOrder,
          });
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
        "Chỉ có thể thêm ví dụ khi chủ điểm ở trạng thái NHÁP hoặc TỪ CHỐI.",
      );
      return;
    }
    setEditingId(null);
    setIsCreatingNew(true);
  };

  const hasPending = Object.keys(pendingChanges).length > 0;
  const nextOrder = examples.length + 1;

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
      </div>
    );
  }

  return (
    <>
      {/* WARNING khi không cho sửa */}
      {/* {!canEdit && (
        <div className={styles.readOnlyBanner}>
          <FontAwesomeIcon icon={faLock} />
          <span>
            Chủ điểm đang ở trạng thái <strong>{topic?.status}</strong>. Bạn chỉ
            có thể xem. Muốn chỉnh sửa, hãy gửi yêu cầu hoặc chờ admin xử lý.
          </span>
        </div>
      )} */}

      {/* ACTION ROW */}
      <div className={styles.actionRow}>
        <button
          className={styles.addBtn}
          onClick={handleAddNew}
          disabled={!canEdit}
          title={!canEdit ? "Chủ điểm không ở trạng thái cho phép sửa" : ""}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm ví dụ</span>
        </button>
      </div>

      {/* ✅ LIST — ĐÃ BỌC */}
      <div className={styles.list}>
        {examples.map((ex) => (
          <InlineExample
            key={ex.id}
            example={ex}
            isEditing={editingId === ex.id}
            onStartEdit={(e) => {
              if (!canEdit) return;
              setIsCreatingNew(false);
              setEditingId(e.id);
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
          <InlineExample
            example={null}
            isEditing={true}
            isNew={true}
            defaultOrder={nextOrder}
            onCancelNew={() => setIsCreatingNew(false)}
            onChange={handleChange}
            onRemovePending={handleRemovePending}
            topicId={topicId}
          />
        )}

        {examples.length === 0 && !isCreatingNew && (
          <div className={styles.emptyBox}>
            <p>
              {canEdit
                ? 'Chưa có ví dụ nào. Bấm "Thêm ví dụ" để bắt đầu.'
                : "Chủ điểm này chưa có ví dụ nào."}
            </p>
          </div>
        )}
      </div>

      {/* SAVE BAR */}
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

export default TeacherGrammarExample;
