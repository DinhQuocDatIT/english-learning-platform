import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";
import grammarService from "../../../../../services/grammarService";
import Loading from "../../../../../components/common/Loading/Loading";
import styles from "./StudentGrammarTheory.module.css";

// =====================================================
// HELPER: Render TEXT — tự tách dòng
// =====================================================
function TextView({ content }) {
  if (!content) return null;
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    return <p className={styles.textContent}>{content}</p>;
  }

  return (
    <ul className={styles.viewList}>
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

// =====================================================
// THEORY SECTION — readonly
// =====================================================
function TheorySection({ theory }) {
  return (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>{theory.title}</h3>
      <div className={styles.sectionContent}>
        {theory.sectionType === "TEXT" && <TextView content={theory.content} />}

        {theory.sectionType === "TABLE" && theory.metadata?.rows && (
          <table className={styles.viewTable}>
            <thead>
              <tr>
                {(theory.metadata.headers || []).map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {theory.metadata.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {theory.sectionType === "LIST" && theory.metadata?.items && (
          <ul className={styles.viewList}>
            {theory.metadata.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}

        {theory.sectionType === "NOTE" && (
          <div
            className={`${styles.viewNote} ${
              styles[`note_${theory.metadata?.color || "yellow"}`]
            }`}
          >
            {theory.content}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN
// =====================================================
function StudentGrammarTheory() {
  const { topicId } = useOutletContext();

  const [theories, setTheories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheories();
  }, [topicId]);

  const fetchTheories = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getTopicDetail(topicId);
      const data = res?.data?.data;
      setTheories(data?.theories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen={false} text="Đang tải bài giảng..." />;
  }

  if (theories.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <FontAwesomeIcon icon={faBookOpen} className={styles.emptyIcon} />
        <p>Chủ điểm này chưa có nội dung lý thuyết.</p>
      </div>
    );
  }

  return (
    <>
      {theories.map((th) => (
        <TheorySection key={th.id} theory={th} />
      ))}
    </>
  );
}

export default StudentGrammarTheory;
