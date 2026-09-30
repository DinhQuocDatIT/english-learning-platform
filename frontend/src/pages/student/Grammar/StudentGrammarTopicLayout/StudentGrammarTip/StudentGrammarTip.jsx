import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import styles from "./StudentGrammarTip.module.css";

function StudentGrammarTip() {
  return (
    <div className={styles.emptyBox}>
      <FontAwesomeIcon icon={faLightbulb} className={styles.emptyIcon} />
      <p>Tính năng Mẹo đang được phát triển.</p>
    </div>
  );
}

export default StudentGrammarTip;
