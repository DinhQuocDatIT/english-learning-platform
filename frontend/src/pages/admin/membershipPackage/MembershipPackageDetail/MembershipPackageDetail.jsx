import React, { useEffect, useState } from "react";
import styles from "./MembershipPackageDetail.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faArrowLeft,
  faLock,
  faUnlock,
  faPenToSquare,
  faCircleInfo,
  faServer,
  faEye,
  faCheck,
  faUsers,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useParams } from "react-router-dom";

import membershipPackageService from "../../../../services/membershipPackageService";
import { useLoading } from "../../../../contexts/LoadingContext";
import { formatDuration } from "../../../../utils/MembershipPackageManage";
import PricingCard from "../../../../components/PricingCard/PricingCard";
import ConfirmPackageStatusModal from "../../../../components/ConfirmPackageStatusModal/ConfirmPackageStatusModal";

function MembershipPackageDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoading();

  const [packageData, setPackageData] = useState(null);
  const [error, setError] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  // =========================
  // GET DETAIL
  // =========================
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        showLoading();
        setError("");

        const response = await membershipPackageService.getById(id);

        setPackageData(response.data?.data ?? null);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết gói:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin gói thành viên.",
        );
      } finally {
        hideLoading();
      }
    };

    if (id) {
      fetchPackage();
    }
  }, [id]);

  // =========================
  // DESCRIPTION
  // =========================
  const parseDescription = (description) => {
    if (!description) return [];

    return description
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const handleConfirmStatusChange = async () => {
    try {
      setIsChangingStatus(true);
      showLoading();

      if (isActive) {
        await membershipPackageService.deactivate(id);
      } else {
        await membershipPackageService.activate(id);
      }

      const response = await membershipPackageService.getById(id);

      setPackageData(response.data?.data ?? null);
      setShowStatusModal(false);
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái gói:", err);

      setError(
        err.response?.data?.message || "Không thể thay đổi trạng thái gói.",
      );
    } finally {
      setIsChangingStatus(false);
      hideLoading();
    }
  };
  // =========================
  // FORMAT MONEY
  // =========================
  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("vi-VN");
  };

  // =========================
  // LOADING / ERROR
  // =========================
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{error}</div>

        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate("/dashboard/admin/membership-package")}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Quay lại
        </button>
      </div>
    );
  }

  if (!packageData) {
    return <div className={styles.container}></div>;
  }

  const featuresList = parseDescription(packageData.description);

  const isActive = packageData.status === "ACTIVE";
  console.log(packageData);
  return (
    <div className={styles.container}>
      {/* =========================
          HEADER
      ========================= */}
      <div className={styles.topHeader}>
        <div className={styles.breadcrumb}>
          <Link to="/dashboard/admin/membership-package">
            Quản lý gói đăng ký
          </Link>
          <FontAwesomeIcon
            icon={faChevronRight}
            className={styles.breadcrumbIcon}
          />

          <span className={styles.breadcrumbActive}>Chi tiết gói</span>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/dashboard/admin/membership-package")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại
          </button>

          <button
            type="button"
            className={styles.lockBtn}
            onClick={() => setShowStatusModal(true)}
          >
            <FontAwesomeIcon icon={isActive ? faLock : faUnlock} />

            {isActive ? "Ngừng sử dụng" : "Kích hoạt"}
          </button>

          <button
            type="button"
            className={styles.editBtn}
            onClick={() =>
              navigate(
                `/dashboard/admin/membership-package/${packageData.id}/edit`,
              )
            }
          >
            <FontAwesomeIcon icon={faPenToSquare} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      <div className={styles.titleRow}>
        <h1 className={styles.pageTitle}>{packageData.name}</h1>

        {isActive ? (
          <span className={`${styles.statusBadge} ${styles.statusActive}`}>
            <span className={styles.dotActive}></span>
            Hoạt động
          </span>
        ) : (
          <span className={`${styles.statusBadge} ${styles.statusLocked}`}>
            Ngừng sử dụng
          </span>
        )}
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className={styles.headingIcon}
              />
              Thông tin cơ bản
            </h2>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID GÓI</span>

                <span className={styles.infoValueMono}>{packageData.id}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>TÊN GÓI</span>

                <span className={styles.infoValueBold}>{packageData.name}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>GIÁ</span>

                <span className={styles.infoValueHighlight}>
                  {formatMoney(packageData.price)}

                  <span className={styles.infoUnit}> VNĐ</span>
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>THỜI HẠN</span>

                <span className={styles.infoValueBold}>
                  {formatDuration(packageData.duration)}
                </span>
              </div>
            </div>
          </div>

          {/* =========================
              FEATURES
          ========================= */}
          <div className={styles.card}>
            <div className={styles.cardHeaderBetween}>
              <h2 className={styles.cardHeading}>
                <span className={styles.starIcon}>★</span>
                Quyền lợi của gói
              </h2>

              <span className={styles.featureCountBadge}>
                {featuresList.length} quyền lợi
              </span>
            </div>

            <div className={styles.featuresList}>
              {featuresList.length > 0 ? (
                featuresList.map((feature, index) => (
                  <div key={index} className={styles.featureItem}>
                    <div className={styles.featureCheckIcon}>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>

                    <div className={styles.featureContent}>
                      <div className={styles.featureTitle}>{feature}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.previewEmptyFeature}>
                  Chưa có quyền lợi nào.
                </div>
              )}
            </div>
          </div>

          {/* =========================
              STATISTICS
          ========================= */}
          <div className={styles.statsGridRow}>
            <div className={styles.statCardMini}>
              <div className={styles.statIconBoxUsers}>
                <FontAwesomeIcon icon={faUsers} />
              </div>

              <div className={styles.statInfo}>
                <span className={styles.statLabelMini}>NGƯỜI ĐĂNG KÝ</span>

                <span className={styles.statNumberMini}>
                  {Number(packageData.totalSubscribers || 0).toLocaleString(
                    "vi-VN",
                  )}
                </span>
              </div>
            </div>

            <div className={styles.statCardMini}>
              <div className={styles.statIconBoxRevenue}>
                <FontAwesomeIcon icon={faWallet} />
              </div>

              <div className={styles.statInfo}>
                <span className={styles.statLabelMini}>TỔNG DOANH THU</span>

                <span className={styles.statNumberMini}>
                  {formatMoney(packageData.totalRevenue)} VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            RIGHT COLUMN
        ========================= */}
        <div className={styles.rightColumn}>
          {/* =========================
              SYSTEM INFO
          ========================= */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>
              <FontAwesomeIcon icon={faServer} className={styles.headingIcon} />
              Thông tin hệ thống
            </h2>

            <div className={styles.systemInfoList}>
              <div className={styles.systemInfoItem}>
                <span className={styles.infoLabel}>NGÀY TẠO</span>

                <span className={styles.systemInfoValue}>
                  {formatDateTime(packageData.createdAt)}
                </span>
              </div>

              <div className={styles.systemInfoItem}>
                <span className={styles.infoLabel}>CẬP NHẬT LẦN CUỐI</span>

                <span className={styles.systemInfoValue}>
                  {formatDateTime(packageData.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* =========================
              PREVIEW
          ========================= */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>
              <FontAwesomeIcon icon={faEye} className={styles.headingIcon} />
              Xem trước hiển thị
            </h2>
            <PricingCard formData={packageData} features={featuresList} />
          </div>
        </div>
      </div>

      <ConfirmPackageStatusModal
        isOpen={showStatusModal}
        onClose={() => {
          if (!isChangingStatus) {
            setShowStatusModal(false);
          }
        }}
        onConfirm={handleConfirmStatusChange}
        loading={isChangingStatus}
        isActive={isActive}
        packageName={packageData.name}
      />
    </div>
  );
}

export default MembershipPackageDetail;
