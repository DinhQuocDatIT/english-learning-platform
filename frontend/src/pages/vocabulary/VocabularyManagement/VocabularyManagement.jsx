import { useEffect, useState } from "react";
import styles from "./VocabularyManagement.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import dictWordService from "../../../services/dictWordService";
import { useLoading } from "../../../contexts/LoadingContext";
import AuthStorage from "../../../services/AuthStorage";
import { toast } from "react-toastify";

function VocabularyManagement() {
  const [filters, setFilters] = useState({ keyword: "" });
  const { showLoading, hideLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const role = AuthStorage.getRole();
  const basePath =
    role === "ADMIN"
      ? "/dashboard/admin"
      : role === "TEACHER"
        ? "/dashboard/teacher"
        : "/dashboard";

  const startItem = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalElements);

  const fetchData = async () => {
    try {
      showLoading();
      setLoading(true);

      const response = await dictWordService.list(
        currentPage - 1,
        pageSize,
        filters.keyword,
      );

      const data = response.data.data;
      setVocabList(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách từ điển:", error);
      toast.error("Không thể lấy danh sách từ điển.");
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, filters.keyword]);

  const handleFilterChange = (e) => {
    setFilters({ keyword: e.target.value });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ keyword: "" });
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage, "...", totalPages];
  };

  const handleDetail = (id) => {
    navigate(`${basePath}/vocabulary/${id}`);
  };

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.title}>Kho từ điển</h1>
          <p className={styles.subtitle}>
            Xem kho từ điển Anh - Việt ({totalElements.toLocaleString()} từ).
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className={styles.filterCard}>
        <div className={styles.searchGroup}>
          <label className={styles.filterLabel}>Tìm kiếm</label>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Tìm từ vựng..."
              className={styles.searchInput}
            />
          </div>
        </div>

        <button
          type="button"
          className={styles.clearFiltersBtn}
          onClick={clearFilters}
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* TABLE */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          {loading ? (
            <div className={styles.loading}>Đang tải...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã ID</th>
                  <th>Từ vựng</th>
                  <th>Phát âm</th>
                  <th>Ngôn ngữ</th>
                  <th>Số nghĩa</th>
                  <th className={styles.textRight}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {vocabList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.empty}>
                      Không có từ vựng
                    </td>
                  </tr>
                ) : (
                  vocabList.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.idCol}>#{item.id}</td>
                      <td>
                        <div className={styles.wordCell}>
                          <span className={styles.wordTitle}>{item.word}</span>
                        </div>
                      </td>
                      <td className={styles.pronunciationCol}>
                        {item.pronunciation || "-"}
                      </td>
                      <td>
                        <span className={styles.badgeCount}>
                          {item.langCode === "en" ? "Anh" : "Việt"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.badgeCount}>
                          {item.meaningCount}
                        </span>
                      </td>
                      <td className={styles.textRight}>
                        <button
                          className={styles.actionDotsBtn}
                          onClick={() => handleDetail(item.id)}
                          title="Xem chi tiết"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        <div className={styles.tableFooter}>
          <div className={styles.resultsInfo}>
            Hiển thị từ <b>{startItem}</b> đến <b>{endItem}</b> trong tổng số{" "}
            <b>{totalElements.toLocaleString()}</b> kết quả
          </div>

          <div className={styles.pagination}>
            <button
              className={styles.pageArrow}
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(currentPage - 1)}
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
                  key={page}
                  className={`${styles.pageNumber} ${
                    currentPage === page ? styles.activePage : ""
                  }`}
                  disabled={loading}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              className={styles.pageArrow}
              disabled={
                currentPage === totalPages || totalPages === 0 || loading
              }
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VocabularyManagement;
