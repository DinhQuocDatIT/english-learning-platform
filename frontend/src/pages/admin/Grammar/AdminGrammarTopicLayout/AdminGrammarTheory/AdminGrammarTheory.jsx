import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import grammarService from "../../../../../services/grammarService";
import styles from "./AdminGrammarTheory.module.css";

// =====================================================
// HELPER: Render TEXT — tự tách dòng
// - 1 dòng → <p>
// - Nhiều dòng → <ul><li> có dấu •
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
        {/* TEXT */}
        {theory.sectionType === "TEXT" && (
          <TextView content={theory.content} />
        )}

        {/* TABLE */}
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

        {/* LIST */}
        {theory.sectionType === "LIST" && theory.metadata?.items && (
          <ul className={styles.viewList}>
            {theory.metadata.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}

        {/* NOTE */}
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
function AdminGrammarTheory() {
  const { topicId } = useOutletContext();

  const [theories, setTheories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) fetchTheories();
  }, [topicId]);

  const fetchTheories = async () => {
    try {
      setLoading(true);
      // Dùng API teacher (admin có quyền) để lấy full lý thuyết
      const res = await grammarService.getTheories(topicId);
      setTheories(res?.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
      </div>
    );
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

export default AdminGrammarTheory;