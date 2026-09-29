import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "./TeacherGrammarQuiz.module.css";

function TeacherGrammarQuiz() {
  return (
    <div className={styles.emptyBox}>
      <FontAwesomeIcon icon={faQuestionCircle} className={styles.emptyIcon} />
      <p>Tính năng Trắc nghiệm đang được phát triển.</p>
    </div>
  );
}

export default TeacherGrammarQuiz;
