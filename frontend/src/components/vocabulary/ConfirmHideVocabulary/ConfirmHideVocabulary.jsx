import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEyeSlash,
  faXmark,
  faTriangleExclamation,
  faCircleExclamation,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ConfirmHideVocabulary.module.css";

function ConfirmHideVocabulary({
  isOpen,
  word,
  loading = false,
  mode = "hide",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const isRestore = mode === "restore";

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onCancel}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faCircleExclamation} />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>
            {isRestore ? "Hiện lại từ vựng?" : "Ẩn từ vựng?"}
          </h3>

          <p className={styles.description}>
            Bạn có chắc muốn {isRestore ? "hiện lại" : "ẩn"} từ vựng{" "}
            <strong className={styles.word}>
              "{word?.word || "từ vựng này"}"
            </strong>
            ?
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            type="button"
            className={isRestore ? styles.restoreButton : styles.confirmButton}
            onClick={onConfirm}
            disabled={loading}
          >
            <FontAwesomeIcon icon={isRestore ? faEye : faEyeSlash} />

            {loading
              ? isRestore
                ? "Đang hiện..."
                : "Đang ẩn..."
              : isRestore
                ? "Hiện lại"
                : "Ẩn từ vựng"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmHideVocabulary;
