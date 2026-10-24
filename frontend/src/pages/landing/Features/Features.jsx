import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Features.module.css";
import { faHeadphones, faComments } from "@fortawesome/free-regular-svg-icons";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Features() {
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      icon: faHeadphones,
      title: "Luyện Nghe & Nạp Từ",
      description:
        "Bắt đầu với các bài nghe chép chính tả và kho từ vựng Flashcard để làm quen với âm thanh và mặt chữ.",
      styleClass: styles.step1,
      link: "/dashboard/student/topics", // Link tới trang bài nghe
    },
    {
      id: 2,
      icon: faComments,
      title: "Thực Hành Giao Tiếp",
      description:
        "Ứng dụng ngay vốn từ đã học vào các đoạn hội thoại thực tế với Gia sư AI. Được sửa lỗi phát âm tức thì.",
      styleClass: styles.step2,
      link: "/dashboard/student/conversation", // Link tới trang chat AI
    },
    {
      id: 3,
      icon: faGraduationCap,
      title: "Nắm Chắc Ngữ Pháp",
      description:
        "Hoàn thiện kỹ năng với lộ trình ngữ pháp từ cơ bản đến TOEIC, làm bài tập trắc nghiệm để ghi nhớ sâu.",
      styleClass: styles.step3,
      link: "/dashboard/student/grammar", // Link tới trang ngữ pháp
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
       
        <h2 className={styles.title}>Chinh Phục Tiếng Anh Từng Bước</h2>
        <p className={styles.subtitle}>
          Lộ trình khép kín giúp bạn xây dựng nền tảng vững chắc và phản xạ tự
          nhiên.
        </p>
      </div>

      <div className={styles.stepsContainer}>
        {/* Đường kẻ nối các bước */}
        <div className={styles.connectorLine} />

        {steps.map((step) => (
          <div
            key={step.id}
            className={styles.stepCard}
            onClick={() => navigate(step.link)}
            style={{ cursor: "pointer" }}
          >
            <div className={`${styles.iconBox} ${step.styleClass}`}>
              <FontAwesomeIcon icon={step.icon} />
              <span className={styles.stepNumber}>{step.id}</span>
            </div>
            <div className={styles.textContent}>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardDescription}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
