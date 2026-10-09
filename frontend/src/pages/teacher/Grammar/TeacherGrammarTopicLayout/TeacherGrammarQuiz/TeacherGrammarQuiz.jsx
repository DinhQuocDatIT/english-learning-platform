import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faFileAlt,
  faClipboardList,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../../services/grammarService";
import { getStatusLabel } from "../../../../../constants/grammarConstants";
import Loading from "../../../../../components/common/Loading/Loading";
import styles from "./TeacherGrammarQuiz.module.css";

function TeacherGrammarQuiz() {
  const navigate = useNavigate();
  const { topicId, topic } = useOutletContext();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const canEdit =
    !topic || topic.status === "DRAFT" || topic.status === "REJECTED";

  useEffect(() => {
    if (topicId) fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getQuizzes(topicId);
      setQuizzes(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách đề.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quiz) => {
    if (!window.confirm(`Xóa đề "${quiz.title}"?`)) return;
    try {
      await grammarService.deleteQuiz(quiz.id);
      toast.success("Xóa thành công!");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể xóa.");
    }
  };

  // ===== LOADING =====
  if (loading) {
    return <Loading fullScreen={false} text="Đang tải danh sách đề..." />;
  }

  return (
    <>
      <div className={styles.actionRow}>
        <button
          className={styles.addBtn}
          onClick={() =>
            navigate(
              `/dashboard/teacher/grammar/topics/${topicId}/quizzes/create`,
            )
          }
          disabled={!canEdit}
          title={!canEdit ? "Chủ điểm không ở trạng thái cho phép sửa" : ""}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm đề</span>
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className={styles.emptyBox}>
          <FontAwesomeIcon icon={faFileAlt} className={styles.emptyIcon} />
          <p>
            {canEdit
              ? 'Chưa có đề nào. Bấm "Thêm đề" để bắt đầu.'
              : "Chủ điểm này chưa có đề nào."}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FontAwesomeIcon icon={faFileAlt} />
                </div>
                <h3 className={styles.cardTitle} title={quiz.title}>
                  {quiz.title}
                </h3>
              </div>

              {quiz.description && (
                <p className={styles.cardDesc}>{quiz.description}</p>
              )}

              <div className={styles.cardFooter}>
                <span className={styles.metaItem}>
                  <FontAwesomeIcon icon={faClipboardList} />
                  <strong>{quiz.totalQuestions || 0}</strong> câu
                </span>

                {canEdit && (
                  <div className={styles.cardActions}>
                    <button
                      className={styles.iconBtn}
                      onClick={() =>
                        navigate(
                          `/dashboard/teacher/grammar/topics/${topicId}/quizzes/${quiz.id}/edit`,
                        )
                      }
                      title="Sửa"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                      onClick={() => handleDelete(quiz)}
                      title="Xóa"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default TeacherGrammarQuiz;
