import { useEffect, useState } from "react";
import styles from "./StudentManagement.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChevronLeft,
  faChevronRight,
  faEye,
  faSearch,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import studentService from "../../../../services/studentService";
import { useLoading } from "../../../../contexts/LoadingContext";
import { toast } from "react-toastify";

function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  const startItem = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(currentPage * pageSize, totalElements);

  // =========================
  // LẤY DANH SÁCH HỌC SINH
  // =========================
  const fetchStudents = async () => {
    try {
      setLoading(true);
      showLoading();

      const response = await studentService.getStudents(
        currentPage,
        pageSize,
        searchTerm,
      );

      console.log("Student API:", response);

      const data = response.data.data;

      setStudentList(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Lỗi lấy danh sách học sinh:", error);

      setStudentList([]);
      setTotalElements(0);
      setTotalPages(0);

      toast.error(
        error.response?.data?.message || "Không thể lấy danh sách học sinh.",
      );
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  // =========================
  // SEARCH + PAGINATION
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, searchTerm]);

  // =========================
  // PHÂN TRANG
  // =========================
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

  // =========================
  // XEM CHI TIẾT
  // =========================
  const handleDetail = (id) => {
    navigate(`/dashboard/admin/student-detail/${id}`);
  };

  // =========================
  // KHÓA TÀI KHOẢN
  // =========================
  const handleDeactivate = async (student) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn khóa tài khoản học sinh ${student.fullName} không?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      showLoading();

      await studentService.deactivateStudent(student.id);

      toast.success("Khóa tài khoản học sinh thành công!");

      await fetchStudents();
    } catch (error) {
      console.error("Lỗi khóa tài khoản học sinh:", error);

      toast.error(
        error.response?.data?.message || "Khóa tài khoản học sinh thất bại.",
      );
    } finally {
      hideLoading();
    }
  };

  // =========================
  // MỞ KHÓA TÀI KHOẢN
  // =========================
  const handleActivate = async (student) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn mở khóa tài khoản của học sinh ${student.fullName} không?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      showLoading();

      await studentService.activateStudent(student.id);

      toast.success("Mở khóa tài khoản học sinh thành công!");

      await fetchStudents();
    } catch (error) {
      console.error("Lỗi mở khóa tài khoản học sinh:", error);

      toast.error(
        error.response?.data?.message || "Mở khóa tài khoản học sinh thất bại.",
      );
    } finally {
      hideLoading();
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.title}>Quản lý Học sinh</h1>

          <p className={styles.subtitle}>
            Quản lý hồ sơ và trạng thái tài khoản học sinh.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link to="/dashboard/admin/create-student" className={styles.addBtn}>
            <FontAwesomeIcon icon={faPlus} />
            Thêm học sinh mới
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
              placeholder="Tìm kiếm theo ID, tên, email"
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
            <div className={styles.loading}>Đang tải học sinh...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã ID</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Trạng thái</th>
                  <th className={styles.textRight}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {studentList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.empty}>
                      Không có dữ liệu học sinh
                    </td>
                  </tr>
                ) : (
                  studentList.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.idCol}>{item.id}</td>

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

                      <td>
                        {item.deletedAt ? (
                          <span className={styles.statusLocked}>Đã khóa</span>
                        ) : (
                          <span className={styles.statusActive}>
                            Đang hoạt động
                          </span>
                        )}
                      </td>

                      <td className={styles.textRight}>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.btnDetail}
                            onClick={() => handleDetail(item.id)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                            Xem chi tiết
                          </button>

                          {item.deletedAt == null ? (
                            <button
                              className={styles.btnDelete}
                              onClick={() => handleDeactivate(item)}
                            >
                              <FontAwesomeIcon icon={faLock} />
                              Khóa tài khoản
                            </button>
                          ) : (
                            <button
                              className={styles.btnActivate}
                              onClick={() => handleActivate(item)}
                            >
                              <FontAwesomeIcon icon={faLockOpen} />
                              Mở khóa
                            </button>
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

export default StudentManagement;
