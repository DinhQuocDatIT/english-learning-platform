import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeadphones,
  faBook,
  faTag,
  faUser,
  faCalendar,
  faClock,
  faCrown,
  faImage,
  faInfoCircle,
  faLayerGroup,
  faCheckCircle,
  faCheck,
  faTimes,
  faRocket,
  faHistory,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import listeningLessonService from "../../../../../services/listeningLessonService";
import listeningLessonReviewService from "../../../../../services/listeningLessonReviewService";
import getImageUrl from "../../../../../utils/imageUrl";
import { useLoading } from "../../../../../contexts/LoadingContext";

import styles from "./AdminListeningLessonReview.module.css";

// Map trạng thái
const STATUS_MAP = {
  DRAFT: "Nháp",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  PUBLISHED: "Đã phát hành",
};

const STATUS_COLOR_MAP = {
  DRAFT: { bg: "#d4f3ef", text: "#0ea792", border: "#0ea792" },
  PENDING: { bg: "#b7e6e0", text: "#0d8a7a", border: "#0d8a7a" },
  APPROVED: { bg: "#9ad9d1", text: "#0a7568", border: "#0a7568" },
  REJECTED: { bg: "#fdd5d5", text: "#dc2626", border: "#dc2626" },
  PUBLISHED: { bg: "#b8f0d0", text: "#16a34a", border: "#16a34a" },
};

