// src/components/AnswerCheckingLoading.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faSpellCheck,
  faLightbulb,
  faStar,
  faSpinner,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AnswerCheckingLoading.module.css";

// ✅ Các giai đoạn phân tích khi AI kiểm tra đáp án
const CHECKING_STAGES = [
  {
    title: "Phân tích ngữ pháp & thì câu",
    subtitle: "Đang kiểm tra trật tự từ, chia động từ và cấu trúc ngữ pháp...",
    icon: faSpellCheck,
  },
  {
    title: "So khớp từ vựng & ngữ cảnh",
    subtitle: "Đang đánh giá lựa chọn từ ngữ và tính chính xác tương đương...",
    icon: faLightbulb,
  },
  {
    title: "Đo lường độ tự nhiên & văn phong",
    subtitle: "Đang tổng hợp điểm số và đề xuất cách diễn đạt tối ưu...",
    icon: faStar,
  },
];

function AnswerCheckingLoading({ studentAnswer }) {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % CHECKING_STAGES.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const currentStage = CHECKING_STAGES[activeStage];

  return (
    <div className={styles.checkingCard}>
      {/* Tia sáng quét ngang mặt trên */}
      <div className={styles.scanLine} />

      {/* Header với Avatar Robot AI phát sáng */}
      <div className={styles.checkingHeader}>
        <div className={styles.avatarContainer}>
          <div className={styles.pulseRing} />
          <div className={styles.pulseRingOuter} />
          <div className={styles.avatarCircle}>
            <FontAwesomeIcon icon={faRobot} />
          </div>
        </div>

        <div className={styles.checkingTitleGroup}>
          <div className={styles.checkingTitleRow}>
            <h4 className={styles.checkingTitle}>
              Gia sư AI đang kiểm tra đáp án
            </h4>
            <span className={styles.liveTag}>
              <span className={styles.liveTagDot} />
              Đang phân tích
            </span>
          </div>
          <p className={styles.checkingSubtitle}>
            <FontAwesomeIcon
              icon={currentStage.icon}
              className={styles.checkingSubtitleIcon}
            />
            <span>{currentStage.subtitle}</span>
          </p>
        </div>
      </div>

      {/* Trích dẫn câu trả lời vừa nộp */}
      {studentAnswer && (
        <div className={styles.studentQuoteBox}>
          <div className={styles.quoteHeader}>
            <span className={styles.quoteLabel}>
              <FontAwesomeIcon icon={faSpellCheck} />
              Câu trả lời của bạn
            </span>
            <span className={styles.quoteBadge}>Đang thẩm định...</span>
          </div>
          <div className={styles.quoteText}>"{studentAnswer}"</div>
        </div>
      )}

      {/* 3 Thẻ tiến trình phân tích */}
      <div className={styles.analysisSteps}>
        {CHECKING_STAGES.map((stg, idx) => {
          const isActive = idx === activeStage;
          return (
            <div
              key={idx}
              className={`${styles.stepCard} ${
                isActive ? styles.stepCardActive : ""
              }`}
            >
              {isActive ? (
                <span className={styles.stepIndicatorDot} />
              ) : (
                <FontAwesomeIcon icon={stg.icon} className={styles.stepIcon} />
              )}
              <span>{stg.title}</span>
            </div>
          );
        })}
      </div>

      {/* Thanh tiến trình Shimmer màu chủ đạo */}
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarGlow} />
      </div>

      {/* Footer ghi chú & trạng thái */}
      <div className={styles.checkingFooter}>
        <span className={styles.checkingNote}>
          <FontAwesomeIcon icon={faBolt} />
          Hệ thống AI đang chấm điểm chi tiết, vui lòng chờ trong giây lát...
        </span>
        <span className={styles.checkingTimer}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />
          Đang tính điểm
        </span>
      </div>
    </div>
  );
}

export default AnswerCheckingLoading;
