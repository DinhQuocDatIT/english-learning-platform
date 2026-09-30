import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import styles from "./StudentGrammarExample.module.css";

function StudentGrammarExample() {
  return (
    <div className={styles.emptyBox}>
      <FontAwesomeIcon icon={faStar} className={styles.emptyIcon} />
      <p>Tính năng Ví dụ đang được phát triển.</p>
    </div>
  );
}

export default StudentGrammarExample;
