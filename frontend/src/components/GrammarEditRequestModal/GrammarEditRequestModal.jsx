import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faTrash,
  faCheck,
  faSpinner,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import styles from "./GrammarEditRequestModal.module.css";

const DEFAULT_REASON_TAGS = [
  "Cần bổ sung ví dụ minh họa",
  "Sửa lỗi chính tả / ngữ pháp",
  "Cập nhật công thức chưa chính xác",
  "Bổ sung thêm dạng bài tập",
  "Điều chỉnh nội dung cho phù hợp cấp độ",
  "Thêm phần giải thích chi tiết",
];

function GrammarEditRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  topicName = "",
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
      toast.warning("Vui lòng thêm ít nhất một lý do.");
      return;
    }
    // Dùng "|" làm delimiter — an toàn hơn dấu phẩy
    const formattedReason = reasons.join("|");
    onSubmit(formattedReason);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <h2>
            <FontAwesomeIcon icon={faPen} className={styles.modalIcon} />
            Yêu cầu chỉnh sửa
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* TOPIC INFO */}
          {topicName && (
            <div className={styles.topicInfo}>
              <span className={styles.topicLabel}>Chủ điểm</span>
              <strong className={styles.topicName}>{topicName}</strong>
            </div>
          )}

          {/* TAGS GỢI Ý */}
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

          {/* THÊM LÝ DO KHÁC */}
          <div className={styles.formGroup}>
            <label>Thêm lý do khác</label>
            <div className={styles.inputAddGroup}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập lý do cần chỉnh sửa..."
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

          {/* DANH SÁCH LÝ DO */}
          <div className={styles.formGroup}>
            <label>
              Lý do chỉnh sửa <span className={styles.required}>*</span>
              <span className={styles.reasonCount}>({reasons.length})</span>
            </label>
            {reasons.length === 0 ? (
              <p className={styles.emptyReasons}>
                Chưa có lý do nào. Vui lòng thêm lý do.
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

          {/* NOTICE — NGẮN GỌN */}
          <div className={styles.noticeBox}>
            <p>Sau khi gửi, admin sẽ xem xét và phản hồi cho bạn.</p>
          </div>

          {/* ACTIONS */}
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
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={isLoading || reasons.length === 0}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Đang gửi...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPen} />
                  Gửi yêu cầu
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrammarEditRequestModal;
