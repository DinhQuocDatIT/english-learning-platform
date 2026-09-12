import React, { useEffect, useState } from "react";
import styles from "./PaymentHistoryPage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faReceipt,
  faDollarSign,
  faCheckCircle,
  faClock,
  faSearch,
  faEye,
  faTimes,
  faUser,
  faCalendarAlt,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import paymentService from "../../../../services/paymentService";
import { useLoading } from "../../../../contexts/LoadingContext";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "EXPIRED", label: "Đã hết hạn" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function PaymentHistoryPage() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [history, setHistory] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  // Filters
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy] = useState("createdAt");
  const [direction] = useState("desc");

  // Modal
  const [selected, setSelected] = useState(null);

  // ===== Debounce keyword =====
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(t);
  }, [keyword]);

  // ===== Load summary =====
  useEffect(() => {
    paymentService
      .getPaymentSummary()
      .then((res) => setSummary(res.data?.data ?? null))
      .catch((err) => console.error("Lỗi summary:", err));
  }, []);

  // ===== Load history =====
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        showLoading();
        setError("");

        const res = await paymentService.getPaymentHistory({
          status: status || undefined,
          keyword: debouncedKeyword || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page,
          size,
          sortBy,
          direction,
        });

        setHistory(res.data?.data ?? null);
      } catch (err) {
        console.error("Lỗi khi lấy lịch sử thanh toán:", err);
        setError(
          err.response?.data?.message || "Không thể tải lịch sử thanh toán.",
        );
      } finally {
        hideLoading();
      }
    };

    fetchHistory();
  }, [
    debouncedKeyword,
    status,
    fromDate,
    toDate,
    page,
    size,
    sortBy,
    direction,
  ]);

  // ===== Handlers =====
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0);
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0);
  };

  const resetFilters = () => {
    setKeyword("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  // ===== Formatters =====
  const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");

  const formatDateTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStatusBadge = (statusValue) => {
    if (statusValue === "ACTIVE") {
      return (
        <span className={`${styles.statusBadge} ${styles.statusActive}`}>
          <span className={styles.dotActive} />
          Đang hoạt động
        </span>
      );
    }
    return (
      <span className={`${styles.statusBadge} ${styles.statusExpired}`}>
        <FontAwesomeIcon icon={faClock} />
        Đã hết hạn
      </span>
    );
  };

  return (
    <div className={styles.container}>
      {/* Back */}
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => navigate("/dashboard/admin/membership-package")}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Quay lại quản lý gói</span>
      </button>

      {/* Header */}
      {/* <div className={styles.headerSection}>
        <div>
          <h1 className={styles.pageTitle}>Lịch sử thanh toán</h1>
          <p className={styles.subtitle}>
            Theo dõi các giao dịch mua gói thành viên và hoạt động thanh toán
            trên toàn hệ thống.
          </p>
        </div>
      </div> */}

      {/* Summary */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconBox}>
              <FontAwesomeIcon icon={faDollarSign} />
            </div>
            <span className={styles.statLabel}>TỔNG DOANH THU</span>
          </div>
          <div className={styles.statNumber}>
            {formatCurrency(summary?.totalSpent)} VNĐ
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconBox}>
              <FontAwesomeIcon icon={faReceipt} />
            </div>
            <span className={styles.statLabel}>TỔNG GIAO DỊCH</span>
          </div>
          <div className={styles.statNumber}>
            {Number(summary?.totalOrders || 0).toLocaleString("vi-VN")}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconBox}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <span className={styles.statLabel}>ĐANG HOẠT ĐỘNG</span>
          </div>
          <div className={styles.statNumber}>
            {Number(summary?.activeOrders || 0).toLocaleString("vi-VN")}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconBox}>
              <FontAwesomeIcon icon={faClock} />
            </div>
            <span className={styles.statLabel}>ĐÃ HẾT HẠN</span>
          </div>
          <div className={styles.statNumber}>
            {Number(summary?.expiredOrders || 0).toLocaleString("vi-VN")}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Tìm kiếm</label>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Mã giao dịch, tên, email, gói..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Trạng thái</label>
          <select
            className={styles.filterSelect}
            value={status}
            onChange={handleStatusChange}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Từ ngày</label>
          <input
            type="date"
            className={styles.filterSelect}
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Đến ngày</label>
          <input
            type="date"
            className={styles.filterSelect}
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Số dòng</label>
          <select
            className={styles.filterSelect}
            value={size}
            onChange={handleSizeChange}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} / trang
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>&nbsp;</label>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={resetFilters}
          >
            Xoá lọc
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {!error && history && history.empty && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faSearch} className={styles.emptyIcon} />
          <p>Không tìm thấy giao dịch nào.</p>
        </div>
      )}

      {!error && history && !history.empty && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Khách hàng</th>
                  <th>Gói</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán lúc</th>
                  <th aria-label="Thao tác"></th>
                </tr>
              </thead>

              <tbody>
                {history.content.map((item) => (
                  <tr
                    key={item.id}
                    className={styles.row}
                    onClick={() => setSelected(item)}
                  >
                    <td className={styles.tdId}>{item.id}</td>

                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.userName}>
                          {item.userName || "—"}
                        </span>
                        <span className={styles.userEmail}>
                          {item.userEmail || "—"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={styles.packageName}>
                        {item.packageName}
                      </span>
                    </td>

                    <td className={styles.tdPrice}>
                      {formatCurrency(item.paidPrice)} VNĐ
                    </td>

                    <td>{renderStatusBadge(item.status)}</td>

                    <td className={styles.tdDate}>
                      {formatDateTime(item.paidAt)}
                    </td>

                    <td className={styles.tdAction}>
                      <button
                        type="button"
                        className={styles.viewBtn}
                        aria-label={`Xem giao dịch ${item.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(item);
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Trang {history.pageable.pageNumber + 1} / {history.totalPages} —{" "}
              {history.totalElements} giao dịch
            </span>

            <div className={styles.paginationButtons}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={history.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Trước
              </button>

              <button
                type="button"
                className={styles.pageBtn}
                disabled={history.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== Detail Modal ===== */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 id="transaction-detail-title" className={styles.modalTitle}>
                  Giao dịch {selected.id}
                </h3>
                <p className={styles.modalSubtitle}>
                  Chi tiết giao dịch thanh toán
                </p>
              </div>

              <button
                type="button"
                className={styles.modalCloseBtn}
                aria-label="Đóng"
                onClick={() => setSelected(null)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Customer */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>
                  <FontAwesomeIcon icon={faUser} />
                  Khách hàng
                </h4>

                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Tên</span>
                    <span className={styles.detailValue}>
                      {selected.userName || "—"}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email</span>
                    <span className={styles.detailValue}>
                      {selected.userEmail || "—"}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Mã người dùng</span>
                    <span className={styles.detailValue}>
                      {selected.userId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Membership */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>
                  <FontAwesomeIcon icon={faBoxOpen} />
                  Gói thành viên
                </h4>

                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Tên gói</span>
                    <span className={styles.detailValue}>
                      {selected.packageName || "—"}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Thời hạn</span>
                    <span className={styles.detailValue}>
                      {selected.durationDays
                        ? `${selected.durationDays} ngày`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>
                  <FontAwesomeIcon icon={faReceipt} />
                  Thanh toán
                </h4>

                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Mã giao dịch</span>
                    <span className={styles.detailValue}>{selected.id}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Số tiền</span>
                    <span
                      className={`${styles.detailValue} ${styles.detailPrice}`}
                    >
                      {formatCurrency(selected.paidPrice)} VNĐ
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Thanh toán lúc</span>
                    <span className={styles.detailValue}>
                      {formatDateTime(selected.paidAt)}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Trạng thái</span>
                    <span className={styles.detailValue}>
                      {renderStatusBadge(selected.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validity */}
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Hiệu lực
                </h4>

                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Ngày bắt đầu</span>
                    <span className={styles.detailValue}>
                      {formatDate(selected.startDate)}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Ngày kết thúc</span>
                    <span className={styles.detailValue}>
                      {formatDate(selected.endDate)}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Còn lại</span>
                    <span className={styles.detailValue}>
                      {selected.status === "ACTIVE" &&
                      selected.remainingDays > 0
                        ? `${selected.remainingDays} ngày`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCloseFooterBtn}
                onClick={() => setSelected(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentHistoryPage;
