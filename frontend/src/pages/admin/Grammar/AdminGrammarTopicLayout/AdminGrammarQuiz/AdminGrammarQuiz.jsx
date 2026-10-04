import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faFileAlt,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../../services/grammarService";
import {
  getStatusLabel,
  getStatusColor,
} from "../../../../../constants/grammarConstants";
import styles from "./AdminGrammarQuiz.module.css";

function AdminGrammarQuiz() {
  const navigate = useNavigate();
  const { topicId } = useOutletContext();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await grammarService.adminGetQuizzes(topicId);
      setQuizzes(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách đề.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (quizId) => {
    navigate(`/dashboard/admin/grammar/topics/${topicId}/quizzes/${quizId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      

      {/* LIST */}
      {quizzes.length === 0 ? (
        <div className={styles.emptyBox}>
          <FontAwesomeIcon icon={faFileAlt} className={styles.emptyIcon} />
          <p>Chủ điểm này chưa có đề nào.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {quizzes.map((quiz, idx) => {
            const statusColor = getStatusColor(quiz.status);
            return (
              <div
                key={quiz.id}
                className={styles.card}
                onClick={() => handleOpenDetail(quiz.id)}
                title="Click để xem chi tiết"
              >
                {/* HEADER */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardOrder}>{idx + 1}</div>
                  
                </div>

                {/* BODY */}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle} title={quiz.title}>
                    {quiz.title}
                  </h3>

                  {quiz.description && (
                    <p className={styles.cardDesc}>{quiz.description}</p>
                  )}

                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                      <FontAwesomeIcon icon={faClipboardList} />
                      {quiz.totalQuestions} câu hỏi
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminGrammarQuiz;
