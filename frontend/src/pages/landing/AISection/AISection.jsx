import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./AISection.module.css";
import {
  faLightbulb,
  faCircleCheck,
} from "@fortawesome/free-regular-svg-icons";
import {
  faRobot,
  faMicrophoneLines,
  faWandMagicSparkles,
  faPaperPlane,
  faMicrophone,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

function AISection() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      {/* Cột trái: Khung Chat giả lập */}
      <div className={styles.chatMockup}>
        <div className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerAvatar}>
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div className={styles.headerText}>
              <div className={styles.headerTitleRow}>
                <h2 className={styles.headerTitle}>Gia sư AI</h2>
                <span className={styles.liveBadge}>Live Coach</span>
              </div>
              <p className={styles.headerSubtitle}>Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className={styles.chatBody}>
          <div className={styles.msgBot}>How was your weekend?</div>
          <div className={styles.msgUser}>
            I go to the park and saw some dogs.
          </div>

          <div className={styles.typingIndicator}>
            <div className={styles.typingAvatar}>
              <FontAwesomeIcon icon={faRobot} />
            </div>
            <div className={styles.typingBubble}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div className={styles.feedbackBox}>
            <p className={styles.feedbackTitle}>
              <FontAwesomeIcon icon={faLightbulb} /> PHẢN HỒI THÔNG MINH
            </p>
            <p className={styles.feedbackText}>
              Nghe có vẻ thú vị! Một mẹo nhỏ: vì bạn đang nói về quá khứ, hãy
              thử nói{" "}
              <span className={styles.highlightText}>
                &quot;I went to the park&quot;
              </span>{" "}
              thay vì &quot;I go&quot;.
            </p>
          </div>
        </div>

        <div className={styles.chatFooter}>
          <div className={styles.inputWrapper}>
            <button className={styles.micBtn}>
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Nói hoặc gõ tiếng Anh..."
              disabled
            />
            <button className={styles.sendBtn}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
          {/* <p className={styles.inputHint}>
            Nhấn <strong>Enter</strong> để gửi
          </p> */}
        </div>
      </div>

      {/* Cột phải: Nội dung + Nút CTA */}
      <div className={styles.content}>
        {/* <span className={styles.badge}>Gia sư AI</span> */}
        <h2 className={styles.title}>Đừng Sợ Mắc Lỗi</h2>
        <p className={styles.description}>
          AI của chúng tôi đóng vai trò như một người cố vấn tinh tế. Chúng tôi
          không chỉ sửa lỗi; chúng tôi giải thích lý do và cung cấp các lựa chọn
          thay thế tự nhiên mà người bản xứ hay dùng.
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <div className={`${styles.iconBox} ${styles.iconGreen}`}>
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <div>
              <h3 className={styles.featureTitle}>Sửa lỗi theo ngữ cảnh</h3>
              <p className={styles.featureDesc}>
                Phản hồi ngữ pháp dựa trên các tình huống cụ thể trong hội
                thoại.
              </p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={`${styles.iconBox} ${styles.iconPurple}`}>
              <FontAwesomeIcon icon={faMicrophoneLines} />
            </div>
            <div>
              <h3 className={styles.featureTitle}>Phân tích phát âm</h3>
              <p className={styles.featureDesc}>
                Đánh giá chi tiết sóng âm và ngữ điệu cho từng từ bạn nói.
              </p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={`${styles.iconBox} ${styles.iconOrange}`}>
              <FontAwesomeIcon icon={faWandMagicSparkles} />
            </div>
            <div>
              <h3 className={styles.featureTitle}>Gợi ý tự nhiên hóa</h3>
              <p className={styles.featureDesc}>
                Đề xuất các cách diễn đạt linh hoạt để câu nói giống người bản
                xứ hơn.
              </p>
            </div>
          </div>
        </div>

        {/* Nút CTA thêm vào đây */}
        <button
          className={styles.ctaBtn}
          onClick={() => navigate("/dashboard/student/conversation")}
        >
          Bắt đầu ngay
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </section>
  );
}

export default AISection;
