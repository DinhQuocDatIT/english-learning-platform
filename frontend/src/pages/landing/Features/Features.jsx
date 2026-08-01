import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Features.module.css";
import { faHeadphones } from "@fortawesome/free-regular-svg-icons";
import { faArrowUpRightDots, faBlog } from "@fortawesome/free-solid-svg-icons";

function Features() {
  const steps = [
    {
      id: 1,
      icon: faHeadphones,
      title: "1. Lắng nghe",
      description:
        "Tiếp cận các tình huống AI được thiết kế riêng cho trình độ của bạn.",
      styleClass: styles.step1,
    },
    {
      id: 2,
      icon: faBlog,
      title: "2. Thực hành",
      description:
        "Ghi âm và nói tự do mà không cần lo lắng về rào cản tâm lý.",
      styleClass: styles.step2,
    },
    {
      id: 3,
      icon: faArrowUpRightDots,
      title: "3. Cải thiện",
      description:
        "Nhận phản hồi chính xác và hành động cụ thể để nói như người bản xứ.",
      styleClass: styles.step3,
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Thành Thạo Trong 3 Bước</h2>
        <p className={styles.subtitle}>
          Phương pháp khoa học để giao tiếp lưu loát.
        </p>
      </div>

      <div className={styles.grid}>
        {steps.map((step) => (
          <div key={step.id} className={styles.card}>
            <div className={`${styles.iconBox} ${step.styleClass}`}>
              <FontAwesomeIcon icon={step.icon} />
            </div>
            <h3 className={styles.cardTitle}>{step.title}</h3>
            <p className={styles.cardDescription}>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
