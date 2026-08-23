import React, { useEffect, useState } from "react";
import styles from "./UpdateLevelModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faLayerGroup,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

function UpdateLevelModal({
  isOpen,
  level,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#22C55E",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && level) {
      setFormData({
        name: level.name || "",
        description: level.description || "",
        color: level.color || "#22C55E",
      });

      setError("");
    }
  }, [isOpen, level]);

  if (!isOpen || !level) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setError("Tên cấp độ không được để trống.");
      return;
    }

    if (name.length > 50) {
      setError("Tên cấp độ không được vượt quá 50 ký tự.");
      return;
    }

    try {
      await onSubmit({
        name,
        description,
        color: formData.color,
      });

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể cập nhật cấp độ.");
    }
  };

  const handleClose = () => {
    if (loading) return;

    setError("");

    onClose();
  };

  return (
    <div className={styles.overlay} onMouseDown={handleClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.modalHeader}>
          <div className={styles.titleWrapper}>
            <div
              className={styles.iconBox}
              style={{
                color: formData.color,
                backgroundColor: `${formData.color}18`,
              }}
            >
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>

            <div>
              <h2 className={styles.title}>Chỉnh sửa cấp độ</h2>

              <p className={styles.subtitle}>
                Cập nhật thông tin cấp độ {level.name}.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* FORM */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* TÊN */}
          <div className={styles.formGroup}>
            <label htmlFor="update-level-name">
              Tên cấp độ
              <span>*</span>
            </label>

            <input
              id="update-level-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: A1, A2, B1..."
              maxLength={50}
              disabled={loading}
              autoFocus
            />

            <div className={styles.inputFooter}>
              <span>Tên cấp độ phải là duy nhất.</span>

              <span>{formData.name.length}/50</span>
            </div>
          </div>

          {/* MÔ TẢ */}
          <div className={styles.formGroup}>
            <label htmlFor="update-level-description">Mô tả</label>

            <textarea
              id="update-level-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả cho cấp độ..."
              rows={5}
              disabled={loading}
            />
          </div>

          {/* MÀU */}
          <div className={styles.formGroup}>
            <label htmlFor="update-level-color">
              Màu cấp độ
              <span>*</span>
            </label>

            <div className={styles.colorField}>
              <label
                htmlFor="update-level-color"
                className={styles.colorPicker}
                style={{
                  backgroundColor: formData.color,
                }}
                title="Chọn màu"
              >
                <input
                  id="update-level-color"
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  disabled={loading}
                  className={styles.hiddenColorInput}
                />
              </label>

              <span className={styles.colorValue}>
                {formData.color.toUpperCase()}
              </span>

              <div
                className={styles.levelPreview}
                style={{
                  backgroundColor: `${formData.color}18`,
                  color: formData.color,
                }}
              >
                {formData.name || "A1"}
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* FOOTER */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faPen} />

              {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateLevelModal;
