
import React from "react";
import styles from "./ConfirmPackageStatusModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faLockOpen,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

function ConfirmPackageStatusModal({
  isOpen,
  packageName,
  isInactive,
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  const actionText = isInactive ? "bật lại" : "tạm dừng";
  const title = isInactive
    ? "Bật lại gói thành viên?"
    : "Tạm dừng gói thành viên?";

  const description = isInactive
    ? `Bạn có chắc chắn muốn bật lại gói "${packageName}" không? Gói sẽ được hoạt động trở lại và có thể được sử dụng.`
    : `Bạn có chắc chắn muốn tạm dừng gói "${packageName}" không? Học viên sẽ không thể đăng ký gói này khi gói bị tạm dừng.`;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className={styles.modal}>
        {/* Close */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          disabled={loading}
          aria-label="Đóng"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {/* Icon */}
        <div
          className={`${styles.iconWrapper} ${
            isInactive ? styles.iconActivate : styles.iconDeactivate
          }`}
        >
          <FontAwesomeIcon
            icon={isInactive ? faLockOpen : faLock}
          />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>

          <p className={styles.description}>
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            type="button"
            className={`${styles.confirmButton} ${
              isInactive
                ? styles.confirmActivate
                : styles.confirmDeactivate
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : `Xác nhận ${actionText}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPackageStatusModal;
