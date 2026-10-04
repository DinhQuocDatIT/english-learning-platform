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
import { SECTION_TYPE_OPTIONS } from "../../../../../constants/grammarConstants";
import styles from "./TeacherGrammarTheory.module.css";

// =====================================================
// HELPER: Render TEXT
// =====================================================
function TextView({ content }) {
  if (!content) return null;
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    return <p className={styles.textContent}>{content}</p>;
  }

  return (
    <ul className={styles.viewList}>
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

// =====================================================
// INLINE SECTION
// =====================================================
function InlineSection({
  theory,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onDelete,
  onChange,
  onRemovePending,
  isNew,
  onCancelNew,
  topicId,
  readOnly,
}) {
  const [form, setForm] = useState({
    title: theory?.title || "",
    sectionType: theory?.sectionType || "TEXT",
    content: theory?.content || "",
    displayOrder: theory?.displayOrder || 0,
  });

  const [tableHeaders, setTableHeaders] = useState(
    theory?.metadata?.headers || ["Dạng", "Cấu trúc", "Ví dụ"],
  );
  const [tableRows, setTableRows] = useState(
    theory?.metadata?.rows || [["", "", ""]],
  );
  const [listItems, setListItems] = useState(theory?.metadata?.items || [""]);
  const [noteColor, setNoteColor] = useState(
    theory?.metadata?.color || "yellow",
  );

  const [isDirty, setIsDirty] = useState(false);

  const updateForm = (updater) => {
    setForm(updater);
    setIsDirty(true);
  };

  const isFormEmpty = () => {
    const hasTitle = form.title.trim().length > 0;
    const hasContent = form.content.trim().length > 0;
    const hasTableData = tableRows.some((r) =>
      r.some((c) => c.trim().length > 0),
    );
    const hasListData = listItems.some((i) => i.trim().length > 0);

    return !hasTitle && !hasContent && !hasTableData && !hasListData;
  };

  useEffect(() => {
    if (!isEditing) return;

    if (isFormEmpty()) {
      if (onRemovePending) onRemovePending(theory?.id || "new");
      return;
    }

    if (!isDirty) return;

    let metadata = null;
    if (form.sectionType === "TABLE") {
      metadata = {
        headers: tableHeaders,
        rows: tableRows.filter((r) => r.some((c) => c.trim())),
      };
    } else if (form.sectionType === "LIST") {
      metadata = { items: listItems.filter((i) => i.trim()) };
    } else if (form.sectionType === "NOTE") {
      metadata = { color: noteColor };
    }

    const payload = {
      id: theory?.id || null,
      topicId: Number(topicId),
      title: form.title.trim(),
      sectionType: form.sectionType,
      content:
        form.sectionType === "TEXT" || form.sectionType === "NOTE"
          ? form.content
          : null,
      metadata,
      displayOrder: form.displayOrder || 0,
      isNew: !!isNew,
    };
    onChange(payload);
  }, [form, tableHeaders, tableRows, listItems, noteColor, isDirty]);

  // TABLE handlers
  const addRow = () => {
    setTableRows([...tableRows, ["", "", ""]]);
    setIsDirty(true);
  };
  const removeRow = (i) => {
    setTableRows(tableRows.filter((_, idx) => idx !== i));
    setIsDirty(true);
  };
  const updateCell = (r, c, v) => {
    const copy = [...tableRows];
    copy[r][c] = v;
    setTableRows(copy);
    setIsDirty(true);
  };
  const updateHeader = (c, v) => {
    const copy = [...tableHeaders];
    copy[c] = v;
    setTableHeaders(copy);
    setIsDirty(true);
  };

  // LIST handlers
  const addListItem = () => {
    setListItems([...listItems, ""]);
    setIsDirty(true);
  };
  const removeListItem = (i) => {
    setListItems(listItems.filter((_, idx) => idx !== i));
    setIsDirty(true);
  };
  const updateListItem = (i, v) => {
    const copy = [...listItems];
    copy[i] = v;
    setListItems(copy);
    setIsDirty(true);
  };

  const changeNoteColor = (c) => {
    setNoteColor(c);
    setIsDirty(true);
  };

  // ===== VIEW MODE =====
  if (!isEditing) {
    return (
      <div
        className={`${styles.sectionBlock} ${
          readOnly ? styles.sectionReadOnly : ""
        }`}
        onClick={() => !readOnly && onStartEdit(theory)}
        title={readOnly ? "" : "Click để sửa"}
      >
        <div className={styles.sectionTitleRow}>
          <h3 className={styles.sectionTitle}>{theory.title}</h3>
          {!readOnly && (
            <div className={styles.sectionActions}>
              <button
                className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(theory);
                }}
                title="Xóa"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.sectionContent}>
          {theory.sectionType === "TEXT" && (
            <TextView content={theory.content} />
          )}
          {theory.sectionType === "TABLE" && theory.metadata?.rows && (
            <table className={styles.viewTable}>
              <thead>
                <tr>
                  {(theory.metadata.headers || []).map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {theory.metadata.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {theory.sectionType === "LIST" && theory.metadata?.items && (
            <ul className={styles.viewList}>
              {theory.metadata.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          {theory.sectionType === "NOTE" && (
            <div
              className={`${styles.viewNote} ${
                styles[`note_${theory.metadata?.color || "yellow"}`]
              }`}
            >
              {theory.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== EDIT MODE =====
  return (
    <div className={`${styles.sectionBlock} ${styles.sectionEditing}`}>
      <div className={styles.sectionTitleRow}>
        <input
          className={styles.titleInput}
          type="text"
          value={form.title}
          onChange={(e) => updateForm({ ...form, title: e.target.value })}
          placeholder="Tiêu đề section..."
          autoFocus
        />
        <select
          className={styles.typeSelect}
          value={form.sectionType}
          onChange={(e) => updateForm({ ...form, sectionType: e.target.value })}
        >
          {SECTION_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          className={styles.orderInput}
          type="number"
          value={form.displayOrder}
          onChange={(e) =>
            updateForm({ ...form, displayOrder: Number(e.target.value) })
          }
          min={0}
          title="Thứ tự"
        />
        <div className={styles.sectionActions}>
          <button
            className={styles.iconBtn}
            onClick={() => (isNew ? onCancelNew() : onCancelEdit())}
            title="Đóng"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      </div>

      <div className={styles.sectionContent}>
        {form.sectionType === "TEXT" && (
          <>
            <textarea
              className={styles.contentTextarea}
              rows={6}
              value={form.content}
              onChange={(e) => updateForm({ ...form, content: e.target.value })}
              placeholder="Nhập nội dung..."
            />
            <p className={styles.hintText}>
              Nếu bạn muốn có dấu chấm đầu dòng •, hãy nhập mỗi ý trên{" "}
              <strong>1 dòng riêng biệt</strong> (Enter để xuống dòng).
            </p>
          </>
        )}

        {form.sectionType === "TABLE" && (
          <div className={styles.tableWrapper}>
            <table className={styles.editTable}>
              <thead>
                <tr>
                  {tableHeaders.map((h, i) => (
                    <th key={i}>
                      <input
                        value={h}
                        onChange={(e) => updateHeader(i, e.target.value)}
                        placeholder={`Cột ${i + 1}`}
                      />
                    </th>
                  ))}
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>
                        <input
                          value={cell}
                          onChange={(e) => updateCell(ri, ci, e.target.value)}
                        />
                      </td>
                    ))}
                    <td>
                      <button
                        type="button"
                        className={styles.rowDeleteBtn}
                        onClick={() => removeRow(ri)}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className={styles.addRowBtn} onClick={addRow}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Thêm dòng</span>
            </button>
          </div>
        )}

        {form.sectionType === "LIST" && (
          <div className={styles.listWrapper}>
            {listItems.map((item, i) => (
              <div key={i} className={styles.listRow}>
                <span className={styles.listBullet}>•</span>
                <input
                  value={item}
                  onChange={(e) => updateListItem(i, e.target.value)}
                  placeholder="Nhập nội dung..."
                />
                <button
                  type="button"
                  className={styles.rowDeleteBtn}
                  onClick={() => removeListItem(i)}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addRowBtn}
              onClick={addListItem}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Thêm mục</span>
            </button>
          </div>
        )}

        {form.sectionType === "NOTE" && (
          <>
            <div className={styles.colorOptions}>
              {["yellow", "blue", "green", "red"].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorBtn} ${styles[`color_${c}`]} ${
                    noteColor === c ? styles.colorActive : ""
                  }`}
                  onClick={() => changeNoteColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <textarea
              className={styles.contentTextarea}
              rows={3}
              value={form.content}
              onChange={(e) => updateForm({ ...form, content: e.target.value })}
              placeholder="Nhập ghi chú..."
            />
          </>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN
// =====================================================
function TeacherGrammarTheory() {
  const { topicId, topic } = useOutletContext();

  const [theories, setTheories] = useState([]);
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
      const res = await grammarService.getTheories(topicId);
      setTheories(res?.data?.data || []);
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

  const handleDelete = async (theory) => {
    if (!window.confirm(`Xóa section "${theory.title}"?`)) return;
    try {
      await grammarService.deleteTheory(theory.id);
      toast.success("Xóa thành công!");
      setPendingChanges((prev) => {
        const copy = { ...prev };
        delete copy[theory.id];
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
          await grammarService.createTheory({
            topicId: payload.topicId,
            title: payload.title,
            sectionType: payload.sectionType,
            content: payload.content,
            metadata: payload.metadata,
            displayOrder: payload.displayOrder,
          });
        } else {
          await grammarService.updateTheory(payload.id, {
            topicId: payload.topicId,
            title: payload.title,
            sectionType: payload.sectionType,
            content: payload.content,
            metadata: payload.metadata,
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
        "Chỉ có thể thêm section khi chủ điểm ở trạng thái NHÁP hoặc TỪ CHỐI.",
      );
      return;
    }
    setEditingId(null);
    setIsCreatingNew(true);
  };

  const hasPending = Object.keys(pendingChanges).length > 0;

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

      {/* HEADER ACTION */}
      <div className={styles.actionRow}>
        <button
          className={styles.addBtn}
          onClick={handleAddNew}
          disabled={!canEdit}
          title={!canEdit ? "Chủ điểm không ở trạng thái cho phép sửa" : ""}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm section</span>
        </button>
      </div>

      {/* SECTIONS */}
      {theories.map((th) => (
        <InlineSection
          key={th.id}
          theory={th}
          isEditing={editingId === th.id}
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
        <InlineSection
          theory={null}
          isEditing={true}
          isNew={true}
          onCancelNew={() => setIsCreatingNew(false)}
          onChange={handleChange}
          onRemovePending={handleRemovePending}
          topicId={topicId}
        />
      )}

      {theories.length === 0 && !isCreatingNew && (
        <div className={styles.emptyBox}>
          <p>
            {canEdit
              ? 'Chưa có section nào. Bấm "Thêm section" để bắt đầu.'
              : "Chủ điểm này chưa có section nào."}
          </p>
        </div>
      )}

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

export default TeacherGrammarTheory;
