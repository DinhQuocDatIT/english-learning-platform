import styles from "./DeactivateStudentModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faXmark } from "@fortawesome/free-solid-svg-icons";

function DeactivateStudentModal({
  student,
  isOpen,
  loading,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !student) {
    return null;
  }

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
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faLock} />
        </div>

        <h2 className={styles.title}>Khóa tài khoản học sinh?</h2>

        <p className={styles.description}>
          Bạn có chắc chắn muốn khóa tài khoản của học sinh{" "}
          <strong>{student.fullName}</strong> không?
        </p>

        <p className={styles.warning}>
          Học sinh sẽ không thể đăng nhập vào hệ thống cho đến khi tài khoản
          được mở khóa.
        </p>

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
            className={styles.confirmButton}
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

export default DeactivateStudentModal;
