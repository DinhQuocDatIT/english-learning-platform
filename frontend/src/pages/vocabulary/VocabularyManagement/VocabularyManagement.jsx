import { useEffect, useState } from "react";
import styles from "./VocabularyManagement.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faPlus,
  faCalendarAlt,
  faChevronLeft,
  faChevronRight,
  faEllipsisV,
  faEdit,
  faTrash,
  faFileImport,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import vocabulary from "../../../services/vocabulary";
import { useLoading } from "../../../contexts/LoadingContext";
import { formatDateTime } from "../../../utils/formatDate";

function VocabularyManagement() {
  const [filters, setFilters] = useState({
    status: "Tất cả trạng thái",
    createdDate: "",
    topicCategory: "Tất cả chủ đề",
  });
  const { showLoading, hideLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const fetchVocabularies = async () => {
    try {
      showLoading();
      setLoading(true);
      const response = await vocabulary.getAllByPage(currentPage, pageSize);

      const data = response.data.data;
      console.log(data);
      setVocabList(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách từ vựng:", error);
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularies();
  }, [currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: "Tất cả trạng thái",
      createdDate: "",
      topicCategory: "Tất cả chủ đề",
    });
    setCurrentPage(1);
  };

  const toggleMenu = (id) => {
    setActiveMenuId(activeMenuId === id ? null : id);
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

  const startItem = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalElements);

  return (
    <div className={styles.wrapper}>
      {/* Header section */}
      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.title}>Quản lý Từ vựng</h1>
          <p className={styles.subtitle}>
            Quản lý và kiểm duyệt cơ sở dữ liệu thuật ngữ cốt lõi.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            to={"/dashboard/admin/import-vocabulary"}
            className={styles.filterBtn}
          >
            <FontAwesomeIcon icon={faFileImport} /> Import CSV
          </Link>
          <Link
            to={"/dashboard/admin/create-vocabulary"}
            className={styles.addBtn}
          >
            <FontAwesomeIcon icon={faPlus} /> Thêm từ vựng
          </Link>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className={styles.filterCard}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Trạng thái</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className={styles.selectInput}
          >
            <option>Tất cả trạng thái</option>
            <option>Đang hoạt động</option>
            <option>Ngừng hoạt động</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Ngày tạo</label>
          <div className={styles.dateInputWrapper}>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              name="createdDate"
              value={filters.createdDate}
              onChange={handleFilterChange}
              className={styles.dateInput}
            />
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className={styles.calendarIcon}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Danh mục chủ đề</label>
          <select
            name="topicCategory"
            value={filters.topicCategory}
            onChange={handleFilterChange}
            className={styles.selectInput}
          >
            <option>Tất cả chủ đề</option>
            <option>Kinh doanh</option>
            <option>Học thuật</option>
            <option>Công nghệ</option>
          </select>
        </div>

        <button className={styles.clearFiltersBtn} onClick={clearFilters}>
          Xóa bộ lọc
        </button>
      </div>

      {/* Table Section */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          {loading ? (
            <div className={styles.loading}>Đang tải từ vựng...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã ID</th>
                  <th>Từ vựng</th>
                  <th>Phát âm</th>
                  <th>Số ý nghĩa</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th className={styles.textRight}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {vocabList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.empty}>
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
                          <span className={styles.wordDesc}>
                            {item.meanings?.[0]?.meaning}
                          </span>
                        </div>
                      </td>
                      <td className={styles.pronunciationCol}>
                        {item.pronunciation}
                      </td>
                      <td>
                        <span className={styles.badgeCount}>
                          {item.meanings?.length || 0}
                        </span>
                      </td>
                      <td className={styles.dateCol}>
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${item.deletedAt === null ? styles.activeStatus : styles.inactiveStatus}`}
                        >
                          {item.deletedAt === null ? "Hoạt động" : "Ẩn"}
                        </span>
                      </td>
                      <td className={styles.textRight}>
                        <div className={styles.actionWrapper}>
                          <button
                            className={styles.actionDotsBtn}
                            onClick={() => toggleMenu(item.id)}
                          >
                            <FontAwesomeIcon icon={faEllipsisV} />
                          </button>
                          {activeMenuId === item.id && (
                            <div className={styles.dropdownMenu}>
                              <button>
                                <FontAwesomeIcon icon={faEdit} /> Sửa
                              </button>
                              <button className={styles.deleteOption}>
                                <FontAwesomeIcon icon={faTrash} /> Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className={styles.tableFooter}>
          <div className={styles.resultsInfo}>
            Hiển thị từ <b>{startItem}</b> đến <b>{endItem}</b> trong tổng số{" "}
            <b>{totalElements}</b> kết quả
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
                  className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ""}`}
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
