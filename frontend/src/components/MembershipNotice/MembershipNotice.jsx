import React from "react";
import styles from "./MembershipNotice.module.css";

function MembershipNotice({ open, message, onClose }) {
  if (!open) return null;

  // Tách message để highlight phần ngày tháng (giả sử message có dạng "Bạn đang có gói thành viên còn hiệu lực đến 2027-02-16")
  const renderMessage = () => {
    if (!message) return null;

    // Tìm ngày tháng trong message (định dạng YYYY-MM-DD)
    const dateMatch = message.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      const parts = message.split(dateMatch[0]);
      return (
        <>
          {parts[0]}
          <strong>{dateMatch[0]}</strong>
          {parts[1] || ""}
        </>
      );
    }
    return message;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>!</span>
        </div>

        <h3 className={styles.title}>Gói thành viên đang còn hiệu lực</h3>

        <p className={styles.message}>{renderMessage()}</p>

        <button type="button" className={styles.button} onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
}

export default MembershipNotice;
