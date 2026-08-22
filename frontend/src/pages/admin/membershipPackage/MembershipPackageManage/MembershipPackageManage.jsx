import React, { useEffect, useState } from "react";
import styles from "./MembershipPackageManage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUsers,
  faBox,
  faDollarSign,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import membershipPackageService from "../../../../services/membershipPackageService";
import { useLoading } from "../../../../contexts/LoadingContext";
import { formatDuration } from "../../../../utils/MembershipPackageManage";
import ConfirmPackageStatusModal from "../../../../components/ConfirmPackageStatusModal/ConfirmPackageStatusModal";

function MembershipPackageManage() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");

  const { showLoading, hideLoading } = useLoading();
  const [statusModal, setStatusModal] = useState({
    open: false,
    packageId: null,
    packageName: "",
    isInactive: false,
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPackages: 0,
    totalRevenue: 0,
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const fetchPackages = async () => {
    try {
      showLoading();
      setError("");

      const response = await membershipPackageService.getAll();

      setPackages(response.data?.data ?? []);
      console.log(response.data?.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách gói:", err);

      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách gói thành viên.",
      );
    } finally {
      hideLoading();
    }
  };
  const fetchStats = async () => {
    try {
      const response = await membershipPackageService.getStats();

      setStats(
        response.data?.data ?? {
          totalUsers: 0,
          totalPackages: 0,
          totalRevenue: 0,
        },
      );
    } catch (err) {
      console.error("Lỗi khi lấy thống kê:", err);
    }
  };
  useEffect(() => {
    fetchPackages();
    fetchStats();
  }, []);
  const openStatusModal = (pkg) => {
    setStatusModal({
      open: true,
      packageId: pkg.id,
      packageName: pkg.name,
      isInactive: pkg.status === "INACTIVE",
    });
  };

  const closeStatusModal = () => {
    if (statusLoading) return;

    setStatusModal({
      open: false,
      packageId: null,
      packageName: "",
      isInactive: false,
    });
  };

  const handleConfirmStatus = async () => {
    try {
      setStatusLoading(true);
      setError("");

      if (statusModal.isInactive) {
        await membershipPackageService.activate(statusModal.packageId);
      } else {
        await membershipPackageService.deactivate(statusModal.packageId);
      }

      closeStatusModal();

      await fetchPackages();
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái gói:", err);

      setError(
        err.response?.data?.message ||
          "Không thể thay đổi trạng thái gói thành viên.",
      );
    } finally {
      setStatusLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý Gói Đăng Ký</h1>

          <p className={styles.subtitle}>
            Theo dõi và quản lý các gói thành viên của hệ thống.
          </p>
        </div>

        <button
          type="button"
          className={styles.addPlanBtn}
          onClick={() => navigate("/dashboard/admin/add-membership-package")}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm gói mới</span>
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconBox}>
              <FontAwesomeIcon icon={faUsers} />
            </div>

            <span className={styles.statLabel}>TỔNG NGƯỜI DÙNG</span>
          </div>

          <div className={styles.statNumber}>
            {" "}
            {Number(stats.totalUsers).toLocaleString("vi-VN")}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconBox}>
              <FontAwesomeIcon icon={faBox} />
            </div>

            <span className={styles.statLabel}>GÓI ĐANG HOẠT ĐỘNG</span>
          </div>

          <div className={styles.statNumber}>
            {Number(stats.totalPackages).toLocaleString("vi-VN")}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconBox}>
              <FontAwesomeIcon icon={faDollarSign} />
            </div>

            <span className={styles.statLabel}>DOANH THU (MRR)</span>
          </div>

          <div className={styles.statNumber}>
            {" "}
            {Number(stats.totalRevenue).toLocaleString("vi-VN")} VNĐ
          </div>
        </div>
      </div>

      <div className={styles.sectionTitleArea}>
        <h2 className={styles.sectionTitle}>Danh sách Gói dịch vụ</h2>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {!error && packages.length === 0 && (
        <div className={styles.emptyState}>Chưa có gói thành viên nào.</div>
      )}

      {!error && packages.length > 0 && (
        <div className={styles.plansGrid}>
          {packages.map((pkg) => {
            const isInactive = pkg.status === "INACTIVE";

            return (
              <div
                key={pkg.id}
                className={`${styles.planCard} ${
                  pkg.isFeatured ? styles.popularPlanCard : ""
                }`}
              >
                {pkg.isFeatured && (
                  <div className={styles.popularBadgeTop}>Phổ biến nhất</div>
                )}

                <div className={styles.planCardTopInfo}>
                  <span
                    className={`${styles.planBadge} ${
                      pkg.isFeatured ? styles.badgeProposal : ""
                    }`}
                  >
                    {pkg.isFeatured
                      ? "Đề xuất"
                      : Number(pkg.price) === 0
                        ? "Cơ bản"
                        : "Khởi đầu"}
                  </span>

                  <span
                    className={`${styles.statusBadge} ${
                      isInactive ? styles.statusLocked : styles.statusActive
                    }`}
                  >
                    {isInactive ? (
                      <>
                        <FontAwesomeIcon icon={faLock} />
                        Tạm dừng
                      </>
                    ) : (
                      <>
                        <span className={styles.dotActive} />
                        Hoạt động
                      </>
                    )}
                  </span>
                </div>

                <div className={styles.planNameAndPrice}>
                  <h3 className={styles.planName}>{pkg.name}</h3>

                  <div className={styles.priceWrapper}>
                    <span className={styles.priceValue}>
                      {Number(pkg.price).toLocaleString("vi-VN")}
                    </span>

                    <span className={styles.pricePeriod}>VNĐ</span>
                  </div>

                  <p className={styles.planDuration}>
                    Thời hạn: {formatDuration(pkg.duration)}
                  </p>
                  <p className={styles.subscriberCount}>
                    {Number(pkg.totalSubscribers || 0).toLocaleString("vi-VN")}{" "}
                    người đăng ký
                  </p>
                </div>

                <div className={styles.planCardActions}>
                  <button
                    type="button"
                    className={styles.detailBtn}
                    onClick={() =>
                      navigate(`/dashboard/admin/membership-package/${pkg.id}`)
                    }
                  >
                    Xem chi tiết
                  </button>

                  <div className={styles.actionButtonRow}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() =>
                        navigate(
                          `/dashboard/admin/membership-package/${pkg.id}/edit`,
                        )
                      }
                    >
                      Sửa
                    </button>

                    <button
                      type="button"
                      className={`${styles.lockToggleBtn} ${
                        isInactive ? styles.unlockAction : styles.lockAction
                      }`}
                      onClick={() => openStatusModal(pkg)}
                    >
                      {isInactive ? "Bật lại" : "Tạm dừng"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmPackageStatusModal
        isOpen={statusModal.open}
        packageName={statusModal.packageName}
        isInactive={statusModal.isInactive}
        loading={statusLoading}
        onClose={closeStatusModal}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
}

export default MembershipPackageManage;
