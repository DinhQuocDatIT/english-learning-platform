import React, { useEffect, useState } from "react";
import styles from "./StudentMembership.module.css";

import PricingCard from "../../../components/PricingCard/PricingCard";
import MembershipConfirmModal from "../../../components/MembershipConfirmModal/MembershipConfirmModal";
import MembershipNotice from "../../../components/MembershipNotice/MembershipNotice";

import membershipPackageService from "../../../services/membershipPackageService";
import studentMembershipService from "../../../services/studentMembershipService";
import AuthStorage from "../../../services/AuthStorage";

import { toast } from "react-toastify";

function StudentMembership() {
  const [currentMembership, setCurrentMembership] = useState(null);
  const [packages, setPackages] = useState([]);

  const [loadingMembership, setLoadingMembership] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [error, setError] = useState("");

  const [selectedPackage, setSelectedPackage] = useState(null);

  // Chỉ lưu ID của gói đang đăng ký
  const [registeringId, setRegisteringId] = useState(null);

  const [membershipNotice, setMembershipNotice] = useState({
    open: false,
    message: "",
  });

  const user = AuthStorage.getUser();

  // =========================
  // LOAD CURRENT MEMBERSHIP
  // =========================

  useEffect(() => {
    const fetchCurrentMembership = async () => {
      if (!user?.id) {
        setLoadingMembership(false);
        return;
      }

      try {
        setLoadingMembership(true);
        setError("");

        const response = await studentMembershipService.getCurrentMembership();

        setCurrentMembership(response.data?.data ?? null);
      } catch (err) {
        console.error("Lỗi khi lấy membership hiện tại:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin gói thành viên.",
        );
      } finally {
        setLoadingMembership(false);
      }
    };

    fetchCurrentMembership();
  }, [user?.id]);

  // =========================
  // LOAD ACTIVE PACKAGES
  // =========================

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true);

        const response = await membershipPackageService.getActivePackages();

        setPackages(response.data?.data ?? []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách gói:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách gói thành viên.",
        );
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  // =========================
  // SELECT PACKAGE
  // =========================

  const handleSelectPackage = (pkg) => {
    // Đang có gói còn hạn
    if (currentMembership) {
      setMembershipNotice({
        open: true,
        message: `Bạn đang sử dụng gói "${currentMembership.packageName}" và còn ${currentMembership.remainingDays} ngày. Bạn chỉ có thể đăng ký gói mới sau khi gói hiện tại hết hạn.`,
      });

      return;
    }

    // Đang có request đăng ký
    if (registeringId !== null) {
      return;
    }

    setSelectedPackage(pkg);
  };

  // =========================
  // CONFIRM REGISTER
  // =========================

  const handleConfirmRegister = async () => {
    if (!selectedPackage) {
      return;
    }

    const packageId = selectedPackage.id;

    try {
      // Chỉ card có packageId này hiện loading
      setRegisteringId(packageId);

      const response = await studentMembershipService.register({
        membershipPackageId: packageId,
      });

      // Đóng modal
      setSelectedPackage(null);

      toast.success(
        response.data?.message || "Đăng ký gói thành viên thành công.",
      );

      // Load lại membership hiện tại
      const currentResponse =
        await studentMembershipService.getCurrentMembership();

      setCurrentMembership(currentResponse.data?.data ?? null);
    } catch (err) {
      console.error("Lỗi khi đăng ký membership:", err);

      const message =
        err.response?.data?.message || "Đăng ký gói thành viên thất bại.";

      if (message.includes("đang có gói thành viên còn hiệu lực")) {
        setMembershipNotice({
          open: true,
          message,
        });
      } else {
        toast.error(message);
      }
    } finally {
      // Kết thúc loading
      setRegisteringId(null);
    }
  };

  // =========================
  // CLOSE CONFIRM MODAL
  // =========================

  const handleCloseConfirm = () => {
    if (registeringId !== null) {
      return;
    }

    setSelectedPackage(null);
  };

  // =========================
  // RENDER LOADING
  // =========================

  if (loadingMembership) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Đang tải thông tin gói thành viên...
        </div>
      </div>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className={styles.container}>
      {/* =========================
          HEADER
      ========================= */}

      <div className={styles.header}>
        <h1 className={styles.title}>Gói thành viên</h1>

        <p className={styles.subtitle}>
          Quản lý gói học tập và lựa chọn gói phù hợp với bạn.
        </p>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && <div className={styles.error}>{error}</div>}

      {/* =========================
          CURRENT MEMBERSHIP
      ========================= */}

      {currentMembership ? (
        <div className={styles.currentSection}>
          <div className={styles.sectionTitle}>Gói thành viên hiện tại</div>

          <div className={styles.currentCard}>
            <div className={styles.currentTop}>
              <div>
                <span className={styles.currentLabel}>GÓI ĐANG SỬ DỤNG</span>

                <h2 className={styles.currentPackageName}>
                  {currentMembership.packageName}
                </h2>
              </div>

              <span className={styles.activeBadge}>Đang hoạt động</span>
            </div>

            <div className={styles.currentInfo}>
              {/* GIÁ */}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>GIÁ ĐÃ THANH TOÁN</span>

                <strong>
                  {Number(currentMembership.paidPrice || 0).toLocaleString(
                    "vi-VN",
                  )}{" "}
                  VNĐ
                </strong>
              </div>

              {/* NGÀY BẮT ĐẦU */}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NGÀY BẮT ĐẦU</span>

                <strong>{currentMembership.startDate}</strong>
              </div>

              {/* NGÀY HẾT HẠN */}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NGÀY HẾT HẠN</span>

                <strong>{currentMembership.endDate}</strong>
              </div>

              {/* CÒN LẠI */}
              <div className={styles.remainingBox}>
                <span className={styles.infoLabel}>THỜI GIAN CÒN LẠI</span>

                <strong>{currentMembership.remainingDays}</strong>

                <span>ngày</span>
              </div>
            </div>
          </div>

          <div className={styles.warning}>
            Bạn chỉ có thể đăng ký gói thành viên mới sau khi gói hiện tại hết
            hạn.
          </div>
        </div>
      ) : (
        <div className={styles.emptyMembership}>
          <div className={styles.emptyIcon}>★</div>

          <h2>Bạn chưa có gói thành viên</h2>

          <p>
            Chọn một gói bên dưới để bắt đầu trải nghiệm các quyền lợi học tập.
          </p>
        </div>
      )}

      {/* =========================
          PACKAGES
      ========================= */}

      <div className={styles.packageSection}>
        <div className={styles.sectionTitle}>
          {currentMembership
            ? "Các gói thành viên"
            : "Chọn gói phù hợp với bạn"}
        </div>

        {loadingPackages ? (
          <div className={styles.loading}>Đang tải danh sách gói...</div>
        ) : packages.length === 0 ? (
          <div className={styles.emptyPackages}>
            Hiện chưa có gói thành viên nào.
          </div>
        ) : (
          <div className={styles.packageGrid}>
            {packages.map((pkg) => {
              const features = pkg.description
                ? pkg.description
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [];

              return (
                <PricingCard
                  key={pkg.id}
                  formData={pkg}
                  features={features}
                  onSelect={handleSelectPackage}
                  registering={registeringId === pkg.id}
                  disabled={
                    registeringId !== null || currentMembership !== null
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {/* =========================
          CONFIRM MODAL
      ========================= */}

      <MembershipConfirmModal
        packageData={selectedPackage}
        open={selectedPackage !== null}
        loading={registeringId !== null}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmRegister}
      />

      {/* =========================
          MEMBERSHIP NOTICE
      ========================= */}

      <MembershipNotice
        open={membershipNotice.open}
        message={membershipNotice.message}
        onClose={() =>
          setMembershipNotice({
            open: false,
            message: "",
          })
        }
      />
    </div>
  );
}

export default StudentMembership;
