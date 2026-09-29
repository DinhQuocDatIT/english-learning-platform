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
import styles from "./GrammarEditRequestRejectForm.module.css";

// Tag gợi ý cho việc từ chối YÊU CẦU CHỈNH SỬA
const DEFAULT_REASON_TAGS = [
  "Nội dung hiện tại đã ổn, chưa cần sửa",
  "Chưa phải thời điểm phù hợp để cập nhật",
  "Cần bổ sung thêm thông tin trước khi sửa",
  "Ưu tiên xử lý việc khác trước",
  "Yêu cầu chưa rõ ràng, cần làm rõ mục đích",
  "Sẽ xem xét lại vào đợt cập nhật sau",
];

function GrammarEditRequestRejectForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  title = "Từ chối yêu cầu chỉnh sửa",
  reasonTags = DEFAULT_REASON_TAGS,
}) {
  const [reasons, setReasons] = useState([]);
  const [inputValue, setInputValue] = useState("");

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
    const formattedReason = reasons.join("|");
    onSubmit(formattedReason);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            <FontAwesomeIcon icon={faTimes} className={styles.modalIcon} />
            {title}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Lý do gợi ý</label>
            <div className={styles.tagContainer}>
              {reasonTags.map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.tagBtn} ${
                    reasons.includes(tag) ? styles.tagActive : ""
                  }`}
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
                "Xác nhận từ chối"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrammarEditRequestRejectForm;
