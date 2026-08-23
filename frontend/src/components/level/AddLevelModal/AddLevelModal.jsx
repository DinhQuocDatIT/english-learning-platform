import React, { useState } from "react";
import styles from "./AddLevelModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faLayerGroup,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

function AddLevelModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#22C55E",
  });

  const [error, setError] = useState("");

  if (!isOpen) {
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

      setFormData({
        name: "",
        description: "",
        color: "#22C55E",
      });

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Không thể thêm cấp độ.");
    }
  };

  const handleClose = () => {
    if (loading) return;

    setFormData({
      name: "",
      description: "",
      color: "#22C55E",
    });

    setError("");

    onClose();
  };

  return (
    <div className={styles.overlay} onMouseDown={handleClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleWrapper}>
            <div className={styles.iconBox}>
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>

            <div>
              <h2 className={styles.title}>Thêm cấp độ</h2>

              <p className={styles.subtitle}>Tạo một cấp độ tiếng Anh mới.</p>
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

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Tên cấp độ */}
          <div className={styles.formGroup}>
            <label htmlFor="level-name">
              Tên cấp độ
              <span>*</span>
            </label>

            <input
              id="level-name"
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

          {/* Mô tả */}
          <div className={styles.formGroup}>
            <label htmlFor="level-description">Mô tả</label>

            <textarea
              id="level-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả cho cấp độ..."
              rows={5}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="level-color">
              Màu cấp độ
              <span>*</span>
            </label>

            <div className={styles.colorField}>
              <label
                htmlFor="level-color"
                className={styles.colorPicker}
                style={{ backgroundColor: formData.color }}
                title="Chọn màu"
              >
                <input
                  id="level-color"
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
            </div>
          </div>

          {/* Error */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Footer */}
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
              <FontAwesomeIcon icon={faPlus} />

              {loading ? "Đang thêm..." : "Thêm cấp độ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLevelModal;
