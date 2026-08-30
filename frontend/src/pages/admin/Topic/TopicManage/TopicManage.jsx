import { useEffect, useState } from "react";
import styles from "./TopicManage.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEllipsisV,
  faCalendarAlt,
  faUser,
  faChevronLeft,
  faChevronRight,
  faImage,
  faSearch,
  faEye,
  faEyeSlash,
  faFileLines,
  faEdit,
  faHeadphones,
  faBookOpen, // THÊM ICON NÀY
} from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

import topicService from "../../../../services/topicService";
import { useLoading } from "../../../../contexts/LoadingContext";
import { formatDateTime } from "../../../../utils/formatDate";
import getImageUrl from "../../../../utils/imageUrl";

function TopicManage() {
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [loading, setLoading] = useState(false);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      showLoading();

      const response = await topicService.getAll();
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

  useEffect(() => {
    fetchTopics();
  }, []);


  const filteredTopics = topics.filter((topic) => {
    const keyword = filters.keyword.trim().toLowerCase();

    const matchKeyword =
      !keyword ||
      topic.title?.toLowerCase().includes(keyword) ||
      topic.description?.toLowerCase().includes(keyword);

    const matchStatus = !filters.status || topic.status === filters.status;

    return matchKeyword && matchStatus;
  });



  const totalElements = filteredTopics.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;

  const paginatedTopics = filteredTopics.slice(
    startIndex,
    startIndex + pageSize,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: "",
      status: "",
    });

    setCurrentPage(1);
  };


  const getStatusLabel = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "Đang hiển thị";

      case "HIDDEN":
        return "Đang ẩn";

      default:
        return "Không xác định";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PUBLISHED":
        return styles.publishedStatus;

      case "HIDDEN":
        return styles.hiddenStatus;

      default:
        return styles.defaultStatus;
    }
  };

  const getStatusIcon = (status) => {
    return status === "PUBLISHED" ? faEye : faEyeSlash;
  };


  const handleCardClick = (topicId) => {
    navigate(`/dashboard/admin/topics/${topicId}/listening-lessons`);
  };

  const handleView = (topic) => {
    setActiveMenuId(null);
    navigate(`/dashboard/admin/topic/${topic.id}`);
  };

  const handleEdit = (topic) => {
    setActiveMenuId(null);
    navigate(`/dashboard/admin/edit-topic/${topic.id}`);
  };

  const handleChangeStatus = async (topic) => {
    setActiveMenuId(null);

    const shouldPublish = topic.status !== "PUBLISHED";
    const actionText = shouldPublish ? "hiển thị" : "ẩn";

    const confirmed = window.confirm(
      `Bạn có chắc muốn ${actionText} topic "${topic.title}" không?`,
    );

    if (!confirmed) return;

    try {
      showLoading();

      if (shouldPublish) {
        await topicService.publish(topic.id);
      } else {
        await topicService.hide(topic.id);
      }

      toast.success(
        shouldPublish ? "Hiển thị topic thành công!" : "Ẩn topic thành công!",
      );

      await fetchTopics();
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái topic:", error);

      toast.error(
        error.response?.data?.message || "Không thể thay đổi trạng thái topic.",
      );
    } finally {
      hideLoading();
    }
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
          <h1 className={styles.title}>Quản lý Chủ Đề</h1>

          <p className={styles.subtitle}>Quản lý các chủ đề trong hệ thống.</p>
        </div>

        {/* THÊM TOPIC */}

        <Link className={styles.addBtn} to="/dashboard/admin/create-topic">
          <FontAwesomeIcon icon={faPlus} />
          Thêm chủ đề mới
        </Link>
      </div>

      {/* FILTER */}

      <div className={styles.filterCard}>
        <div className={styles.searchGroup}>
          <label className={styles.filterLabel}>Tìm kiếm</label>

          <div className={styles.searchInputWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />

            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Tìm theo tiêu đề, mô tả..."
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Trạng thái</label>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className={styles.selectInput}
          >
            <option value="">Tất cả</option>
            <option value="PUBLISHED">Đang hiển thị</option>
            <option value="HIDDEN">Đang ẩn</option>
          </select>
        </div>

        <button
          type="button"
          className={styles.clearFiltersBtn}
          onClick={handleClearFilters}
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* CONTENT */}

      {loading ? (
        <div className={styles.emptyState}>
          <h3>Đang tải danh sách topic...</h3>
        </div>
      ) : paginatedTopics.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faImage} className={styles.emptyIcon} />

          <h3>Không tìm thấy chủ đề nào</h3>

          <p>Hiện chưa có topic nào trong hệ thống.</p>

          <Link className={styles.addBtn} to="/dashboard/admin/create-topic">
            <FontAwesomeIcon icon={faPlus} />
            Tạo topic
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {paginatedTopics.map((topic) => {
            const imageUrl = getImageUrl(topic.topicImage);

            return (
              <div
                key={topic.id}
                className={styles.card}
                onClick={() => handleCardClick(topic.id)}
                style={{ cursor: "pointer" }}
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

                  {/* LESSON BADGE - Số bài nghe */}

                  <div className={styles.lessonBadge}>
                    <FontAwesomeIcon icon={faHeadphones} />
                    {topic.lessonCount || 0} bài nghe
                  </div>

                  {/* STATUS */}

                  <span
                    className={`${styles.statusBadge} ${getStatusClass(
                      topic.status,
                    )}`}
                  >
                    <FontAwesomeIcon icon={getStatusIcon(topic.status)} />

                    {getStatusLabel(topic.status)}
                  </span>

                  {/* MENU */}

                  <div className={styles.actionContainer}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();

                        setActiveMenuId(
                          activeMenuId === topic.id ? null : topic.id,
                        );
                      }}
                    >
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </button>

                    {activeMenuId === topic.id && (
                      <div className={styles.dropdownMenu}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(topic);
                          }}
                        >
                          <FontAwesomeIcon icon={faFileLines} />
                          Xem chi tiết
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(topic);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          Chỉnh sửa
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeStatus(topic);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={
                              topic.status === "PUBLISHED" ? faEyeSlash : faEye
                            }
                          />

                          {topic.status === "PUBLISHED"
                            ? "Ẩn topic"
                            : "Hiện topic"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* BODY */}

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{topic.title}</h3>

                  <p className={styles.cardDesc}>
                    {topic.description || "Chưa có mô tả"}
                  </p>

                  <div className={styles.metadata}>
                    <div className={styles.metaItem}>
                      <FontAwesomeIcon icon={faUser} />
                      <span>{topic.createdByName || "Giảng viên"}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>
                        {topic.createdAt
                          ? formatDateTime(topic.createdAt).split(" ")[0]
                          : "Gần đây"}
                      </span>
                    </div>

                    {/* THÊM SỐ LƯỢNG BÀI HỌC VÀO METADATA */}
                    <div className={styles.metaItem}>
                      <FontAwesomeIcon icon={faBookOpen} />
                      <span>{topic.lessonCount || 0} bài học</span>
                    </div>
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
            chủ đề · Trang <b>{currentPage}</b> / <b>{totalPages}</b>
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

export default TopicManage;