import React, { useState } from "react";
import styles from "./CreateTopic.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faImage,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import topicService from "../../../../services/topicService";
import { toast } from "react-toastify";

function CreateTopic() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topicImage: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [topicId, setTopicId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // CHANGE FORM
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =========================
  // CHANGE IMAGE
  // =========================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      topicImage: file,
    }));

    setPreviewImage(URL.createObjectURL(file));

    setError("");
  };

  // =========================
  // BUILD FORM DATA
  // =========================

  const buildFormData = () => {
    const data = new FormData();

    data.append("title", formData.title.trim());
    data.append("description", formData.description || "");

    if (formData.topicImage) {
      data.append("topicImage", formData.topicImage);
    }

    return data;
  };

  // =========================
  // VALIDATE
  // =========================

  const validateForm = () => {
    const title = formData.title.trim();

    if (!title) {
      setError("Tiêu đề topic không được để trống.");
      return false;
    }

    if (title.length > 150) {
      setError("Tiêu đề không được vượt quá 150 ký tự.");
      return false;
    }

    return true;
  };

  // =========================
  // SAVE
  // =========================

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const data = buildFormData();

      let response;

      if (topicId) {
        response = await topicService.update(topicId, data);
      } else {
        response = await topicService.create(data);
      }

      const topic = response?.data?.data;

      if (topic?.id) {
        setTopicId(topic.id);
      }

      toast.success(
        topicId ? "Cập nhật topic thành công!" : "Tạo topic thành công!",
      );

      navigate(-1);
    } catch (error) {
      console.error("Lỗi lưu topic:", error);

      const message =
        error.response?.data?.message ||
        "Không thể lưu topic. Vui lòng thử lại.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}

      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* FORM */}

      <div className={styles.content}>
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Thông tin Topic</h2>

              <p>Nhập thông tin cơ bản cho topic của bạn.</p>
            </div>
          </div>

          {/* ERROR */}

          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* FORM GRID */}

          <div className={styles.formGrid}>
            {/* LEFT */}

            <div className={styles.formLeft}>
              {/* TITLE */}

              <div className={styles.formGroup}>
                <label htmlFor="title">
                  Tiêu đề Topic <span>*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề topic..."
                  maxLength={150}
                  disabled={loading}
                />
              </div>

              {/* DESCRIPTION */}

              <div className={styles.formGroup}>
                <label htmlFor="description">Mô tả</label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả cho topic..."
                  disabled={loading}
                />
              </div>
            </div>

            {/* RIGHT */}

            <div className={styles.formRight}>
              <div className={styles.formGroup}>
                <label>Ảnh Topic</label>

                <div className={styles.imageUpload}>
                  <input
                    id="topicImage"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                    disabled={loading}
                  />

                  <label htmlFor="topicImage" className={styles.uploadArea}>
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className={styles.imagePreview}
                      />
                    ) : (
                      <>
                        <div className={styles.uploadIcon}>
                          <FontAwesomeIcon icon={faImage} />
                        </div>

                        <div className={styles.uploadText}>
                          <strong>Chọn ảnh Topic</strong>

                          <span>PNG, JPG hoặc WEBP</span>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION */}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Hủy
            </button>

            <div className={styles.rightActions}>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSave}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSave} />

                {loading ? "Đang lưu..." : topicId ? "Cập nhật" : "Tạo topic"}
              </button>
            </div>
          </div>
        </div>

        {/* NOTE */}

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <FontAwesomeIcon icon={faImage} />
          </div>

          <div>
            <h3>Lưu ý</h3>

            <p>
              Topic sau khi tạo sẽ được lưu vào hệ thống. Admin có thể kiểm tra
              và quyết định <strong>phát hành</strong> hoặc <strong>ẩn</strong>{" "}
              topic.
            </p>

            <p>Bạn có thể chỉnh sửa lại thông tin topic sau khi tạo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTopic;
