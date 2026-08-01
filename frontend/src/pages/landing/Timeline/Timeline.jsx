import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faBookOpen,
  faFileAlt,
  faComments,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Timeline.module.css";

const Timeline = () => {
  const steps = [
    {
      icon: faUserPlus,
      step: "01",
      title: "Đăng Ký Tài Khoản",
      desc: "Thiết lập tài khoản học viên miễn phí chỉ trong 30 giây để bắt đầu lộ trình học cá nhân hóa.",
    },
    {
      icon: faBookOpen,
      step: "02",
      title: "Học Từ Vựng Mỗi Ngày",
      desc: "Tích lũy từ vựng theo chủ đề với Flashcard thông minh hỗ trợ phát âm chuẩn từ AI.",
    },
    {
      icon: faFileAlt,
      step: "03",
      title: "Luyện Dịch Câu & Ngữ Pháp",
      desc: "Dịch câu thực tế, nhận phản hồi sửa lỗi tức thì giúp củng cố ngữ pháp sâu.",
    },
    {
      icon: faComments,
      step: "04",
      title: "Luyện Giao Tiếp Phản Xạ",
      desc: "Đàm thoại trực tiếp với Bot AI theo ngữ cảnh tự nhiên để tăng tốc phản xạ Nói.",
    },
    {
      icon: faChartLine,
      step: "05",
      title: "Theo Dõi Sự Tiến Bộ",
      desc: "Xem báo cáo chi tiết, biểu đồ tiến độ học tập và tự tin đạt được các chứng chỉ quốc tế.",
    },
  ];

  return (
    <section className={styles.timeline}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Quy Trình Học Tập</h2>
          <p className={styles.subtitle}>
            Các bước đơn giản để từng bước nâng cao và làm chủ năng lực tiếng
            Anh cùng trợ lý AI
          </p>
        </div>

        {/* Timeline */}
        <div className={styles.timelineWrapper}>
          <div className={styles.line}></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`${styles.stepContainer} ${index % 2 === 0 ? styles.left : styles.right}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className={styles.iconNode}>
                <FontAwesomeIcon icon={step.icon} className={styles.icon} />
              </div>

              <div className={styles.contentCard}>
                <span className={styles.stepNum}>{step.step}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
