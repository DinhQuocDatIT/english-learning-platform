import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faImage,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import styles from "./TopicDetail.module.css";
import topicService from "../../../../services/topicService";
import { useLoading } from "../../../../contexts/LoadingContext";
import { formatDateTime } from "../../../../utils/formatDate";

function TopicDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoading();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const baseUrl = import.meta.env.VITE_API_URL || "";

    return `${baseUrl.replace(/\/api\/?$/, "")}${imagePath}`;
  };

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      showLoading();

      const response = await topicService.getById(id);

      const foundTopic = response?.data?.data;

      if (!foundTopic) {
        throw new Error("Không tìm thấy topic.");
      }

      setTopic(foundTopic);
    } catch (error) {
      console.error("Lỗi lấy chi tiết topic:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải thông tin topic.";

      toast.error(message);

      navigate("/dashboard/teacher/topics");
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải thông tin topic...</div>
      </div>
    );
  }

  if (!topic) {
    return null;
  }

  const imageUrl = getImageUrl(topic.topicImage);

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* TITLE */}
      <div className={styles.titleSection}>
        <div>
          <h1>Chi tiết Topic</h1>

          <p>Xem thông tin topic của bạn.</p>
        </div>

        <button
          type="button"
          className={styles.editButton}
          onClick={() => navigate(`/dashboard/teacher/topics/${topic.id}/edit`)}
        >
          <FontAwesomeIcon icon={faEdit} />
          Chỉnh sửa
        </button>
      </div>

      {/* DETAIL */}
      <div className={styles.detailCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2>{topic.title}</h2>

            <p>
              Tạo lúc{" "}
              {topic.createdAt
                ? formatDateTime(topic.createdAt)
                : "Không xác định"}
            </p>
          </div>
        </div>

        <div className={styles.detailGrid}>
          {/* IMAGE */}
          <div className={styles.imageSection}>
            <div className={styles.sectionLabel}>
              <FontAwesomeIcon icon={faImage} />
              <span>Ảnh Topic</span>
            </div>

            <div className={styles.imageBox}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={topic.title}
                  className={styles.topicImage}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";

                    const fallback = e.currentTarget.nextElementSibling;

                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />
              ) : null}

              <div
                className={styles.imageFallback}
                style={{
                  display: imageUrl ? "none" : "flex",
                }}
              >
                <FontAwesomeIcon icon={faImage} />
                <span>Chưa có ảnh</span>
              </div>
            </div>
          </div>

          {/* INFO */}
          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Tiêu đề</span>

              <strong>{topic.title || "Chưa có tiêu đề"}</strong>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Mô tả</span>

              <p className={styles.description}>
                {topic.description || "Chưa có mô tả."}
              </p>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Người tạo</span>

              <strong>{topic.createdByName || ""}</strong>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Ngày tạo</span>

              <strong className={styles.date}>
                {topic.createdAt
                  ? formatDateTime(topic.createdAt)
                  : "Không xác định"}
              </strong>
            </div>

            {topic.updatedAt && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Cập nhật lần cuối</span>

                <strong className={styles.date}>
                  {formatDateTime(topic.updatedAt)}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INFO MESSAGE */}
      <div className={styles.infoMessage}>
        <div className={styles.infoMessageIcon}>
          <FontAwesomeIcon icon={faEdit} />
        </div>

        <div>
          <strong>Thông tin Topic</strong>

          <p>
            Bạn có thể chỉnh sửa nội dung topic bất cứ lúc nào bằng nút{" "}
            <strong>Chỉnh sửa</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TopicDetail;
