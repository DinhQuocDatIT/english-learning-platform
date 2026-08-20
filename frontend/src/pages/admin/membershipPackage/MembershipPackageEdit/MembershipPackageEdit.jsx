import React, { useEffect, useState } from "react";
import styles from "./MembershipPackageEdit.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faCircleInfo,
  faList,
  faPlus,
  faServer,
  faEye,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useParams } from "react-router-dom";

import membershipPackageService from "../../../../services/membershipPackageService";
import { useLoading } from "../../../../contexts/LoadingContext";
import PricingCard from "../../../../components/PricingCard/PricingCard";

function MembershipPackageEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    duration: 30,
    price: 0,
    description: "",
    status: "ACTIVE",
    isFeatured: false,
    createdAt: null,
    updatedAt: null,
  });

  // Lưu status ban đầu từ backend.
  // Dùng để biết có cần gọi activate/deactivate hay không.
  const [initialStatus, setInitialStatus] = useState(null);

  const [features, setFeatures] = useState([""]);
  const [error, setError] = useState("");

  // =========================
  // GET DETAIL
  // =========================
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        showLoading();
        setError("");

        const response = await membershipPackageService.getById(id);

        const data = response.data?.data;

        if (!data) {
          setError("Không tìm thấy gói thành viên.");
          return;
        }

        const packageStatus = data.status ?? "ACTIVE";

        setFormData({
          id: data.id,
          name: data.name ?? "",
          duration: data.duration ?? 30,
          price: data.price ?? 0,
          description: data.description ?? "",
          status: packageStatus,
          isFeatured: Boolean(data.isFeatured),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });

        // Quan trọng:
        // Lưu lại status ban đầu từ backend.
        setInitialStatus(packageStatus);

        // Backend lưu description dạng:
        // "Quyền lợi 1,Quyền lợi 2,Quyền lợi 3"
        const parsedFeatures = data.description
          ? data.description
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [""];

        setFeatures(parsedFeatures.length > 0 ? parsedFeatures : [""]);
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
  // BASIC INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // FEATURE
  // =========================
  const handleFeatureChange = (index, value) => {
    setFeatures((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddFeature = () => {
    setFeatures((prev) => [...prev, ""]);
  };

  const handleRemoveFeature = (index) => {
    setFeatures((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      return updated.length > 0 ? updated : [""];
    });
  };

  // =========================
  // STATUS
  // =========================
  const handleStatusChange = (e) => {
    const isActive = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      status: isActive ? "ACTIVE" : "INACTIVE",

      // Nếu tắt hoạt động thì Featured cũng phải tắt ở UI.
      // Backend deactivate() cũng xử lý việc này.
      isFeatured: isActive ? prev.isFeatured : false,
    }));
  };

  // =========================
  // FEATURED
  // =========================
  const handleFeaturedChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isFeatured: e.target.checked,
    }));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cleanedFeatures = features.map((item) => item.trim()).filter(Boolean);

    // =========================
    // VALIDATE
    // =========================

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên gói.");
      return;
    }

    if (!formData.duration || Number(formData.duration) < 1) {
      setError("Thời hạn phải lớn hơn 0 ngày.");
      return;
    }

    if (Number(formData.price) < 0) {
      setError("Giá không được nhỏ hơn 0.");
      return;
    }

    if (formData.status === "INACTIVE" && formData.isFeatured) {
      setError("Gói ngừng sử dụng không thể được đánh dấu là gói nổi bật.");
      return;
    }

    try {
      showLoading();

      // =========================
      // 1. UPDATE THÔNG TIN
      // =========================
      //
      // API:
      // PUT /api/v1/membership-packages/{id}
      //
      // API này chỉ xử lý:
      // - name
      // - duration
      // - price
      // - description
      // - isFeatured
      //
      // KHÔNG xử lý status.
      //

      const description = cleanedFeatures.join(",");

      const payload = {
        name: formData.name.trim(),
        duration: Number(formData.duration),
        price: Number(formData.price),
        description,
        isFeatured: Boolean(formData.isFeatured),
      };

      console.log("Payload update:", payload);

      await membershipPackageService.update(id, payload);

      // =========================
      // 2. UPDATE STATUS RIÊNG
      // =========================
      //
      // Chỉ gọi API status khi user thực sự thay đổi status.
      //

      if (initialStatus !== null && initialStatus !== formData.status) {
        if (formData.status === "ACTIVE") {
          console.log("Gọi API activate:", id);

          await membershipPackageService.activate(id);
        } else {
          console.log("Gọi API deactivate:", id);

          await membershipPackageService.deactivate(id);
        }
      }

      // =========================
      // 3. DONE
      // =========================

      navigate(`/dashboard/admin/membership-package/${id}`);
    } catch (err) {
      console.error("Lỗi khi cập nhật gói:", err);

      setError(
        err.response?.data?.message || "Không thể cập nhật gói thành viên.",
      );
    } finally {
      hideLoading();
    }
  };

  // =========================
  // CANCEL
  // =========================
  const handleCancel = () => {
    navigate(`/dashboard/admin/membership-package/${id}`);
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.container}>
      {/* =========================
          HEADER
      ========================= */}
      <div className={styles.topHeader}>
        <div className={styles.breadcrumb}>
          <Link to="/dashboard/admin/membership-package">Gói dịch vụ</Link>

          <FontAwesomeIcon
            icon={faChevronRight}
            className={styles.breadcrumbIcon}
          />

          <Link to={`/dashboard/admin/membership-package/${id}`}>Chi tiết</Link>

          <FontAwesomeIcon
            icon={faChevronRight}
            className={styles.breadcrumbIcon}
          />

          <span className={styles.breadcrumbActive}>Chỉnh sửa</span>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
          >
            Hủy
          </button>

          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSubmit}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Chỉnh sửa Gói dịch vụ</h1>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      <div className={styles.mainGrid}>
        {/* =========================
            LEFT
        ========================= */}
        <div className={styles.leftColumn}>
          {/* THÔNG TIN CƠ BẢN */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className={styles.headingIcon}
              />
              Thông tin cơ bản
            </h2>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>ID Gói (Chỉ đọc)</label>

                <input
                  type="text"
                  className={`${styles.input} ${styles.inputDisabled}`}
                  value={formData.id ?? ""}
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tên gói</label>

                <input
                  type="text"
                  name="name"
                  className={styles.input}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Thời hạn (Ngày)</label>

                <input
                  type="number"
                  name="duration"
                  min="1"
                  className={styles.input}
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Giá (VNĐ)</label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  step="1000"
                  className={styles.input}
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* TÍNH NĂNG */}
          <div className={styles.card}>
            <div className={styles.cardHeaderBetween}>
              <h2 className={styles.cardHeading}>
                <FontAwesomeIcon icon={faList} className={styles.headingIcon} />
                Tính năng & Quyền lợi
              </h2>

              <button
                type="button"
                className={styles.addFeatureBtn}
                onClick={handleAddFeature}
              >
                <FontAwesomeIcon icon={faPlus} />
                Thêm tính năng
              </button>
            </div>

            <div className={styles.featuresListContainer}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureInputRow}>
                  <input
                    type="text"
                    className={styles.input}
                    value={feature}
                    placeholder="Nhập nội dung tính năng..."
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />

                  <button
                    type="button"
                    className={styles.deleteFeatureBtn}
                    onClick={() => handleRemoveFeature(index)}
                    title="Xóa tính năng"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================
            RIGHT
        ========================= */}
        <div className={styles.rightColumn}>
          {/* STATUS */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>TRẠNG THÁI GÓI</h2>

            {/* ĐANG HOẠT ĐỘNG */}
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Đang hoạt động</span>

              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={formData.status === "ACTIVE"}
                  onChange={handleStatusChange}
                />

                <span className={`${styles.slider} ${styles.round}`}></span>
              </label>
            </div>

            {/* FEATURED */}
            <div className={styles.toggleRow} style={{ marginTop: "1rem" }}>
              <span className={styles.toggleLabel}>Nổi bật (Featured)</span>

              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  disabled={formData.status !== "ACTIVE"}
                  onChange={handleFeaturedChange}
                />

                <span className={`${styles.slider} ${styles.round}`}></span>
              </label>
            </div>
          </div>

          {/* SYSTEM INFO */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>
              <FontAwesomeIcon icon={faServer} className={styles.headingIcon} />
              THÔNG TIN HỆ THỐNG
            </h2>

            <div className={styles.systemInfoList}>
              <div className={styles.systemInfoItem}>
                <span className={styles.infoLabel}>Ngày tạo</span>

                <span className={styles.systemInfoValue}>
                  {formatDateTime(formData.createdAt)}
                </span>
              </div>

              <div className={styles.systemInfoItem}>
                <span className={styles.infoLabel}>Cập nhật lần cuối</span>

                <span className={styles.systemInfoValue}>
                  {formatDateTime(formData.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          {/* PREVIEW */}
          <div className={styles.card}>
            <h2 className={styles.cardHeading}>
              <FontAwesomeIcon icon={faEye} className={styles.headingIcon} />
              XEM TRƯỚC THẺ GÓI
            </h2>

            <div className={styles.previewCardContainer}>
              <PricingCard formData={formData} features={features} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MembershipPackageEdit;
