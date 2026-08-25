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
  faCheckCircle,
  faClock,
  faCircle,
  faPen,
  faRocket,
  faStar,
  faUpload,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import styles from "./TeacherListeningLessonCreate.module.css";

import listeningLessonService from "../../../../services/listeningLessonService";
import topicService from "../../../../services/topicService";
import levelService from "../../../../services/levelService";
import { useLoading } from "../../../../contexts/LoadingContext";

// Component thanh tiến trình
function ProgressStepper({ currentStep, isSubmitting }) {
  const steps = [
    { id: "draft", label: "Nháp", icon: faPen, color: "#f59e0b" },
    { id: "pending", label: "Chờ duyệt", icon: faClock, color: "#3b82f6" },
    {
      id: "approved",
      label: "Đã duyệt",
      icon: faCheckCircle,
      color: "#8b5cf6",
    },
    {
      id: "published",
      label: "Đã phát hành",
      icon: faRocket,
      color: "#22c55e",
    },
  ];

  // Xác định step hiện tại
  // 0: draft, 1: pending, 2: approved, 3: published
  // Nếu đang submit -> hiển thị pending
  const activeStep = isSubmitting ? 1 : currentStep;

  return (
    <div className={styles.stepperWrapper}>
      <div className={styles.stepperContainer}>
        {steps.map((step, index) => {
          const isActive = index <= activeStep;
          const isCurrent = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className={styles.stepItem}>
                <div
                  className={`${styles.stepCircle} ${
                    isActive ? styles.active : ""
                  } ${isCompleted ? styles.completed : ""} ${
                    isCurrent ? styles.current : ""
                  }`}
                  style={{
                    borderColor: isActive ? step.color : "#e2e8f0",
                    background: isCompleted ? step.color : "transparent",
                  }}
                >
                  {isCompleted ? (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className={styles.stepIcon}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={step.icon}
                      className={styles.stepIcon}
                    />
                  )}
                </div>

                <div className={styles.stepLabel}>
                  <span className={styles.stepName}>{step.label}</span>
                  <span className={styles.stepStatus}>
                    {isCompleted
                      ? "✓ Hoàn thành"
                      : isCurrent
                        ? "● Đang xử lý"
                        : ""}
                  </span>
                </div>
              </div>

              {/* Line connect */}
              {index < steps.length - 1 && (
                <div
                  className={`${styles.stepLine} ${
                    index < activeStep ? styles.lineActive : ""
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Trạng thái hiện tại */}
      <div className={styles.stepperStatus}>
        <span className={styles.statusBadge}>
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faClock} spin />
              Đang gửi duyệt...
            </>
          ) : (
            <>
              <strong>Nháp</strong>
            </>
          )}
        </span>
        <span className={styles.statusHint}>
          {isSubmitting
            ? "Bài nghe đang được gửi đến Admin để xét duyệt"
            : "Hoàn thành thông tin và gửi duyệt để Admin kiểm tra"}
        </span>
      </div>
    </div>
  );
}

function TeacherListeningLessonCreate() {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const { showLoading, hideLoading } = useLoading();

  const [topic, setTopic] = useState(null);
  const [levels, setLevels] = useState([]);

  const [formData, setFormData] = useState({
    topicId: topicId || "",
    levelId: "",
    title: "",
    description: "",
    isPremium: false,
    lessonImage: null,
  });

  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      showLoading();

      const [topicResponse, levelResponse] = await Promise.all([
        topicService.getById(topicId),
        levelService.getAll(),
      ]);

      const topicData = topicResponse?.data?.data;
      const levelData = levelResponse?.data?.data || [];

      if (!topicData) {
        throw new Error("Không tìm thấy topic.");
      }

      setTopic(topicData);
      setLevels(levelData);

      setFormData((prev) => ({
        ...prev,
        topicId,
      }));
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải dữ liệu.";

      setError(message);
      toast.error(message);
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

    // Kiểm tra kích thước file (max 5MB)
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

    if (formData.lessonImage) {
      data.append("lessonImage", formData.lessonImage);
    }

    return data;
  };

  // TẠO NHÁP
  const handleSaveDraft = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      showLoading();

      const requestData = buildFormData();
      const response = await listeningLessonService.create(requestData);
      const createdLesson = response?.data?.data;
      toast.success("Đã lưu bài nghe vào bản nháp.");
      navigate(`/dashboard/teacher/topics/${topicId}`);
    } catch (error) {
      console.error("Lỗi tạo bài nghe:", error);

      const message =
        error.response?.data?.message ||
        "Không thể tạo bài nghe. Vui lòng thử lại.";

      setError(message);
      toast.error("❌ " + message);
    } finally {
      setSaving(false);
      hideLoading();
    }
  };

  // TẠO XONG → GỬI DUYỆT
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

      // Bước 1: tạo bài nghe
      const requestData = buildFormData();
      const createResponse = await listeningLessonService.create(requestData);
      const createdLesson = createResponse?.data?.data;

      if (!createdLesson?.id) {
        throw new Error("Không lấy được ID bài nghe vừa tạo.");
      }

      // Bước 2: gửi duyệt
      await listeningLessonService.submit(createdLesson.id);

      toast.success("🎉 Tạo bài nghe và gửi duyệt thành công!");

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
            Tạo bài nghe mới
          </h1>
          <p className={styles.subtitle}>
            Tạo bài nghe trong topic <strong>"{topic?.title}"</strong>
          </p>
        </div>
      </div>

      {/* PROGRESS STEPPER */}
      <ProgressStepper currentStep={0} isSubmitting={isSubmitting} />

      {/* CONTENT */}
      <div className={styles.content}>
        <form className={styles.formCard} onSubmit={(e) => e.preventDefault()}>
          {/* Error */}
          {error && (
            <div className={styles.errorMessage}>
              <span></span>
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
                      <small>PNG, JPG, JPEG </small>
                    </label>
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}
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
                  Chỉ học sinh có gói thành viên mới có thể truy cập bài học này
                </p>
              </div>
            </div>
          </div>

          {/* INFO CARD */}
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FontAwesomeIcon icon={faBookOpen} />
            </div>
            <div className={styles.infoContent}>
              <h4>Lưu ý về quy trình</h4>
              <ul className={styles.infoList}>
                <li>
                  <span className={styles.infoDot}>•</span>
                  <strong>Lưu nháp:</strong> Bài nghe được tạo với trạng thái
                  "Nháp". Bạn có thể chỉnh sửa sau.
                </li>
                <li>
                  <span className={styles.infoDot}>•</span>
                  <strong>Gửi duyệt:</strong> Bài nghe chuyển sang "Chờ duyệt".
                  Không thể chỉnh sửa khi đang chờ Admin xét duyệt.
                </li>
                <li>
                  <span className={styles.infoDot}>•</span>
                  <strong>Phát hành:</strong> Sau khi Admin duyệt, bài nghe sẽ
                  được phát hành và học sinh có thể truy cập.
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

export default TeacherListeningLessonCreate;