// Component thanh tiến trình
function ProgressStepper({ currentStep }) {
  const steps = [
    {
      id: "draft",
      label: "Nháp",
      subLabel: "Đang tạo nội dung",
      color: "#0ea792",
    },
    {
      id: "pending",
      label: "Đang duyệt",
      subLabel: "Chờ admin xét duyệt",
      color: "#0d8a7a",
    },
    {
      id: "approved",
      label: "Đã duyệt",
      subLabel: "Admin đã duyệt",
      color: "#0a7568",
    },
    {
      id: "published",
      label: "Đã phát hành",
      subLabel: "Học sinh có thể xem",
      color: "#168a7c",
    },
  ];

  const statusToIndex = {
    DRAFT: 0,
    PENDING: 1,
    APPROVED: 2,
    PUBLISHED: 3,
    REJECTED: 0,
  };

  const activeStep = statusToIndex[currentStep] || 0;

  return (
    <div className={styles.stepperWrapper}>
      <div className={styles.stepperContainer}>
        {steps.map((step, index) => {
          const isActive = index <= activeStep;
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`${styles.stepItem} ${isActive ? styles.active : ""}`}
              >
                <div
                  className={`${styles.stepCircle} ${
                    isCompleted ? styles.completed : ""
                  } ${isCurrent ? styles.current : ""}`}
                  style={{
                    borderColor: isActive ? step.color : "#e2e8f0",
                    background: isCompleted ? step.color : "transparent",
                  }}
                >
                  {isCompleted ? (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className={styles.stepIconCheck}
                    />
                  ) : (
                    <span className={styles.stepNumber}>{index + 1}</span>
                  )}
                </div>

                <div className={styles.stepLabel}>
                  <span
                    className={styles.stepName}
                    style={{ color: isActive ? step.color : "#94a3b8" }}
                  >
                    {step.label}
                  </span>
                  <span className={styles.stepSubLabel}>{step.subLabel}</span>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`${styles.stepLine} ${
                    index < activeStep ? styles.lineActive : ""
                  }`}
                  style={{
                    background:
                      index < activeStep
                        ? `linear-gradient(to right, ${steps[index].color}, ${steps[index + 1].color})`
                        : "#e2e8f0",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function AdminListeningLessonReview() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [lesson, setLesson] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Hiển thị form reject trong trang (không phải modal)
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (lessonId) {
      fetchData();
    }
  }, [lessonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      showLoading();

      const [lessonResponse, reviewResponse] = await Promise.all([
        listeningLessonService.getById(lessonId),
        listeningLessonReviewService.getByLesson(lessonId),
      ]);

      const lessonData = lessonResponse?.data?.data;
      const reviewData = reviewResponse?.data?.data;

      if (!lessonData) {
        throw new Error("Không tìm thấy bài nghe.");
      }

      setLesson(lessonData);
      setReviews(Array.isArray(reviewData) ? reviewData : []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      setError(error.message || "Không thể tải thông tin bài nghe.");
      toast.error("❌ " + error.message);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleGoBack = () => {
    navigate(`/dashboard/admin/review`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===== ADMIN ACTIONS (trong trang, không popup) =====

  // Approve
  const handleApprove = async () => {
    if (!window.confirm("Bạn chắc chắn muốn duyệt bài nghe này?")) return;

    try {
      setActionLoading(true);
      showLoading();

      await listeningLessonService.approve(lessonId);

      await listeningLessonReviewService.create({
        listeningLessonId: Number(lessonId),
        action: "APPROVE",
        reason: null,
      });

      toast.success("✅ Duyệt bài nghe thành công!");
      await fetchData();
    } catch (error) {
      console.error("Lỗi duyệt bài nghe:", error);
      toast.error(error.response?.data?.message || "Không thể duyệt bài nghe.");
    } finally {
      setActionLoading(false);
      hideLoading();
    }
  };

  // Reject - hiển thị form trong trang
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      setActionLoading(true);
      showLoading();

      await listeningLessonService.reject(lessonId);

      await listeningLessonReviewService.create({
        listeningLessonId: Number(lessonId),
        action: "REJECT",
        reason: rejectReason.trim(),
      });

      toast.success("❌ Từ chối bài nghe thành công!");
      setShowRejectForm(false);
      setRejectReason("");
      await fetchData();
    } catch (error) {
      console.error("Lỗi từ chối bài nghe:", error);
      toast.error(
        error.response?.data?.message || "Không thể từ chối bài nghe.",
      );
    } finally {
      setActionLoading(false);
      hideLoading();
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!window.confirm("Bạn chắc chắn muốn phát hành bài nghe này?")) return;

    try {
      setActionLoading(true);
      showLoading();

      await listeningLessonService.publish(lessonId);

      await listeningLessonReviewService.create({
        listeningLessonId: Number(lessonId),
        action: "PUBLISH",
        reason: null,
      });

      toast.success("🚀 Phát hành bài nghe thành công!");
      await fetchData();
    } catch (error) {
      console.error("Lỗi phát hành bài nghe:", error);
      toast.error(
        error.response?.data?.message || "Không thể phát hành bài nghe.",
      );
    } finally {
      setActionLoading(false);
      hideLoading();
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải thông tin bài nghe...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <FontAwesomeIcon icon={faHeadphones} className={styles.errorIcon} />
          <h3>Không thể tải bài nghe</h3>
          <p>{error || "Bài nghe không tồn tại."}</p>
          <button className={styles.backButtonError} onClick={handleGoBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_COLOR_MAP[lesson.status] || {
    bg: "#f1f5f9",
    text: "#475569",
    border: "#94a3b8",
  };

  const canApprove = lesson.status === "PENDING";
  const canReject = lesson.status === "PENDING";
  const canPublish = lesson.status === "APPROVED";

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Quay lại danh sách duyệt</span>
        </button>
        <div className={styles.headerActions}>
          {canApprove && (
            <button
              className={`${styles.actionBtn} ${styles.approveBtn}`}
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faCheck} />
              )}
              Duyệt bài
            </button>
          )}
          {canReject && (
            <button
              className={`${styles.actionBtn} ${styles.rejectBtn}`}
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={actionLoading}
            >
              <FontAwesomeIcon icon={faTimes} />
              {showRejectForm ? "Đóng form" : "Từ chối"}
            </button>
          )}
          {canPublish && (
            <button
              className={`${styles.actionBtn} ${styles.publishBtn}`}
              onClick={handlePublish}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faRocket} />
              )}
              Phát hành
            </button>
          )}
        </div>
      </div>

      {/* Progress Stepper */}
      <ProgressStepper currentStep={lesson.status} />

      {/* Reject Form - hiển thị ngay trong trang */}
      {showRejectForm && (
        <div className={styles.rejectFormContainer}>
          <div className={styles.rejectForm}>
            <h3>❌ Từ chối bài nghe</h3>
            <div className={styles.formGroup}>
              <label htmlFor="rejectReason">
                Lý do từ chối <span className={styles.required}>*</span>
              </label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối bài nghe..."
                rows={4}
                className={styles.textarea}
                disabled={actionLoading}
              />
              <p className={styles.hint}>
                Lý do sẽ được gửi đến giáo viên để họ chỉnh sửa.
              </p>
            </div>
            <div className={styles.rejectFormActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason("");
                }}
                disabled={actionLoading}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className={styles.submitReject}
                onClick={handleRejectSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Đang xử lý...
                  </>
                ) : (
                  "❌ Từ chối"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.content}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroImageWrapper}>
            {getImageUrl(lesson.lessonImage) ? (
              <img
                src={getImageUrl(lesson.lessonImage)}
                alt={lesson.title}
                className={styles.heroImage}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={styles.heroFallback}
              style={{
                display: getImageUrl(lesson.lessonImage) ? "none" : "flex",
              }}
            >
              <FontAwesomeIcon
                icon={faHeadphones}
                className={styles.fallbackIcon}
              />
            </div>
            <div className={styles.heroOverlay} />
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroBadges}>
              {lesson.levelName && (
                <span
                  className={styles.levelBadge}
                  style={{ color: lesson.levelColor || "#ffffff" }}
                >
                  <FontAwesomeIcon icon={faTag} />
                  {lesson.levelName}
                </span>
              )}
              {lesson.isPremium && (
                <span className={styles.premiumBadge}>
                  <FontAwesomeIcon icon={faCrown} />
                  Premium
                </span>
              )}
              <span
                className={styles.statusBadge}
                style={{
                  backgroundColor: statusInfo.bg,
                  color: statusInfo.text,
                  border: `2px solid ${statusInfo.border}`,
                }}
              >
                {STATUS_MAP[lesson.status] || lesson.status}
              </span>
            </div>

            <h1 className={styles.heroTitle}>{lesson.title}</h1>
            {lesson.description && (
              <p className={styles.heroDescription}>{lesson.description}</p>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          {/* Left Column */}
          <div className={styles.infoLeft}>
            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className={styles.cardIcon}
                />
                Thông tin chi tiết
              </h3>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FontAwesomeIcon icon={faBook} />
                  Topic
                </span>
                <span className={styles.infoValue}>
                  {lesson.topicTitle || "N/A"}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FontAwesomeIcon icon={faLayerGroup} />
                  Trình độ
                </span>
                <span className={styles.infoValue}>
                  {lesson.levelName || "N/A"}
                  {lesson.levelColor && (
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: lesson.levelColor }}
                    />
                  )}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FontAwesomeIcon icon={faUser} />
                  Giáo viên tạo
                </span>
                <span className={styles.infoValue}>
                  {lesson.createdByName || "N/A"}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FontAwesomeIcon icon={faCalendar} />
                  Ngày tạo
                </span>
                <span className={styles.infoValue}>
                  {formatDate(lesson.createdAt)}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FontAwesomeIcon icon={faClock} />
                  Cập nhật
                </span>
                <span className={styles.infoValue}>
                  {formatDate(lesson.updatedAt)}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FontAwesomeIcon icon={faCrown} />
                  Loại bài học
                </span>
                <span className={styles.infoValue}>
                  {lesson.isPremium ? (
                    <span className={styles.premiumText}>Premium</span>
                  ) : (
                    <span className={styles.freeText}>Miễn phí</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.infoRight}>
            {/* Preview Image */}
            <div className={styles.previewCard}>
              <h3 className={styles.cardTitle}>
                <FontAwesomeIcon icon={faImage} className={styles.cardIcon} />
                Ảnh bài nghe
              </h3>
              <div className={styles.previewImageWrapper}>
                {getImageUrl(lesson.lessonImage) ? (
                  <img
                    src={getImageUrl(lesson.lessonImage)}
                    alt={lesson.title}
                    className={styles.previewImage}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={styles.previewFallback}
                  style={{
                    display: getImageUrl(lesson.lessonImage) ? "none" : "flex",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faImage}
                    className={styles.previewFallbackIcon}
                  />
                  <span>Không có ảnh</span>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className={styles.statusCard}>
              <h3 className={styles.cardTitle}>Trạng thái bài học</h3>
              <div className={styles.statusInfo}>
                <div
                  className={styles.statusCircle}
                  style={{ backgroundColor: statusInfo.border }}
                />
                <div>
                  <div className={styles.statusName}>
                    {STATUS_MAP[lesson.status] || lesson.status}
                  </div>
                  <div className={styles.statusDescription}>
                    {lesson.status === "DRAFT" &&
                      "Bài nghe đang ở trạng thái nháp, chờ giáo viên gửi duyệt."}
                    {lesson.status === "PENDING" &&
                      "Bài nghe đang chờ Admin xét duyệt."}
                    {lesson.status === "APPROVED" &&
                      "Bài nghe đã được duyệt. Nhấn 'Phát hành' để công khai."}
                    {lesson.status === "REJECTED" &&
                      "Bài nghe đã bị từ chối. Giáo viên cần chỉnh sửa và gửi lại."}
                    {lesson.status === "PUBLISHED" &&
                      "Bài nghe đã được phát hành. Học sinh có thể truy cập."}
                  </div>
                </div>
              </div>
            </div>

            {/* Lịch sử duyệt */}
            <div className={styles.reviewCard}>
              <h3 className={styles.cardTitle}>
                <FontAwesomeIcon icon={faHistory} className={styles.cardIcon} />
                Lịch sử duyệt
              </h3>
              {reviews.length === 0 ? (
                <p className={styles.noReviewText}>Chưa có lịch sử duyệt.</p>
              ) : (
                <div className={styles.reviewList}>
                  {reviews.map((review) => (
                    <div key={review.id} className={styles.reviewItem}>
                      <div className={styles.reviewBadge}>
                        <span
                          className={`${styles.reviewAction} ${
                            review.action === "APPROVE"
                              ? styles.reviewApprove
                              : review.action === "REJECT"
                                ? styles.reviewReject
                                : styles.reviewPublish
                          }`}
                        >
                          {review.action === "APPROVE" && "Duyệt"}
                          {review.action === "REJECT" && "Từ chối"}
                          {review.action === "PUBLISH" && "Phát hành"}
                        </span>
                      </div>
                      <div className={styles.reviewContent}>
                        {review.reason && (
                          <p className={styles.reviewReason}>
                            <strong>Lý do:</strong> {review.reason}
                          </p>
                        )}
                        <span className={styles.reviewTime}>
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminListeningLessonReview;
