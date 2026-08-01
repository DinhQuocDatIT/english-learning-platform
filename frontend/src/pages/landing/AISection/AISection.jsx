import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./AISection.module.css";
import {
  faLightbulb,
  faCircleCheck,
} from "@fortawesome/free-regular-svg-icons";
import { faRobot } from "@fortawesome/free-solid-svg-icons";

function AISection() {
  return (
    <section className={styles.section}>
      <div className={styles.chatWrapper}>
        <div className={styles.chatHeader}>
          <div className={styles.botAvatar}>
            <FontAwesomeIcon icon={faRobot} />
          </div>
          <div className={styles.botInfo}>
            <p className={styles.botName}>EnglishFlow AI</p>
            <p className={styles.botStatus}>Trực tuyến</p>
          </div>
        </div>

        <div className={styles.chatBody}>
          <div className={styles.msgBot}>How was your weekend?</div>

          <div className={styles.msgUser}>
            I go to the park and saw some dogs.
          </div>

          <div className={styles.feedbackBox}>
            <p className={styles.feedbackTitle}>
              <FontAwesomeIcon icon={faLightbulb} /> PHẢN HỒI THÂN THIỆN
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
      </div>

      {/* Nội dung thông tin bên phải */}
      <div className={styles.content}>
        <h2 className={styles.title}>Đừng Sợ Mắc Lỗi</h2>
        <p className={styles.description}>
          AI của chúng tôi đóng vai trò như một người cố vấn tinh tế. Chúng tôi
          không chỉ sửa lỗi; chúng tôi giải thích lý do và cung cấp các lựa chọn
          thay thế tự nhiên mà người bản xứ hay dùng.
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <div className={styles.checkIcon}>
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <div>
              <h3 className={styles.featureTitle}>Sửa lỗi theo ngữ cảnh</h3>
              <p className={styles.featureDesc}>
                Phản hồi ngữ pháp dựa trên các tình huống cụ thể.
              </p>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.checkIcon}>
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <div>
              <h3 className={styles.featureTitle}>Phân tích phát âm</h3>
              <p className={styles.featureDesc}>
                Phản hồi hình ảnh sóng âm cho từng âm tiết.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AISection;
