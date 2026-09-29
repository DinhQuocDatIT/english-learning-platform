import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSpinner,
  faPen,
  faTrash,
  faGraduationCap,
  faLayerGroup,
  faEye,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import styles from "./AdminGrammarRoadmapList.module.css";

function AdminGrammarRoadmapList() {
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await grammarService.adminGetAllRoadmaps();
      setRoadmaps(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách lộ trình.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roadmap) => {
    if (
      !window.confirm(
        `Xóa lộ trình "${roadmap.name}"? Hành động này không thể hoàn tác.`,
      )
    )
      return;

    try {
      await grammarService.adminDeleteRoadmap(roadmap.id);
      toast.success("Xóa lộ trình thành công!");
      fetchRoadmaps();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể xóa.");
    }
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
      {/* TOP BAR */}
      <div className={styles.header}>
        <button
          className={styles.createBtn}
          onClick={() => navigate("/dashboard/admin/grammar/roadmaps/create")}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm lộ trình</span>
        </button>
      </div>

      {/* LIST */}
      {roadmaps.length === 0 ? (
        <div className={styles.emptyBox}>
          <FontAwesomeIcon
            icon={faGraduationCap}
            className={styles.emptyIcon}
          />
          <p>Chưa có lộ trình nào. Bấm "Thêm lộ trình" để bắt đầu.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {roadmaps.map((r) => (
            <div
              key={r.id}
              className={styles.card}
              style={{ "--roadmap-color": r.color || "#0ea792" }}
            >
              {/* HEADER: badge số + tên */}
              <div className={styles.cardHeader}>
                <span className={styles.levelLabel}>{r.level || 1}</span>
                <h2 className={styles.name} title={r.name}>
                  {r.name}
                </h2>
              </div>

              {/* META: nhãn cấp độ + subtitle */}
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

              {/* DESCRIPTION */}
              {r.description && <p className={styles.desc}>{r.description}</p>}

              {/* STATS */}
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <FontAwesomeIcon icon={faLayerGroup} />
                  <span>
                    <strong>{r.totalTopics || 0}</strong> chủ điểm
                  </span>
                </div>

                {/* ✅ Badge chờ duyệt — chỉ hiện khi có */}
                {r.pendingTopics > 0 && (
                  <div className={`${styles.statItem} ${styles.pendingStat}`}>
                    <FontAwesomeIcon icon={faClock} />
                    <span>
                      <strong>{r.pendingTopics}</strong> chờ duyệt
                    </span>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className={styles.actions}>
                <button
                  className={`${styles.actionBtn} ${styles.primaryBtn}`}
                  onClick={() =>
                    navigate(`/dashboard/admin/grammar/roadmaps/${r.id}/topics`)
                  }
                  title="Xem và duyệt chủ điểm"
                >
                  <FontAwesomeIcon icon={faEye} />
                  <span>Xem / Duyệt</span>
                </button>

                <button
                  className={styles.actionBtn}
                  onClick={() =>
                    navigate(`/dashboard/admin/grammar/roadmaps/${r.id}/edit`)
                  }
                  title="Sửa"
                >
                  <FontAwesomeIcon icon={faPen} />
                  <span>Sửa</span>
                </button>

                <button
                  className={styles.actionBtn}
                  onClick={() => handleDelete(r)}
                  title="Xóa"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminGrammarRoadmapList;
