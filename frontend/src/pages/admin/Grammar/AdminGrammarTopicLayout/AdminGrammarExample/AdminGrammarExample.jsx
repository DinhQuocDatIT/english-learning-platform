import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import styles from "./AdminGrammarExample.module.css";

function AdminGrammarExample() {
  return (
    <div className={styles.emptyBox}>
      <FontAwesomeIcon icon={faStar} className={styles.emptyIcon} />
      <p>Chủ điểm này chưa có ví dụ nào.</p>
    </div>
  );
}

export default AdminGrammarExample;
