import React, { useEffect, useState } from "react";
import styles from "./EditTopic.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faImage,
  faSave,
  faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import topicService from "../../../../services/topicService";
import { useLoading } from "../../../../contexts/LoadingContext";
import getImageUrl from "../../../../utils/imageUrl";

function EditTopic() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoading();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topicImage: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTopic();

    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [id]);

  // =========================
  // GET TOPIC
  // =========================

  const fetchTopic = async () => {
    try {
      setLoading(true);
      showLoading();

      const response = await topicService.getById(id);
      const topic = response?.data?.data;

      if (!topic) {
        throw new Error("Không tìm thấy topic.");
      }

      setFormData({
        title: topic.title || "",
        description: topic.description || "",
        topicImage: null,
      });

      if (topic.topicImage) {
        setPreviewImage(getImageUrl(topic.topicImage));
      }
    } catch (error) {
      console.error("Lỗi lấy topic:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải thông tin topic.";

      setError(message);
      toast.error(message);

      navigate("/dashboard/teacher/topics");
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

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
    setSuccess("");
  };

  // =========================
  // IMAGE
  // =========================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 5MB.");
      return;
    }

    if (previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    const imageUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      topicImage: file,
    }));

    setPreviewImage(imageUrl);

    setError("");
    setSuccess("");
  };

  // =========================
  // VALIDATE
  // =========================

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Tiêu đề topic không được để trống.");
      return false;
    }

    if (formData.title.trim().length > 150) {
      setError("Tiêu đề không được vượt quá 150 ký tự.");
      return false;
    }

    return true;
  };

  // =========================
  // FORM DATA
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
  // SAVE
  // =========================

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      showLoading();

      const response = await topicService.update(id, buildFormData());

      const updatedTopic = response?.data?.data;

      if (updatedTopic?.topicImage && !formData.topicImage) {
        setPreviewImage(getImageUrl(updatedTopic.topicImage));
      }

      setFormData((prev) => ({
        ...prev,
        topicImage: null,
      }));

      setSuccess("Cập nhật topic thành công.");
      toast.success("Cập nhật topic thành công.");
    } catch (error) {
      console.error("Lỗi cập nhật topic:", error);

      const message =
        error.response?.data?.message ||
        "Không thể cập nhật topic. Vui lòng thử lại.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
      hideLoading();
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải thông tin topic...</div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          disabled={saving}
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
              <h2>Chỉnh sửa Topic</h2>
              <p>Cập nhật thông tin topic của bạn.</p>
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {success && <div className={styles.successMessage}>{success}</div>}

          <div className={styles.formGrid}>
            {/* LEFT */}
            <div className={styles.formLeft}>
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
                  disabled={saving}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Mô tả</label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả cho topic..."
                  disabled={saving}
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
                    disabled={saving}
                  />

                  <label htmlFor="topicImage" className={styles.uploadArea}>
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={formData.title}
                        className={styles.imagePreview}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
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

          {/* ACTIONS */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Hủy
            </button>

            <div className={styles.rightActions}>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSave}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faSave} />

                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <FontAwesomeIcon icon={faCloudArrowUp} />
          </div>

          <div>
            <h3>Lưu ý</h3>

            <p>Bạn có thể chỉnh sửa thông tin topic bất cứ lúc nào.</p>

            <p>Sau khi lưu, các thay đổi sẽ được cập nhật ngay vào topic.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTopic;
