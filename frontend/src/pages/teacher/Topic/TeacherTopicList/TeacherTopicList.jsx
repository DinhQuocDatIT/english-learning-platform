import { useEffect, useState } from "react";
import styles from "./TeacherTopicList.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faHeadphones,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import topicService from "../../../../services/topicService";
import { useLoading } from "../../../../contexts/LoadingContext";
import getImageUrl from "../../../../utils/imageUrl";

function TeacherTopicList() {
  const navigate = useNavigate();

  const { showLoading, hideLoading } = useLoading();

  const [topics, setTopics] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 6;

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      showLoading();

      const response = await topicService.getPublishedTopics();

      const data = response?.data?.data;

      setTopics(Array.isArray(data) ? data : []);
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

  const filteredTopics = topics.filter((topic) => {
    const value = keyword.trim().toLowerCase();

    if (!value) return true;

    return (
      topic.title?.toLowerCase().includes(value) ||
      topic.description?.toLowerCase().includes(value)
    );
  });

  const totalElements = filteredTopics.length;

  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;

  const paginatedTopics = filteredTopics.slice(
    startIndex,
    startIndex + pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  const handleOpenTopic = (topicId) => {
    navigate(`/dashboard/teacher/topics/${topicId}`);
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage, "...", totalPages];
  };

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.title}>Chủ đề bài nghe</h1>

          <p className={styles.subtitle}>
            Chọn một chủ đề để quản lý các bài nghe của bạn.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className={styles.filterCard}>
        <div className={styles.searchGroup}>
          <label className={styles.filterLabel}>Tìm kiếm chủ đề</label>

          <div className={styles.searchInputWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên chủ đề..."
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className={styles.emptyState}>
          <h3>Đang tải danh sách chủ đề...</h3>
        </div>
      ) : paginatedTopics.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faImage} className={styles.emptyIcon} />

          <h3>Không tìm thấy chủ đề</h3>

          <p>Hiện chưa có chủ đề nào được phát hành.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {paginatedTopics.map((topic) => {
            const imageUrl = getImageUrl(topic.topicImage);

            return (
              <div
                key={topic.id}
                className={styles.card}
                onClick={() => handleOpenTopic(topic.id)}
              >
                {/* IMAGE */}
                <div className={styles.imageWrapper}>
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
                    className={styles.fallbackGradient}
                    style={{
                      display: imageUrl ? "none" : "flex",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faImage}
                      className={styles.fallbackIcon}
                    />
                  </div>

                  {/* LISTENING ICON */}
                  <div className={styles.lessonBadge}>
                    <FontAwesomeIcon icon={faHeadphones} />
                    Bài nghe
                  </div>
                </div>

                {/* BODY */}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{topic.title}</h3>

                  <p className={styles.cardDesc}>
                    {topic.description || "Chưa có mô tả"}
                  </p>

                  <div className={styles.cardAction}>
                    <span>Xem bài nghe</span>

                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className={styles.tableFooter}>
          <div className={styles.resultsInfo}>
            Hiển thị <b>{paginatedTopics.length}</b> / <b>{totalElements}</b>{" "}
            chủ đề
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageArrow}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`dots-${index}`} className={styles.pageDots}>
                    ...
                  </span>
                );
              }

              return (
                <button
                  type="button"
                  key={page}
                  className={`${styles.pageNumber} ${
                    currentPage === page ? styles.activePage : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              className={styles.pageArrow}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherTopicList;
