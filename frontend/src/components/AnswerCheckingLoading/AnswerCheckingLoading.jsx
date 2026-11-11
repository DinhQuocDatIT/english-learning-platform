import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faSpellCheck,
  faSpinner,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AnswerCheckingLoading.module.css";

function AnswerCheckingLoading({ studentAnswer }) {
  return (
    <div className={styles.checkingCard}>
      {/* Giữ lại tia sáng quét ngang cho có vibe AI */}
      <div className={styles.scanLine} />

      {/* Header: Avatar & Tiêu đề */}
      <div className={styles.checkingHeader}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarCircle}>
            <FontAwesomeIcon icon={faRobot} />
          </div>
        </div>

        <div className={styles.checkingTitleGroup}>
          <div className={styles.checkingTitleRow}>
            <h4 className={styles.checkingTitle}>
              Gia sư AI đang kiểm tra đáp án
            </h4>
          </div>
          <p className={styles.checkingSubtitle}>
            <span>Hệ thống đang phân tích ngữ pháp và từ vựng...</span>
          </p>
        </div>
      </div>

      {/* Khung câu trả lời của user */}
      {studentAnswer && (
        <div className={styles.studentQuoteBox}>
          <div className={styles.quoteHeader}>
            <span className={styles.quoteLabel}>
              <FontAwesomeIcon icon={faSpellCheck} />
              Câu trả lời của bạn
            </span>
          </div>
          <div className={styles.quoteText}>"{studentAnswer}"</div>
        </div>
      )}

      {/* Footer: Trạng thái Loading đơn giản */}
      <div className={styles.checkingFooter}>
        <span className={styles.checkingNote}>
          <FontAwesomeIcon icon={faBolt} />
          AI đang chấm điểm chi tiết, vui lòng chờ...
        </span>
        <span className={styles.checkingTimer}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />
          Đang xử lý
        </span>
      </div>
    </div>
  );
}

export default AnswerCheckingLoading;
