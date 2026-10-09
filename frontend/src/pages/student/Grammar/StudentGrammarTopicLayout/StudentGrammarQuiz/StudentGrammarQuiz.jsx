import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faClipboardList,
  faPlay,
  faRedo,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../../services/grammarService";
import Loading from "../../../../../components/common/Loading/Loading";
import styles from "./StudentGrammarQuiz.module.css";

function StudentGrammarQuiz() {
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
      const res = await grammarService.getPublishedQuizzes(topicId);
      setQuizzes(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách đề.");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (quizId) => {
    navigate(`/dashboard/student/grammar/topics/${topicId}/quiz/${quizId}`);
  };

  if (loading) {
    return <Loading fullScreen={false} text="Đang tải danh sách đề..." />;
  }

  return (
    <div className={styles.wrapper}>
      {quizzes.length === 0 ? (
        <div className={styles.emptyBox}>
          <FontAwesomeIcon icon={faFileAlt} className={styles.emptyIcon} />
          <p>Chủ điểm này chưa có đề luyện tập nào.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {quizzes.map((quiz) => {
            const hasDone = quiz.attemptCount > 0;
            const hasInProgress = quiz.hasInProgressAttempt;

            return (
              <div
                key={quiz.id}
                className={styles.card}
                onClick={() => handleStart(quiz.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStart(quiz.id);
                }}
              >
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
                      {quiz.totalQuestions} câu
                    </span>

                    {hasDone && (
                      <span className={styles.metaItem}>
                        <FontAwesomeIcon icon={faRedo} />
                        Đã làm {quiz.attemptCount} lần
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={`${styles.startBtn} ${
                      hasInProgress ? styles.startBtnResume : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStart(quiz.id);
                    }}
                  >
                    <FontAwesomeIcon icon={hasInProgress ? faClock : faPlay} />
                    <span>
                      {hasInProgress
                        ? "Tiếp tục làm"
                        : hasDone
                          ? "Làm lại"
                          : "Bắt đầu"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentGrammarQuiz;
