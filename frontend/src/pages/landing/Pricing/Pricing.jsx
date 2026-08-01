import React from "react";
import styles from "./Pricing.module.css";

function Pricing() {
  const plans = [
    {
      id: "basic",
      name: "Cơ bản",
      description: "Cho người mới bắt đầu.",
      price: "$0",
      period: "/vĩnh viễn",
      features: [
        { text: "5 cuộc hội thoại/ngày", included: true },
        { text: "Chủ đề cơ bản", included: true },
        { text: "AI Phát âm Nâng cao", included: false },
      ],
      buttonText: "Bắt đầu ngay",
      buttonVariant: "outline",
      popular: false,
    },
    {
      id: "popular",
      name: "Phổ thông",
      description: "Được học viên yêu thích nhất.",
      price: "$14.99",
      period: "/tháng",
      features: [
        { text: "Không giới hạn hội thoại", included: true },
        { text: "AI Phản hồi Nâng cao", included: true },
        { text: "Lộ trình học cá nhân hóa", included: true },
        { text: "Chế độ Offline (Sắp có)", included: true },
      ],
      buttonText: "Nâng cấp ngay",
      buttonVariant: "solid",
      popular: true,
    },
    {
      id: "premium",
      name: "Cao cấp",
      description: "Dành cho mục tiêu thành thạo.",
      price: "$29.99",
      period: "/tháng",
      features: [
        { text: "Tất cả tính năng Phổ thông", included: true },
        { text: "Cố vấn 1-1 hàng tuần", included: true },
        { text: "Chứng chỉ hoàn thành AI", included: true },
      ],
      buttonText: "Mua gói Master",
      buttonVariant: "outline",
      popular: false,
    },
  ];

  return (
    <section className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Đầu Tư Cho Bản Thân</h2>
        <p className={styles.subtitle}>
          Chọn lộ trình phù hợp với tốc độ học của bạn.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className={styles.grid}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.card} ${plan.popular ? styles.popularCard : ""}`}
          >
            {plan.popular && <div className={styles.badge}>PHỔ BIẾN NHẤT</div>}

            <div>
              <h3
                className={`${styles.planName} ${plan.popular ? styles.textWhite : ""}`}
              >
                {plan.name}
              </h3>
              <p
                className={`${styles.planDesc} ${plan.popular ? styles.textGray : ""}`}
              >
                {plan.description}
              </p>

              <div className={styles.priceContainer}>
                <span
                  className={`${styles.price} ${plan.popular ? styles.textWhite : ""}`}
                >
                  {plan.price}
                </span>
                <span
                  className={`${styles.period} ${plan.popular ? styles.textGray : ""}`}
                >
                  {plan.period}
                </span>
              </div>

              <ul className={styles.featureList}>
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`${styles.featureItem} ${
                      plan.popular ? styles.textWhite : ""
                    } ${!feature.included ? styles.disabled : ""}`}
                  >
                    <span
                      className={
                        plan.popular ? styles.greenCheck : styles.checkIcon
                      }
                    >
                      {feature.included ? "✓" : "✕"}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>
            </div>

            {plan.buttonVariant === "solid" ? (
              <button className={styles.solidButton}>{plan.buttonText}</button>
            ) : (
              <button className={styles.outlineButton}>
                {plan.buttonText}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Pricing;
