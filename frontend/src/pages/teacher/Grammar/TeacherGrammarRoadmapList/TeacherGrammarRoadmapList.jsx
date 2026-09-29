import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faGraduationCap,
  faLayerGroup,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import styles from "./TeacherGrammarRoadmapList.module.css";

function TeacherGrammarRoadmapList() {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getRoadmapsForTeacher(); // ← ĐỔI
      setRoadmaps(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách lộ trình.");
    } finally {
      setLoading(false);
    }
  };

  const goToTopics = (roadmapId) => {
    navigate(`/dashboard/teacher/grammar/roadmaps/${roadmapId}/topics`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {roadmaps.length === 0 ? (
        <div className={styles.emptyBox}>
          <FontAwesomeIcon
            icon={faGraduationCap}
            className={styles.emptyIcon}
          />
          <p>Chưa có lộ trình nào.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {roadmaps.map((r) => (
            <div
              key={r.id}
              className={styles.card}
              style={{ "--roadmap-color": r.color || "#0ea792" }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.levelLabel}>{r.level || 1}</span>
                <h2 className={styles.name} title={r.name}>
                  {r.name}
                </h2>
              </div>

              <div className={styles.metaRow}>
                {r.levelLabel && (
                  <span className={styles.crownBadge} title={r.levelLabel}>
                    <FontAwesomeIcon icon={faLayerGroup} />
                    {r.levelLabel}
                  </span>
                )}
                {r.subtitle && (
                  <span className={styles.subtitle}>{r.subtitle}</span>
                )}
              </div>

              {r.description && <p className={styles.desc}>{r.description}</p>}

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <FontAwesomeIcon icon={faLayerGroup} />
                  <span>
                    <strong>{r.totalTopics || 0}</strong> chủ điểm
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={`${styles.actionBtn} ${styles.primaryBtn}`}
                  onClick={() => goToTopics(r.id)}
                >
                  <FontAwesomeIcon icon={faEye} />
                  <span>Xem chủ điểm</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherGrammarRoadmapList;
