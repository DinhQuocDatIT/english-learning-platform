import { useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function VocabularyManagement() {
  const [filters, setFilters] = useState({
    status: "Tất cả trạng thái",
    createdDate: "",
    topicCategory: "Tất cả chủ đề",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const vocabList = [
    {
      id: "#V001",
      word: "Ubiquitous",
      meaning: "Có ở khắp mọi nơi, phổ biến.",
      pronunciation: "/juːˈbɪk.wɪ.təs/",
      meaningsCount: 2,
      createdDate: "12 Th10, 2023",
      status: "Đang hoạt động",
    },
    {
      id: "#V002",
      word: "Ephemeral",
      meaning: "Phù du, chóng tàn, ngắn ngủi.",
      pronunciation: "/ɪˈfem.ər.əl/",
      meaningsCount: 1,
      createdDate: "14 Th10, 2023",
      status: "Đang hoạt động",
    },
    {
      id: "#V003",
      word: "Sycophant",
      meaning: "Kẻ nịnh bợ, kẻ bợ đỡ...",
      pronunciation: "/ˈsɪk.ə.fənt/",
      meaningsCount: 3,
      createdDate: "18 Th10, 2023",
      status: "Ngừng hoạt động",
    },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "Tất cả trạng thái",
      createdDate: "",
      topicCategory: "Tất cả chủ đề",
    });
  };

  const toggleMenu = (id) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

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
          <button className={styles.filterBtn}>
            <FontAwesomeIcon icon={faFilter} /> Lọc
          </button>
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
              {vocabList.map((item) => (
                <tr key={item.id}>
                  <td className={styles.idCol}>{item.id}</td>
                  <td>
                    <div className={styles.wordCell}>
                      <span className={styles.wordTitle}>{item.word}</span>
                      <span className={styles.wordDesc}>{item.meaning}</span>
                    </div>
                  </td>
                  <td className={styles.pronunciationCol}>
                    {item.pronunciation}
                  </td>
                  <td>
                    <span className={styles.badgeCount}>
                      {item.meaningsCount}
                    </span>
                  </td>
                  <td className={styles.dateCol}>{item.createdDate}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${item.status === "Đang hoạt động" ? styles.activeStatus : styles.inactiveStatus}`}
                    >
                      {item.status}
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={styles.tableFooter}>
          <div className={styles.resultsInfo}>
            Hiển thị từ <b>1</b> đến <b>10</b> trong tổng số <b>97</b> kết quả
          </div>
          <div className={styles.pagination}>
            <button className={styles.pageArrow} disabled={currentPage === 1}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className={`${styles.pageNumber} ${currentPage === 1 ? styles.activePage : ""}`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              className={`${styles.pageNumber} ${currentPage === 2 ? styles.activePage : ""}`}
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <button
              className={`${styles.pageNumber} ${currentPage === 3 ? styles.activePage : ""}`}
              onClick={() => setCurrentPage(3)}
            >
              3
            </button>
            <span className={styles.pageDots}>...</span>
            <button className={styles.pageArrow}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VocabularyManagement;
