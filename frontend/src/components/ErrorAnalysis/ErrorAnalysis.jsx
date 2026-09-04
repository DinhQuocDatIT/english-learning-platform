
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faChevronDown,
  faChevronUp,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ErrorAnalysis.module.css";

function ErrorAnalysis({ errors, showAll = false }) {
  const [expanded, setExpanded] = useState(showAll);

  if (!errors || errors.length === 0) {
    return null;
  }

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case "HIGH":
        return "Nghiêm trọng";
      case "MEDIUM":
        return "Trung bình";
      default:
        return "Nhẹ";
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "HIGH":
        return styles.severityHigh;
      case "MEDIUM":
        return styles.severityMedium;
      default:
        return styles.severityLow;
    }
  };

  const displayErrors = expanded ? errors : errors.slice(0, 2);
  const hiddenCount = errors.length - 2;

  return (
    <section className={styles.errorContainer}>
      {/* Header */}
      <div className={styles.errorHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>

          <div>
            <div className={styles.titleRow}>
              <h3 className={styles.errorTitle}>Phân tích lỗi</h3>

              <span className={styles.errorCount}>
                {errors.length}
              </span>
            </div>

            <p className={styles.errorSubtitle}>
              Một vài điểm bạn có thể cải thiện
            </p>
          </div>
        </div>

        {errors.length > 2 && (
          <button
            type="button"
            className={styles.expandBtn}
            onClick={toggleExpand}
          >
            {expanded ? "Thu gọn" : "Xem tất cả"}

            <FontAwesomeIcon
              icon={expanded ? faChevronUp : faChevronDown}
            />
          </button>
        )}
      </div>

      {/* Error list */}
      <div className={styles.errorList}>
        {displayErrors.map((error, index) => (
          <article key={index} className={styles.errorItem}>
            {/* Error top */}
            <div className={styles.errorTop}>
              <div className={styles.errorMeta}>
                <span
                  className={`${styles.errorTypeBadge} ${
                    styles[error.errorType?.toLowerCase() || "default"]
                  }`}
                >
                  {error.errorType || "LỖI"}
                </span>

                <span
                  className={`${styles.severityBadge} ${getSeverityClass(
                    error.severity
                  )}`}
                >
                  <span className={styles.severityDot} />
                  {getSeverityText(error.severity)}
                </span>
              </div>

              <span className={styles.errorNumber}>
                #{String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Content */}
            <div className={styles.errorContent}>
              {error.userText && (
                <div className={`${styles.textBox} ${styles.wrongBox}`}>
                  <div className={styles.textLabel}>
                    <span className={styles.wrongIcon}>
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                    <span>Bạn viết</span>
                  </div>

                  <p className={styles.wrongText}>
                    “{error.userText}”
                  </p>
                </div>
              )}

              {error.correctText && (
                <div className={`${styles.textBox} ${styles.correctBox}`}>
                  <div className={styles.textLabel}>
                    <span className={styles.correctIcon}>
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span>Nên viết</span>
                  </div>

                  <p className={styles.correctText}>
                    “{error.correctText}”
                  </p>
                </div>
              )}

              {error.explanation && (
                <div className={styles.explanation}>
                  <span className={styles.explanationLabel}>
                    Giải thích
                  </span>

                  <p>{error.explanation}</p>
                </div>
              )}
            </div>
          </article>
        ))}

        {/* Show more */}
        {!expanded && errors.length > 2 && (
          <button
            type="button"
            className={styles.showMoreBtn}
            onClick={toggleExpand}
          >
            <span>Xem thêm {hiddenCount} lỗi</span>

            <FontAwesomeIcon icon={faChevronDown} />
          </button>
        )}
      </div>
    </section>
  );
}

export default ErrorAnalysis;

