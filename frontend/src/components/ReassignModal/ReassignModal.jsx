import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSpinner,
  faUser,
  faArrowRight,
  faCheckSquare,
  faSquare,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../services/grammarService"; // Sửa lại đường dẫn nếu cần
import styles from "./ReassignModal.module.css";

function ReassignModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);

  // Bước 2: Chọn người nhận
  const [isAssigning, setIsAssigning] = useState(false);
  const [targetTeacherId, setTargetTeacherId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      setSelectedTeacher(null);
      setTopics([]);
      setSelectedTopicIds([]);
      setIsAssigning(false);
      setTargetTeacherId("");
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await grammarService.adminGetTeachersWithTopics();
      setTeachers(res?.data?.data || []);
    } catch (e) {
      toast.error("Không thể tải danh sách giáo viên.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    try {
      const res = await grammarService.adminGetTopicsByTeacher(teacher.id);
      setTopics(res?.data?.data || []);
      setSelectedTopicIds([]); // Reset check
    } catch (e) {
      toast.error("Không thể tải danh sách chủ điểm.");
    }
  };

  const toggleTopic = (id) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedTopicIds.length === topics.length) {
      setSelectedTopicIds([]);
    } else {
      setSelectedTopicIds(topics.map((t) => t.id));
    }
  };

  // ✅ Hàm nhóm topic theo Roadmap
  const groupTopicsByRoadmap = () => {
    return topics.reduce((acc, topic) => {
      const roadmapName = topic.roadmapName || "Chưa xếp lộ trình";
      if (!acc[roadmapName]) {
        acc[roadmapName] = [];
      }
      acc[roadmapName].push(topic);
      return acc;
    }, {});
  };

  const handleConfirmAssign = async () => {
    if (!targetTeacherId) {
      toast.warning("Vui lòng chọn người nhận chuyển giao.");
      return;
    }
    if (selectedTopicIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 chủ điểm.");
      return;
    }

    try {
      setSubmitting(true);
      await grammarService.adminReassignTopics({
        topicIds: selectedTopicIds,
        newOwnerId: Number(targetTeacherId),
      });
      toast.success("Chuyển giao thành công!");
      onSuccess();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể chuyển giao.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const targetTeacher = teachers.find((t) => t.id === Number(targetTeacherId));
  const groupedTopics = groupTopicsByRoadmap();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Chuyển giao chủ điểm</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.body}>
          {isAssigning ? (
            // BƯỚC 2: HIỂN THỊ DANH SÁCH ĐÃ CHỌN VÀ CHỌN NGƯỜI NHẬN
            <div className={styles.assignStep}>
              <div className={styles.summaryBox}>
                <h3>Danh sách chủ điểm đã chọn ({selectedTopicIds.length})</h3>
                <ul className={styles.selectedList}>
                  {topics
                    .filter((t) => selectedTopicIds.includes(t.id))
                    .map((t) => (
                      <li key={t.id}>
                        <span className={styles.topicId}>#{t.id}</span> {t.name}
                        <span className={styles.roadmapTag}>
                          ({t.roadmapName})
                        </span>
                      </li>
                    ))}
                </ul>
                <div className={styles.ownerInfo}>
                  <FontAwesomeIcon icon={faUser} />
                  <span>
                    Người hiện tại: <strong>{selectedTeacher?.fullName}</strong>{" "}
                    (ID: {selectedTeacher?.id})
                  </span>
                </div>
              </div>

              <div className={styles.targetBox}>
                <h3>Chọn giáo viên nhận chuyển giao</h3>
                <select
                  className={styles.select}
                  value={targetTeacherId}
                  onChange={(e) => setTargetTeacherId(e.target.value)}
                >
                  <option value="">-- Chọn giáo viên --</option>
                  {teachers
                    .filter((t) => t.id !== selectedTeacher?.id) // Không hiện chính họ
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} (ID: {t.id})
                      </option>
                    ))}
                </select>

                {targetTeacher && (
                  <div className={styles.targetInfo}>
                    <FontAwesomeIcon icon={faArrowRight} />
                    <span>
                      Người nhận: <strong>{targetTeacher.fullName}</strong> (ID:{" "}
                      {targetTeacher.id})
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.footerActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setIsAssigning(false)}
                >
                  Quay lại
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={handleConfirmAssign}
                  disabled={submitting}
                >
                  {submitting ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    "Xác nhận chuyển giao"
                  )}
                </button>
              </div>
            </div>
          ) : (
            // BƯỚC 1: CHỌN TEACHER VÀ CHỌN TOPIC (PHÂN NHÓM)
            <div className={styles.selectStep}>
              <div className={styles.teacherList}>
                <h3>Chọn giáo viên để xem chủ điểm</h3>
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  teachers.map((t) => (
                    <div
                      key={t.id}
                      className={`${styles.teacherItem} ${selectedTeacher?.id === t.id ? styles.activeTeacher : ""}`}
                      onClick={() => handleSelectTeacher(t)}
                    >
                      <span>
                        {t.fullName} (ID: {t.id})
                      </span>
                      <span className={styles.count}>
                        {t.topicCount} chủ đề
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.topicList}>
                {selectedTeacher ? (
                  <>
                    <div className={styles.topicHeader}>
                      <h3>Chủ điểm của {selectedTeacher.fullName}</h3>
                      <button
                        className={styles.selectAllBtn}
                        onClick={toggleAll}
                      >
                        {selectedTopicIds.length === topics.length &&
                        topics.length > 0 ? (
                          <>
                            <FontAwesomeIcon icon={faCheckSquare} /> Bỏ chọn tất
                            cả
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSquare} /> Chọn tất cả
                          </>
                        )}
                      </button>
                    </div>

                    <div className={styles.topicScroll}>
                      {/* ✅ Render theo nhóm Roadmap */}
                      {Object.entries(groupedTopics).map(
                        ([roadmapName, roadmapTopics]) => (
                          <div
                            key={roadmapName}
                            className={styles.roadmapGroup}
                          >
                            <div className={styles.roadmapGroupTitle}>
                              <FontAwesomeIcon icon={faFolderOpen} />
                              {roadmapName} ({roadmapTopics.length})
                            </div>

                            {roadmapTopics.map((topic) => (
                              <div
                                key={topic.id}
                                className={styles.topicItem}
                                onClick={() => toggleTopic(topic.id)}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    selectedTopicIds.includes(topic.id)
                                      ? faCheckSquare
                                      : faSquare
                                  }
                                  className={
                                    selectedTopicIds.includes(topic.id)
                                      ? styles.iconChecked
                                      : styles.iconUncheck
                                  }
                                />
                                <span className={styles.topicId}>
                                  #{topic.id}
                                </span>
                                <span>{topic.name}</span>
                                <span className={styles.status}>
                                  {topic.status === "PUBLISHED"
                                    ? "Đã PUBLISH"
                                    : topic.status === "DRAFT"
                                      ? "Nháp"
                                      : topic.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        ),
                      )}
                    </div>

                    <div className={styles.footerActions}>
                      <button
                        className={styles.submitBtn}
                        onClick={() => setIsAssigning(true)}
                        disabled={selectedTopicIds.length === 0}
                      >
                        Tiếp tục chuyển giao ({selectedTopicIds.length})
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.placeholder}>
                    Vui lòng chọn giáo viên bên trái để xem chủ điểm.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReassignModal;
