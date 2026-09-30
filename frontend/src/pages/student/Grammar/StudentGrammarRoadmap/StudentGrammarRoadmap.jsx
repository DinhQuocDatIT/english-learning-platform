import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faGraduationCap,
  faArrowRight,
  faBookOpen,
  faCompass,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import grammarService from "../../../../services/grammarService";
import styles from "./StudentGrammarRoadmap.module.css";

// Trích số level từ tên roadmap
function extractLevelNumber(name) {
  if (!name) return "";
  const match = name.match(/(\d+\+?)/);
  return match ? match[1] : name;
}

function StudentGrammarRoadmap() {
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [roadmapDetails, setRoadmapDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await grammarService.getAllRoadmaps();
      const rawList = res?.data?.data || [];

      // Loại bỏ roadmap trùng tên
      const seen = new Set();
      const list = rawList.filter((r) => {
        const key = r.name.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setRoadmaps(list);

      const detailResults = await Promise.all(
        list.map((r) => grammarService.getRoadmapDetail(r.id)),
      );

      const details = {};
      list.forEach((r, idx) => {
        details[r.id] = detailResults[idx]?.data?.data;
      });
      setRoadmapDetails(details);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải lộ trình.");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicId) => {
    navigate(`/dashboard/student/grammar/topics/${topicId}/theory`);
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
      {/* HERO */}
      <div className={styles.hero}>
        <span className={styles.heroBadge}>
          <FontAwesomeIcon icon={faGraduationCap} />
          Roadmap học ngữ pháp
        </span>

        <h1 className={styles.heroTitle}>
          Lộ trình <span className={styles.heroHighlight}>Ngữ pháp TOEIC</span>
        </h1>

        {/* RENDER ĐÚNG THEO DATA */}
        <div className={styles.heroLevels}>
          {roadmaps.map((r, idx) => (
            <React.Fragment key={r.id}>
              <span style={{ color: r.color || "#0ea792" }}>
                {extractLevelNumber(r.name)}
              </span>
              {idx < roadmaps.length - 1 && (
                <span className={styles.heroArrow}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <p className={styles.heroDesc}>
          Học đúng thứ tự — từ nền tảng đến nâng cao. Mỗi cấp độ có các chủ điểm
          ngữ pháp cần chinh phục để đạt mục tiêu điểm số.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className={styles.statCards}>
        {roadmaps.map((r) => (
          <div
            key={r.id}
            className={styles.statCard}
            style={{ "--card-color": r.color || "#0ea792" }}
          >
            <span
              className={styles.statName}
              style={{ color: r.color || "#0ea792" }}
            >
              {r.name}
            </span>
            <span className={styles.statMeta}>
              <strong>{r.totalTopics || 0}</strong> chủ điểm
              <span className={styles.statDot}>·</span>
              <strong>{r.totalQuestions || 0}</strong> câu
            </span>
          </div>
        ))}
      </div>

      {/* TIMELINE */}
      <div className={styles.timeline}>
        {roadmaps.map((roadmap, index) => {
          const detail = roadmapDetails[roadmap.id];
          const topics = detail?.topics || [];
          const color = roadmap.color || "#0ea792";
          const isLast = index === roadmaps.length - 1;

          return (
            <div
              key={roadmap.id}
              className={styles.timelineItem}
              style={{ "--roadmap-color": color }}
            >
              <div className={styles.timelineIcon}>
                <div
                  className={styles.dividerIcon}
                  style={{ background: color }}
                >
                  <FontAwesomeIcon icon={index === 0 ? faCompass : faFire} />
                </div>
                {!isLast && <div className={styles.dividerLine} />}
              </div>

              <div className={styles.levelGrid}>
                {/* LEFT */}
                <div className={styles.levelCard}>
                  <span className={styles.levelBadge}>
                    {roadmap.levelLabel || `Cấp độ ${roadmap.level}`}
                  </span>

                  <div className={styles.levelTitleRow}>
                    <h2 className={styles.levelName}>{roadmap.name}</h2>
                    {roadmap.subtitle && (
                      <span
                        className={styles.levelSubtitleChip}
                        style={{
                          background: `${color}20`,
                          color: color,
                        }}
                      >
                        {roadmap.subtitle}
                      </span>
                    )}
                  </div>

                  {roadmap.description && (
                    <p className={styles.levelDesc}>{roadmap.description}</p>
                  )}
                </div>

                {/* RIGHT */}
                <div className={styles.lessonsPanel}>
                  <h3 className={styles.lessonsTitle} style={{ color: color }}>
                    <FontAwesomeIcon icon={faBookOpen} />
                    Chủ điểm cần học
                  </h3>

                  {topics.length === 0 ? (
                    <div className={styles.emptyTopics}>
                      <p>Chưa có chủ điểm nào được publish.</p>
                    </div>
                  ) : (
                    <div className={styles.topicList}>
                      {topics.map((t, idx) => (
                        <div
                          key={t.id}
                          className={styles.topicRow}
                          onClick={() => handleTopicClick(t.id)}
                        >
                          <span
                            className={styles.topicOrder}
                            style={{ background: color }}
                          >
                            {idx + 1}
                          </span>
                          <div className={styles.topicInfo}>
                            <span className={styles.topicName}>{t.name}</span>
                          </div>
                          <span className={styles.topicArrow}>
                            <FontAwesomeIcon icon={faArrowRight} />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentGrammarRoadmap;
