import React, { useEffect, useState } from "react";
import styles from "./StudentMembership.module.css";

import PricingCard from "../../../components/PricingCard/PricingCard";
import MembershipConfirmModal from "../../../components/MembershipConfirmModal/MembershipConfirmModal";
import MembershipNotice from "../../../components/MembershipNotice/MembershipNotice";

import membershipPackageService from "../../../services/membershipPackageService";
import studentMembershipService from "../../../services/studentMembershipService";
import AuthStorage from "../../../services/AuthStorage";
import Loading from "../../../components/common/Loading/Loading";

import { toast } from "react-toastify";

function StudentMembership() {
  const [currentMembership, setCurrentMembership] = useState(null);
  const [packages, setPackages] = useState([]);

  const [loadingMembership, setLoadingMembership] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [error, setError] = useState("");

  const [selectedPackage, setSelectedPackage] = useState(null);

  const [registeringId, setRegisteringId] = useState(null);

  const [membershipNotice, setMembershipNotice] = useState({
    open: false,
    message: "",
  });

  const user = AuthStorage.getUser();

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

  const handleSelectPackage = (pkg) => {
    if (currentMembership) {
      setMembershipNotice({
        open: true,
        message: `Bạn đang sử dụng gói "${currentMembership.packageName}" và còn ${currentMembership.remainingDays} ngày. Bạn chỉ có thể đăng ký gói mới sau khi gói hiện tại hết hạn.`,
      });

      return;
    }

    if (registeringId !== null) {
      return;
    }

    setSelectedPackage(pkg);
  };

  const handleConfirmRegister = async () => {
    if (!selectedPackage) {
      return;
    }

    const packageId = selectedPackage.id;

    try {
      setRegisteringId(packageId);

      const response = await studentMembershipService.register({
        membershipPackageId: packageId,
      });

      setSelectedPackage(null);

      toast.success(
        response.data?.message || "Đăng ký gói thành viên thành công.",
      );

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
      setRegisteringId(null);
    }
  };

  const handleCloseConfirm = () => {
    if (registeringId !== null) {
      return;
    }

    setSelectedPackage(null);
  };

  // ===== LOADING =====
  if (loadingMembership) {
    return <Loading size="large" text="Đang tải thông tin gói thành viên..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gói thành viên</h1>

        <p className={styles.subtitle}>
          Quản lý gói học tập và lựa chọn gói phù hợp với bạn.
        </p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

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
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>GIÁ ĐÃ THANH TOÁN</span>

                <strong>
                  {Number(currentMembership.paidPrice || 0).toLocaleString(
                    "vi-VN",
                  )}{" "}
                  VNĐ
                </strong>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NGÀY BẮT ĐẦU</span>

                <strong>{currentMembership.startDate}</strong>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>NGÀY HẾT HẠN</span>

                <strong>{currentMembership.endDate}</strong>
              </div>

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

      <div className={styles.packageSection}>
        <div className={styles.sectionTitle}>
          {currentMembership
            ? "Các gói thành viên"
            : "Chọn gói phù hợp với bạn"}
        </div>

        {loadingPackages ? (
          <Loading fullScreen={false} text="Đang tải danh sách gói..." />
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

      <MembershipConfirmModal
        packageData={selectedPackage}
        open={selectedPackage !== null}
        loading={registeringId !== null}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmRegister}
      />

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
