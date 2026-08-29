import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faBookOpen,
  faCrown,
  faArrowRight,
  faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import topicService from "../../../../services/topicService";
import getImageUrl from "../../../../utils/imageUrl";
import { useLoading } from "../../../../contexts/LoadingContext";
import styles from "./StudentTopicList.module.css";

function StudentTopicList() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      showLoading();
      const response = await topicService.getTopicsForStudent();
      setTopics(response?.data?.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách topic:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách topic.",
      );
      setTopics([]);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleViewTopic = (topicId) => {
    navigate(`/dashboard/student/topics/${topicId}/lessons`);
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải danh sách bài học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <FontAwesomeIcon icon={faHeadphones} className={styles.heroIcon} />
            Khám phá bài học nghe
          </h1>
          <p className={styles.heroSubtitle}>
            Luyện kỹ năng nghe tiếng Anh với các bài học đa dạng từ cơ bản đến
            nâng cao
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <span className={styles.statsText}>
          <FontAwesomeIcon icon={faBookOpen} />
          {topics.length} topics
        </span>
        <span className={styles.statsText}>
          <FontAwesomeIcon icon={faPlayCircle} />
          {topics.reduce((sum, t) => sum + (t.lessonCount || 0), 0)} bài học
        </span>
      </div>

      {/* Topic Grid */}
      {topics.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faHeadphones} className={styles.emptyIcon} />
          <h3>Không có topic nào</h3>
          <p>Hiện chưa có topic nào. Hãy quay lại sau nhé!</p>
        </div>
      ) : (
        <div className={styles.topicGrid}>
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`${styles.topicCard} ${topic.isPremium ? styles.premium : ""}`}
              onClick={() => handleViewTopic(topic.id)}
            >
              {/* Image */}
              <div className={styles.cardImageWrapper}>
                {getImageUrl(topic.topicImage) ? (
                  <img
                    src={getImageUrl(topic.topicImage)}
                    alt={topic.title}
                    className={styles.cardImage}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={styles.cardImageFallback}
                  style={{
                    display: getImageUrl(topic.topicImage) ? "none" : "flex",
                  }}
                >
                  <FontAwesomeIcon icon={faHeadphones} />
                </div>

                {/* Premium Badge */}
                {topic.isPremium && (
                  <span className={styles.premiumBadge}>
                    <FontAwesomeIcon icon={faCrown} />
                    Premium
                  </span>
                )}

                {/* Lesson Count */}
                <span className={styles.lessonCountBadge}>
                  <FontAwesomeIcon icon={faBookOpen} />
                  {topic.lessonCount || 0} bài
                </span>
              </div>

              {/* Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{topic.title}</h3>
                {topic.description && (
                  <p className={styles.cardDescription}>{topic.description}</p>
                )}

                <button className={styles.viewBtn}>
                  Xem ngay
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentTopicList;
