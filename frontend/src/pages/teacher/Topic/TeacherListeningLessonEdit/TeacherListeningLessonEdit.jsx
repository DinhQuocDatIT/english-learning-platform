import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faPaperPlane,
  faHeadphones,
  faBookOpen,
  faLayerGroup,
  faImage,
  faStar,
  faCrown,
  faLock,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import styles from "./TeacherListeningLessonEdit.module.css";

import listeningLessonService from "../../../../services/listeningLessonService";
import topicService from "../../../../services/topicService";
import levelService from "../../../../services/levelService";
import getImageUrl from "../../../../utils/imageUrl";
import { useLoading } from "../../../../contexts/LoadingContext";

// Map trạng thái
const STATUS_MAP = {
  DRAFT: "Nháp",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  PUBLISHED: "Đã phát hành",
};

function TeacherListeningLessonEdit() {
  const navigate = useNavigate();
  const { topicId, lessonId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [topic, setTopic] = useState(null);
  const [levels, setLevels] = useState([]);
  const [lesson, setLesson] = useState(null);

  const [formData, setFormData] = useState({
    topicId: "",
    levelId: "",
    title: "",
    description: "",
    isPremium: false,
    lessonImage: null,
  });

  const [previewImage, setPreviewImage] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      showLoading();

      // Lấy thông tin bài nghe, topic và levels
      const [lessonResponse, topicResponse, levelResponse] = await Promise.all([
        listeningLessonService.getById(lessonId),
        topicService.getById(topicId),
        levelService.getAll(),
      ]);

      const lessonData = lessonResponse?.data?.data;
      const topicData = topicResponse?.data?.data;
      const levelData = levelResponse?.data?.data || [];

      if (!lessonData) {
        throw new Error("Không tìm thấy bài nghe.");
      }

      // Kiểm tra quyền chỉnh sửa
      const canEditStatus =
        lessonData.status === "DRAFT" || lessonData.status === "REJECTED";
      setCanEdit(canEditStatus);

      if (!canEditStatus) {
        toast.warning(
          `Bài nghe đang ở trạng thái "${STATUS_MAP[lessonData.status]}", không thể chỉnh sửa.`,
        );
        // Chuyển về trang chi tiết sau 2 giây
        setTimeout(() => {
          navigate(
            `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}`,
          );
        }, 2000);
        return;
      }

      setLesson(lessonData);
      setTopic(topicData);
      setLevels(levelData);

      // Set form data
      setFormData({
        topicId: lessonData.topicId || topicId,
        levelId: lessonData.levelId || "",
        title: lessonData.title || "",
        description: lessonData.description || "",
        isPremium: lessonData.isPremium || false,
        lessonImage: null,
      });

      setCurrentImage(lessonData.lessonImage || "");
      if (lessonData.lessonImage) {
        setPreviewImage(getImageUrl(lessonData.lessonImage));
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải dữ liệu.";

      setError(message);
      toast.error("❌ " + message);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      lessonImage: file,
    }));

    setPreviewImage(URL.createObjectURL(file));
    setError("");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Tiêu đề bài nghe không được để trống.");
      return false;
    }

    if (formData.title.trim().length > 200) {
      setError("Tiêu đề không được vượt quá 200 ký tự.");
      return false;
    }

    if (!formData.levelId) {
      setError("Vui lòng chọn trình độ.");
      return false;
    }

    return true;
  };

  const buildFormData = () => {
    const data = new FormData();

    data.append("topicId", Number(formData.topicId));
    data.append("levelId", Number(formData.levelId));
    data.append("title", formData.title.trim());
    data.append("description", formData.description.trim());
    data.append("isPremium", formData.isPremium);

    // Chỉ gửi ảnh mới nếu có thay đổi
    if (formData.lessonImage) {
      data.append("lessonImage", formData.lessonImage);
    }

    return data;
  };

  // LƯU NHÁP
  const handleSaveDraft = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      showLoading();

      const requestData = buildFormData();
      await listeningLessonService.update(lessonId, requestData);

      toast.success("✅ Đã cập nhật bài nghe.");

      navigate(
        `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}`,
      );
    } catch (error) {
      console.error("Lỗi cập nhật bài nghe:", error);

      const message =
        error.response?.data?.message ||
        "Không thể cập nhật bài nghe. Vui lòng thử lại.";

      setError(message);
      toast.error("❌ " + message);
    } finally {
      setSaving(false);
      hideLoading();
    }
  };

  // GỬI DUYỆT
  const handleSubmitForReview = async () => {
    if (!validateForm()) {
      return;
    }

    if (!window.confirm("Bạn chắc chắn muốn gửi bài nghe này để duyệt?")) {
      return;
    }

    try {
      setSaving(true);
      setIsSubmitting(true);
      setError("");
      showLoading();

      // Bước 1: cập nhật bài nghe
      const requestData = buildFormData();
      await listeningLessonService.update(lessonId, requestData);

      // Bước 2: gửi duyệt
      await listeningLessonService.submit(lessonId);

      toast.success("🎉 Gửi duyệt bài nghe thành công!");

      navigate(`/dashboard/teacher/topics/${topicId}`);
    } catch (error) {
      console.error("Lỗi gửi duyệt bài nghe:", error);

      const message =
        error.response?.data?.message || "Không thể gửi bài nghe xét duyệt.";

      setError(message);
      toast.error("❌ " + message);
    } finally {
      setSaving(false);
      setIsSubmitting(false);
      hideLoading();
    }
  };

  // Không được chỉnh sửa -> redirect
  if (!canEdit && !loading) {
    return (
      <div className={styles.container}>
        <div className={styles.lockedContainer}>
          <FontAwesomeIcon icon={faLock} className={styles.lockedIcon} />
          <h2>Không thể chỉnh sửa</h2>
          <p>
            Bài nghe đang ở trạng thái{" "}
            <strong>"{STATUS_MAP[lesson?.status]}"</strong>, không thể chỉnh
            sửa.
          </p>
          <p className={styles.lockedSubText}>
            Bạn sẽ được chuyển về trang chi tiết...
          </p>
          <button
            className={styles.backButtonError}
            onClick={() =>
              navigate(
                `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}`,
              )
            }
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại chi tiết
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

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

        <div className={styles.headerInfo}>
          <h1 className={styles.pageTitle}>
            <FontAwesomeIcon icon={faHeadphones} className={styles.titleIcon} />
            Chỉnh sửa bài nghe
          </h1>
          <p className={styles.subtitle}>
            Chỉnh sửa bài nghe trong topic <strong>"{topic?.title}"</strong>
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        <form className={styles.formCard} onSubmit={(e) => e.preventDefault()}>
          {/* Warning - REJECTED */}
          {lesson?.status === "REJECTED" && (
            <div className={styles.warningMessage}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>
                Bài nghe đã bị từ chối. Vui lòng chỉnh sửa và gửi duyệt lại.
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={styles.errorMessage}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Two columns layout */}
          <div className={styles.formGrid}>
            {/* Left column */}
            <div className={styles.formLeft}>
              {/* TITLE */}
              <div className={styles.formGroup}>
                <label htmlFor="title">
                  Tiêu đề bài nghe <span className={styles.required}>*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề bài nghe..."
                  maxLength={200}
                  disabled={saving}
                  className={styles.input}
                />
                <div className={styles.counter}>
                  {formData.title.length}/200
                </div>
              </div>

              {/* LEVEL */}
              <div className={styles.formGroup}>
                <label htmlFor="levelId">
                  Trình độ <span className={styles.required}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    className={styles.selectIcon}
                  />
                  <select
                    id="levelId"
                    name="levelId"
                    value={formData.levelId}
                    onChange={handleChange}
                    disabled={saving}
                    className={styles.selectInput}
                  >
                    <option value="">-- Chọn trình độ --</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className={styles.formGroup}>
                <label htmlFor="description">Mô tả bài nghe</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả hoặc mục tiêu của bài nghe..."
                  rows={5}
                  disabled={saving}
                  className={styles.textarea}
                />
              </div>
            </div>

            {/* Right column */}
            <div className={styles.formRight}>
              {/* IMAGE */}
              <div className={styles.formGroup}>
                <label htmlFor="lessonImage">Ảnh bài nghe</label>
                <div className={styles.uploadZone}>
                  {previewImage ? (
                    <div className={styles.previewContainer}>
                      <img
                        src={previewImage}
                        alt="Preview"
                        className={styles.previewImage}
                      />
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() => {
                          setPreviewImage("");
                          setCurrentImage("");
                          setFormData((prev) => ({
                            ...prev,
                            lessonImage: null,
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadLabel}>
                      <input
                        id="lessonImage"
                        name="lessonImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={saving}
                        className={styles.fileInput}
                      />
                      <FontAwesomeIcon
                        icon={faImage}
                        className={styles.uploadIcon}
                      />
                      <span>Chọn ảnh bài nghe</span>
                      <small>PNG, JPG, JPEG (tối đa 5MB)</small>
                    </label>
                  )}
                </div>
                {currentImage && !previewImage && (
                  <p className={styles.currentImageText}>
                    Ảnh hiện tại: <span>{currentImage.split("/").pop()}</span>
                  </p>
                )}
              </div>

              {/* PREMIUM */}
              <div className={styles.premiumBox}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  <span>
                    <FontAwesomeIcon
                      icon={faCrown}
                      className={styles.premiumIcon}
                    />
                    Nội dung Premium
                  </span>
                </label>
                <p className={styles.premiumHint}>
                  Chỉ học sinh có gói thành viên mới có thể truy cập bài học
                  này
                </p>
              </div>

              {/* Status */}
              <div className={styles.statusBox}>
                <span className={styles.statusLabel}>Trạng thái hiện tại:</span>
                <span
                  className={styles.statusValue}
                  style={{
                    color: lesson?.status === "DRAFT" ? "#f59e0b" : "#ef4444",
                  }}
                >
                  {STATUS_MAP[lesson?.status] || lesson?.status}
                </span>
              </div>
            </div>
          </div>

          {/* INFO CARD */}
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FontAwesomeIcon icon={faBookOpen} />
            </div>
            <div className={styles.infoContent}>
              <h4>💡 Lưu ý</h4>
              <ul className={styles.infoList}>
                <li>
                  <span className={styles.infoDot}>•</span>
                  <strong>Lưu nháp:</strong> Cập nhật bài nghe, vẫn giữ trạng
                  thái hiện tại.
                </li>
                <li>
                  <span className={styles.infoDot}>•</span>
                  <strong>Gửi duyệt:</strong> Cập nhật và gửi bài nghe lên Admin
                  duyệt.
                  {lesson?.status === "REJECTED" &&
                    " Bài đã bị từ chối, hãy sửa lại trước khi gửi."}
                </li>
              </ul>
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
              Hủy bỏ
            </button>

            <div className={styles.rightActions}>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSaveDraft}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faSave} />
                {saving && !isSubmitting ? "Đang xử lý..." : "Lưu nháp"}
              </button>

              <button
                type="button"
                className={styles.submitButton}
                onClick={handleSubmitForReview}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {isSubmitting ? "Đang gửi..." : "Gửi duyệt"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherListeningLessonEdit;
