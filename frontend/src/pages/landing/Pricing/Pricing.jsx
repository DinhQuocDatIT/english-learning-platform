import React, { useEffect, useState } from "react";
import styles from "./Pricing.module.css";
import PricingCard from "../../../components/PricingCard/PricingCard";
import membershipPackageService from "../../../services/membershipPackageService";
import studentMembershipService from "../../../services/studentMembershipService";
import AuthStorage from "../../../services/AuthStorage";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import MembershipNotice from "../../../components/MembershipNotice/MembershipNotice";
import MembershipConfirmModal from "../../../components/MembershipConfirmModal/MembershipConfirmModal";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { toast } from "react-toastify";

function Pricing() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [error, setError] = useState("");

  const [membershipNotice, setMembershipNotice] = useState({
    open: false,
    message: "",
  });

  // Gói đang được chọn để xác nhận
  const [selectedPackage, setSelectedPackage] = useState(null);

  const navigate = useNavigate();

  const handleSelectPackage = (pkg) => {
    // Chưa đăng nhập
    if (!AuthStorage.isAuthenticated()) {
      navigate("/login", {
        state: {
          from: "/pricing",
          membershipPackageId: pkg.id,
        },
      });

      return;
    }

    // Nếu đang có request thì không cho chọn thêm
    if (registeringId !== null) {
      return;
    }

    // Chỉ mở modal xác nhận
    setSelectedPackage(pkg);
  };

  const handleConfirmRegister = async () => {
    if (!selectedPackage) {
      return;
    }

    const pkg = selectedPackage;

    try {
      setRegisteringId(pkg.id);

      // Đóng modal xác nhận
      setSelectedPackage(null);

      setError("");

      const response = await studentMembershipService.register({
        membershipPackageId: pkg.id,
      });

      console.log("Đăng ký membership:", response);

      toast.success(
        response.data?.message || "Đăng ký gói thành viên thành công",
      );
    } catch (err) {
      console.error("Lỗi khi đăng ký gói thành viên:", err);

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

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await membershipPackageService.getActivePackages();

        setPackages(response.data?.data ?? []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách gói:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách gói thành viên.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Đầu Tư Cho Bản Thân</h2>

        <p className={styles.subtitle}>
          Chọn gói thành viên phù hợp với nhu cầu học tập của bạn.
        </p>
      </div>

      {loading && (
        <div className={styles.message}>Đang tải danh sách gói...</div>
      )}

      {!loading && error && <div className={styles.error}>{error}</div>}

      {!loading && !error && packages.length === 0 && (
        <div className={styles.message}>Hiện chưa có gói thành viên nào.</div>
      )}

      {!loading && !error && packages.length > 0 && (
        <div className={styles.carouselWrapper}>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{
              clickable: true,
            }}
            grabCursor
            centeredSlides={false}
            slidesPerView={1}
            spaceBetween={20}
            className={styles.swiper}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 25,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 35,
              },
            }}
          >
            {packages.map((pkg) => {
              const features = pkg.description
                ? pkg.description
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [];

              return (
                <SwiperSlide key={pkg.id} className={styles.slide}>
                  <PricingCard
                    formData={pkg}
                    features={features}
                    onSelect={handleSelectPackage}
                    registering={registeringId === pkg.id}
                    disabled={registeringId !== null}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}

      {/* Modal xác nhận đăng ký */}
      <MembershipConfirmModal
        packageData={selectedPackage}
        open={selectedPackage !== null}
        loading={registeringId !== null}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmRegister}
      />

      {/* Modal thông báo membership còn hạn */}
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
    </section>
  );
}

export default Pricing;
