import { useEffect, useState } from "react";
import styles from "./TeacherManagement.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChevronLeft,
  faChevronRight,
  faTrash,
  faEye,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import teacherService from "../../../services/teacherService";
import { useLoading } from "../../../contexts/LoadingContext";

function TeacherManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [teacherList, setTeacherList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const startItem = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(currentPage * pageSize, totalElements);

  const fetchTeachers = async () => {
    try {
      showLoading();

      const response = await teacherService.getTeachers(
        currentPage,
        pageSize,
        searchTerm,
      );

      console.log("Teacher API:", response);

      const data = response.data.data;

      setTeacherList(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách giáo viên:", error);

      setTeacherList([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      hideLoading();
    }
  };

  // Gọi API khi đổi page hoặc search.
  // Debounce 500ms khi nhập search để tránh gọi API liên tục.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, searchTerm]);

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

  const handleDetail = (id) => {
    console.log("Xem chi tiết giáo viên:", id);
  };

  const handleDelete = (id) => {
    console.log("Xóa giáo viên:", id);
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.title}>Quản lý Giáo viên</h1>
          <p className={styles.subtitle}>
            Quản lý hồ sơ, vai trò và phân công giáo viên.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link to="/dashboard/admin/create-teacher" className={styles.addBtn}>
            <FontAwesomeIcon icon={faPlus} /> Thêm giáo viên mới
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <label className={styles.searchLabel}>Tìm kiếm</label>

          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.searchInput}
            />

            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          {loading ? (
            <div className={styles.loading}>Đang tải giáo viên...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã ID</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th className={styles.textRight}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {teacherList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.empty}>
                      Không có dữ liệu giáo viên
                    </td>
                  </tr>
                ) : (
                  teacherList.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.idCol}>#{item.id}</td>

                      <td>
                        <div className={styles.wordCell}>
                          <span className={styles.wordTitle}>
                            {item.fullName}
                          </span>
                        </div>
                      </td>

                      <td className={styles.pronunciationCol}>{item.email}</td>

                      <td>{item.gender}</td>

                      <td className={styles.dateCol}>{item.dateOfBirth}</td>

                      <td className={styles.textRight}>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.btnDetail}
                            onClick={() => handleDetail(item.id)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                            Xem chi tiết
                          </button>

                          <button
                            className={styles.btnDelete}
                            onClick={() => handleDelete(item.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className={styles.tableFooter}>
          <div className={styles.resultsInfo}>
            Hiển thị từ <b>{startItem}</b> đến <b>{endItem}</b> trong tổng số{" "}
            <b>{totalElements}</b> kết quả
          </div>

          <div className={styles.pagination}>
            <button
              className={styles.pageArrow}
              disabled={currentPage === 1 || loading}
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
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherManagement;
