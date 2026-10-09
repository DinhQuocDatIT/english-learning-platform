import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import grammarService from "../../../../../services/grammarService";
import Loading from "../../../../../components/common/Loading/Loading";
import styles from "./StudentGrammarExample.module.css";

function StudentGrammarExample() {
  const { topicId } = useOutletContext();

  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) fetchExamples();
  }, [topicId]);

  const fetchExamples = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getPublishedExamples(topicId);
      setExamples(res?.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen={false} text="Đang tải ví dụ..." />;
  }

  if (examples.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <FontAwesomeIcon icon={faStar} className={styles.emptyIcon} />
        <p>Chủ điểm này chưa có ví dụ nào.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {examples.map((ex, idx) => (
        <div key={ex.id} className={styles.item}>
          <span className={styles.order}>{ex.displayOrder || idx + 1}</span>

          <div className={styles.itemBody}>
            <p className={styles.sentenceEn}>{ex.sentenceEn}</p>

            {ex.sentenceVi && (
              <p className={styles.sentenceVi}>— {ex.sentenceVi}</p>
            )}

            {ex.note && <div className={styles.note}>{ex.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentGrammarExample;
