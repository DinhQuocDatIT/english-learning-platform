import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./AdminGrammarQuiz.module.css";

function AdminGrammarQuiz() {
  return (
    <div className={styles.emptyBox}>
      <FontAwesomeIcon icon={faQuestionCircle} className={styles.emptyIcon} />
      <p>Chủ điểm này chưa có câu hỏi trắc nghiệm nào.</p>
    </div>
  );
}

export default AdminGrammarQuiz;
