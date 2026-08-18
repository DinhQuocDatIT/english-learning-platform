import React, { useState } from "react";
import styles from "./MembershipPackageAdd.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faCircleInfo,
  faGripVertical,
  faPlus,
  faTrash,
  faCheck,
  faBoxOpen,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

import membershipPackageService from "../../../../services/membershipPackageService";
import { useLoading } from "../../../../contexts/LoadingContext";
import { formatDuration } from "../../../../utils/MembershipPackageManage";
function MembershipPackageAdd() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [form, setForm] = useState({
    name: "",
    duration: 30,
    price: 0,
    description: [""],
    isFeatured: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    setForm((prev) => {
      const newDescription = [...prev.description];

      newDescription[index] = value;

      return {
        ...prev,
        description: newDescription,
      };
    });
  };

  const addFeature = () => {
    setForm((prev) => ({
      ...prev,
      description: [...prev.description, ""],
    }));
  };

  const removeFeature = (index) => {
    setForm((prev) => {
      const newDescription = prev.description.filter((_, i) => i !== index);

      return {
        ...prev,
        description: newDescription.length > 0 ? newDescription : [""],
      };
    });
  };

  const handleFeaturedChange = (e) => {
    const checked = e.target.checked;

    setForm((prev) => ({
      ...prev,
      isFeatured: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const features = form.description
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    // Validate tên
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên gói.");
      return;
    }

    // Validate duration
    if (!form.duration || Number(form.duration) < 1) {
      setError("Thời hạn phải lớn hơn 0 ngày.");
      return;
    }

    // Validate price
    if (Number(form.price) < 0) {
      setError("Giá không được nhỏ hơn 0.");
      return;
    }

    try {
      showLoading();
      const description = features.join(",");

      const data = {
        name: form.name.trim(),
        duration: Number(form.duration),
        price: Number(form.price),
        description,
        isFeatured: form.isFeatured,
      };

      console.log("Dữ liệu gửi backend:", data);

      await membershipPackageService.create(data);

      navigate("/dashboard/admin/membership-package");
    } catch (err) {
      console.error("Lỗi khi thêm gói:", err);

      setError(err.response?.data?.message || "Không thể thêm gói thành viên.");
    } finally {
      hideLoading();
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/admin/membership-package");
  };
  const previewFeatures = form.description
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return (
    <div className={styles.container}>
      <div className={styles.topHeader}>
        <div className={styles.breadcrumb}>
          <Link to="/dashboard/admin/membership-package">
            Quản lý gói thành viên
          </Link>
          <FontAwesomeIcon
            icon={faChevronRight}
            className={styles.breadcrumbIcon}
          />

          <span className={styles.breadcrumbActive}>Thêm gói mới</span>
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
            type="submit"
            form="membership-package-form"
            className={styles.saveBtn}
          >
            <FontAwesomeIcon icon={faCheck} />
            Lưu gói
          </button>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Thêm gói thành viên</h1>

      {/* ERROR */}
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

      <form id="membership-package-form" onSubmit={handleSubmit}>
        <div className={styles.mainGrid}>
          <div className={styles.formColumn}>
            {/* THÔNG TIN GÓI */}
            <div className={styles.cardSection}>
              <h2 className={styles.sectionHeading}>
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  className={styles.headingIcon}
                />
                Thông tin gói
              </h2>

              <div className={styles.formRow}>
                {/* TÊN */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên gói</label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ví dụ: Gói Premium"
                    className={styles.input}
                  />
                </div>

                {/* THỜI HẠN */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Thời hạn</label>

                  <div className={styles.inputWithSuffix}>
                    <input
                      type="number"
                      name="duration"
                      min="1"
                      value={form.duration}
                      onChange={handleChange}
                      className={styles.input}
                    />

                    <span className={styles.suffixText}>ngày</span>
                  </div>
                </div>
              </div>

              {/* GIÁ */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá</label>

                  <div className={styles.inputWithSuffix}>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="1000"
                      value={form.price}
                      onChange={handleChange}
                      className={styles.input}
                    />

                    <span className={styles.suffixText}> VNĐ</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.cardSection}>
              <div className={styles.sectionHeaderFlex}>
                <h2 className={styles.sectionHeading}>Quyền lợi của gói</h2>

                <button
                  type="button"
                  className={styles.addFeatureBtn}
                  onClick={addFeature}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Thêm quyền lợi
                </button>
              </div>

              <div className={styles.featuresList}>
                {form.description.map((feature, index) => (
                  <div className={styles.featureRow} key={index}>
                    <FontAwesomeIcon
                      icon={faGripVertical}
                      className={styles.gripIcon}
                    />

                    <input
                      type="text"
                      value={feature}
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                      placeholder="Ví dụ: Truy cập toàn bộ bài học"
                      className={styles.input}
                    />

                    <button
                      type="button"
                      className={styles.deleteFeatureBtn}
                      onClick={() => removeFeature(index)}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.cardSection}>
              <div className={styles.toggleItem}>
                <div className={styles.toggleInfo}>
                  <div className={styles.titleBadgeRow}>
                    <span className={styles.toggleTitle}>Gói nổi bật</span>

                    <span className={styles.featuredBadgeLabel}>
                      PHỔ BIẾN NHẤT
                    </span>
                  </div>

                  <span className={styles.toggleDesc}>
                    Đánh dấu gói này là gói được đề xuất cho người dùng.
                  </span>
                </div>

                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={handleFeaturedChange}
                  />

                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.previewColumn}>
            <div className={styles.previewHeaderTitle}>
              <FontAwesomeIcon icon={faCircleInfo} />
              Xem trước gói
            </div>

            <div className={styles.previewCard}>
              {/* FEATURED BADGE */}
              {form.isFeatured && (
                <div
                  style={{
                    display: "inline-block",
                    marginBottom: "0.75rem",
                    background: "#ffedd5",
                    color: "#c2410c",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                  }}
                >
                  PHỔ BIẾN NHẤT
                </div>
              )}

              {/* NAME */}
              <h3 className={styles.previewPackageName}>
                {form.name.trim() || "Tên gói thành viên"}
              </h3>

              {/* PRICE */}
              <div className={styles.previewPriceWrapper}>
                <span className={styles.previewPriceValue}>
                  {Number(form.price || 0).toLocaleString("vi-VN")}
                </span>

                <span className={styles.previewPricePeriod}> VNĐ</span>
              </div>

              {/* DURATION */}
              <p className={styles.previewSubText}>
                Thời hạn {formatDuration(form.duration)}
              </p>

              <div className={styles.previewDivider}></div>

              {/* FEATURES */}
              <div className={styles.previewFeaturesList}>
                {previewFeatures.length > 0 ? (
                  previewFeatures.map((feature, index) => (
                    <div className={styles.previewFeatureItem} key={index}>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className={styles.checkIcon}
                      />

                      <span>{feature}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.previewEmptyFeature}>
                    Chưa có quyền lợi nào
                  </div>
                )}
              </div>

              {/* BUY BUTTON */}
              <button type="button" className={styles.previewBuyBtn}>
                Đăng ký ngay
              </button>
            </div>

            {/* NOTE */}
            <div className={styles.previewNoteBox}>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className={styles.noteIcon}
              />

              <p className={styles.noteText}>
                Gói sẽ được tạo ở trạng thái <strong>ACTIVE</strong> và có thể
                được cung cấp cho người dùng ngay sau khi tạo.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default MembershipPackageAdd;
