import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup, // Từ vựng
  faBookOpen, // Ngữ pháp
  faFileAlt, // Luyện dịch
  faComments, // Chat AI
  faHeadphones, // Luyện nghe
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Timeline.module.css";

const Timeline = () => {
  const steps = [
    {
      icon: faLayerGroup,
      step: "01",
      title: "Nạp Từ Vựng",
      desc: "Xây dựng vốn từ vựng cá nhân qua Flashcard thông minh, phát âm chuẩn bản xứ và ôn tập theo phương pháp lặp lại ngắt quãng.",
      color: "#0ea792", // Teal
      gradient: "linear-gradient(135deg, #0ea792, #14b8a6)",
    },
    {
      icon: faBookOpen,
      step: "02",
      title: "Học Ngữ Pháp",
      desc: "Nắm vững cấu trúc câu từ cơ bản đến nâng cao theo lộ trình TOEIC chuẩn. Học lý thuyết đi kèm ví dụ thực tế.",
      color: "#3b82f6", // Blue
      gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    },
    {
      icon: faFileAlt,
      step: "03",
      title: "Luyện Dịch Câu",
      desc: "Thực hành dịch Việt - Anh với hàng ngàn mẫu câu. Nhận phản hồi chi tiết và sửa lỗi sai ngay lập tức.",
      color: "#8b5cf6", // Purple
      gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    },
    {
      icon: faComments,
      step: "04",
      title: "Giao Tiếp Chat AI",
      desc: "Trò chuyện trực tiếp 1-1 với Gia sư AI nhập vai. Phản xạ tự nhiên, sửa lỗi ngữ pháp và học cách diễn đạt linh hoạt.",
      color: "#ec4899", // Pink
      gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
    },
    {
      icon: faHeadphones,
      step: "05",
      title: "Luyện Nghe",
      desc: "Nghe chép chính tả với giọng đọc đa dạng. Hệ thống chấm điểm chính xác từng từ, giúp tai bạn quen với ngữ điệu.",
      color: "#f59e0b", // Orange
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    },
  ];

  return (
    <section className={styles.timeline}>
      {/* Các đốm sáng trang trí nền */}
      <div className={styles.bgGlow1}></div>
      <div className={styles.bgGlow2}></div>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          {/* <span className={styles.badge}>Lộ trình toàn diện</span> */}
          <h2 className={styles.title}>Chinh Phục Tiếng Anh Từ A - Z</h2>
          <p className={styles.subtitle}>
            5 bước khép kín được thiết kế khoa học để bạn tiến bộ mỗi ngày.
          </p>
        </div>

        {/* Danh sách Timeline */}
        <div className={styles.stepsList}>
          {/* Đường kẻ nối chạy dọc */}
          <div className={styles.trackLine}></div>

          {steps.map((step, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={index}
                className={`${styles.stepRow} ${isEven ? styles.left : styles.right}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Khối Icon tròn ở giữa */}
                <div className={styles.centerNode}>
                  <div
                    className={styles.iconCircle}
                    style={{ background: step.gradient }}
                  >
                    <FontAwesomeIcon icon={step.icon} />
                  </div>
                  <span
                    className={styles.stepNumber}
                    style={{ color: step.color }}
                  >
                    {step.step}
                  </span>
                </div>

                {/* Thẻ nội dung */}
                <div
                  className={styles.card}
                  style={{ "--accent-color": step.color }}
                >
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{step.title}</h3>
                    <span
                      className={styles.stepBadge}
                      style={{ background: step.gradient }}
                    >
                      Bước {step.step}
                    </span>
                  </div>
                  <p className={styles.cardDesc}>{step.desc}</p>

                  {/* Mũi tên trang trí trên Card */}
                  <div
                    className={styles.cardArrow}
                    style={{ color: step.color }}
                  ></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
