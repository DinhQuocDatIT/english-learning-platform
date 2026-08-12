
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import styles from "./DeactivateTeacherModal.module.css";

function DeactivateTeacherModal({
  teacher,
  isOpen,
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !teacher) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalIcon}>
          <FontAwesomeIcon icon={faLock} />
        </div>

        <h2 className={styles.modalTitle}>
          Khóa tài khoản?
        </h2>

        <p className={styles.modalMessage}>
          Bạn có chắc chắn muốn khóa tài khoản của giáo viên{" "}
          <strong>{teacher.fullName}</strong> không?
        </p>

        <p className={styles.modalWarning}>
          Sau khi khóa, giáo viên sẽ không thể đăng nhập vào hệ thống.
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalCancel}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            type="button"
            className={styles.modalConfirm}
            onClick={onConfirm}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faLock} />

            {loading ? "Đang khóa..." : "Khóa tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeactivateTeacherModal;

