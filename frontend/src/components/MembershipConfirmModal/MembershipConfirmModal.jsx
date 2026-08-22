import React from "react";
import styles from "./MembershipConfirmModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCrown,
  faCalendarDays,
  faMoneyBillWave,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { formatDuration } from "../../utils/MembershipPackageManage";

function MembershipConfirmModal({
  packageData,
  open,
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!open || !packageData) {
    return null;
  }

  const features = packageData.description
    ? packageData.description
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const price = Number(packageData.price || 0).toLocaleString("vi-VN");
  const duration = formatDuration(packageData.duration);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faCrown} />
          </div>

          <div>
            <h2 className={styles.title}>Xác nhận đăng ký</h2>
            <p className={styles.subtitle}>
              Bạn có chắc chắn muốn đăng ký gói thành viên này?
            </p>
          </div>
        </div>

        {/* Package */}
        <div className={styles.package}>
          <div className={styles.packageHeader}>
            <div>
              <span className={styles.packageLabel}>GÓI THÀNH VIÊN</span>
              <h3 className={styles.packageName}>{packageData.name}</h3>
            </div>

            {packageData.isFeatured && (
              <span className={styles.featuredBadge}>PHỔ BIẾN</span>
            )}
          </div>

          {/* Price + duration */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>

              <div>
                <span className={styles.infoLabel}>Giá gói</span>
                <strong className={styles.price}>{price} VNĐ</strong>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FontAwesomeIcon icon={faCalendarDays} />
              </div>

              <div>
                <span className={styles.infoLabel}>Thời hạn</span>
                <strong className={styles.duration}>{duration}</strong>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className={styles.featuresSection}>
            <h4 className={styles.featuresTitle}>Quyền lợi của bạn</h4>

            {features.length > 0 ? (
              <div className={styles.features}>
                {features.map((feature, index) => (
                  <div key={index} className={styles.feature}>
                    <span className={styles.checkIcon}>
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noFeatures}>Chưa có thông tin quyền lợi.</p>
            )}
          </div>
        </div>

        {/* Warning */}
        {/* <div className={styles.warning}>
          <FontAwesomeIcon icon={faCircleExclamation} />
          <span>
            Sau khi xác nhận, gói thành viên sẽ được đăng ký cho tài khoản của
            bạn.
          </span>
        </div> */}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Xác nhận đăng ký"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MembershipConfirmModal;
