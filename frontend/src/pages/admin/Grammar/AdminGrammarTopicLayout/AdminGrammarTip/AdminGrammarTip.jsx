import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import styles from "./AdminGrammarTip.module.css";

function AdminGrammarTip() {
  return (
    <div className={styles.emptyBox}>
      <FontAwesomeIcon icon={faLightbulb} className={styles.emptyIcon} />
      <p>Chủ điểm này chưa có mẹo nào.</p>
    </div>
  );
}

export default AdminGrammarTip;
