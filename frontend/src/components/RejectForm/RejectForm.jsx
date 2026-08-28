import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faTrash,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import styles from "./RejectForm.module.css";

const REASON_TAGS = [
  "Nội dung chưa đạt yêu cầu",
  "Sai chính tả / ngữ pháp",
  "Nội dung không phù hợp",
  "Cần bổ sung thêm câu hỏi",
  "Không đúng chủ đề",
  "Độ khó không phù hợp",
];

function RejectForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  reasonTags = REASON_TAGS,
}) {
  const [reasons, setReasons] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setReasons([]);
      setInputValue("");
    }
  }, [isOpen]);

  const handleAddReason = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (reasons.includes(trimmed)) {
      toast.warning("Lý do này đã được thêm.");
      return;
    }
    setReasons([...reasons, trimmed]);
    setInputValue("");
  };

  const handleRemoveReason = (index) => {
    setReasons(reasons.filter((_, i) => i !== index));
  };

  const handleTagClick = (tag) => {
    if (reasons.includes(tag)) {
      setReasons(reasons.filter((r) => r !== tag));
    } else {
      setReasons([...reasons, tag]);
    }
  };

  const handleSubmit = () => {
    if (reasons.length === 0) {
      toast.warning("Vui lòng thêm ít nhất một lý do từ chối.");
      return;
    }
    // Nối các lý do bằng dấu phẩy và xuống dòng
    const formattedReason = reasons.join(", ");
    onSubmit(formattedReason);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            <FontAwesomeIcon icon={faTimes} className={styles.modalIcon} />
            Từ chối bài nghe
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Tags gợi ý */}
          <div className={styles.formGroup}>
            <label>Lý do gợi ý</label>
            <div className={styles.tagContainer}>
              {reasonTags.map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.tagBtn} ${reasons.includes(tag) ? styles.tagActive : ""}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                  {reasons.includes(tag) && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      className={styles.tagCheck}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Input thêm lý do */}
          <div className={styles.formGroup}>
            <label>Thêm lý do khác</label>
            <div className={styles.inputAddGroup}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className={styles.inputAdd}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddReason();
                  }
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleAddReason}
                disabled={isLoading || !inputValue.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
                Thêm
              </button>
            </div>
          </div>

          {/* Danh sách lý do đã chọn */}
          <div className={styles.formGroup}>
            <label>
              Lý do từ chối <span className={styles.required}>*</span>
              <span className={styles.reasonCount}>({reasons.length})</span>
            </label>
            {reasons.length === 0 ? (
              <p className={styles.emptyReasons}>
                Chưa có lý do nào. Vui lòng thêm lý do từ chối.
              </p>
            ) : (
              <div className={styles.reasonList}>
                {reasons.map((reason, index) => (
                  <div key={index} className={styles.reasonItem}>
                    <span className={styles.reasonNumber}>{index + 1}.</span>
                    <span className={styles.reasonText}>{reason}</span>
                    <button
                      type="button"
                      className={styles.removeReasonBtn}
                      onClick={() => handleRemoveReason(index)}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className={styles.submitReject}
              onClick={handleSubmit}
              disabled={isLoading || reasons.length === 0}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Đang xử lý...
                </>
              ) : (
                "Gửi"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RejectForm;
