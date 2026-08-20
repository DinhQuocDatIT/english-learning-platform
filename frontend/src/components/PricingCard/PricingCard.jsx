import React from "react";
import styles from "./PricingCard.module.css";
import { formatDuration } from "../../utils/MembershipPackageManage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-regular-svg-icons";

function PricingCard({ formData, features = [] }) {
  if (!formData) return null;

  const isActive = formData.status === "ACTIVE";
  const isFeatured = Boolean(formData.isFeatured);

  const packageFeatures = features.map((item) => item.trim()).filter(Boolean);

  const price = Number(formData.price || 0).toLocaleString("vi-VN");

  const duration = formatDuration(formData.duration);

  return (
    <div className={`${styles.card} ${isFeatured ? styles.cardPopular : ""}`}>
      {isFeatured && <div className={styles.badge}>PHỔ BIẾN NHẤT</div>}

      <div className={styles.content}>
        {/* Package name */}
        <div className={styles.header}>
          <h3 className={styles.name}>{formData.name || "Tên gói..."}</h3>
          <p className={styles.description}>Mô tả gói thành viên.</p>
        </div>

        {/* =========================
            PRICE
        ========================= */}
        <div className={styles.priceSection}>
          <div className={styles.price}>
            {price}
            <span className={styles.currency}> VNĐ</span>
          </div>

          <div className={styles.duration}>Thời hạn: {duration}</div>
        </div>

        <div className={styles.features}>
          {packageFeatures.length > 0 ? (
            packageFeatures.map((feature, index) => (
              <div key={index} className={styles.feature}>
                <span className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faSun} />
                </span>

                <span
                  className={`${styles.featureText}  ${isFeatured ? styles.cardPopular : ""} `}
                >
                  {feature}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.emptyFeature}>Chưa có quyền lợi</div>
          )}
        </div>
      </div>

      {/* =========================
          BUTTON
      ========================= */}
      <button
        type="button"
        className={`${styles.button} ${
          isFeatured ? styles.buttonPrimary : styles.buttonOutline
        }`}
        disabled={!isActive}
      >
        {isActive ? "Chọn gói này" : "Gói chưa công khai"}
      </button>
    </div>
  );
}

export default PricingCard;
