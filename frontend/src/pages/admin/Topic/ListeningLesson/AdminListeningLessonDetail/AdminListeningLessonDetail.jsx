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
  faChevronDown,
  faChevronUp,
  faTimesCircle,
  faCheckCircle as faCheckCircleIcon,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import listeningLessonService from "../../../../../services/listeningLessonService";
import listeningLessonReviewService from "../../../../../services/listeningLessonReviewService";
import getImageUrl from "../../../../../utils/imageUrl";
import { useLoading } from "../../../../../contexts/LoadingContext";
import RejectForm from "../../../../../components/RejectForm/RejectForm";

import styles from "./AdminListeningLessonDetail.module.css";
import {
  STATUS_MAP,
  STATUS_BG_COLOR_MAP,
} from "../../../../../constants/status";
// Map trạng thái

// ===== PROGRESS STEPPER COMPONENT =====
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

// ===== REVIEW ITEM COMPONENT =====
function ReviewItem({ review }) {
  const [expanded, setExpanded] = useState(false);

  const getActionInfo = (action) => {
    switch (action) {
      case "APPROVE":
        return {
          icon: faCheckCircleIcon,
          className: styles.reviewApprove,
          label: "Đã duyệt",
          iconColor: "#22c55e",
          bgColor: "#dcfce7",
        };
      case "REJECT":
        return {
          icon: faTimesCircle,
          className: styles.reviewReject,
          label: "Từ chối",
          iconColor: "#ef4444",
          bgColor: "#fee2e2",
        };
      case "PUBLISH":
        return {
          icon: faRocket,
          className: styles.reviewPublish,
          label: "Đã phát hành",
          iconColor: "#8b5cf6",
          bgColor: "#ede9fe",
        };
      default:
        return {
          icon: faHistory,
          className: "",
          label: action,
          iconColor: "#64748b",
          bgColor: "#f1f5f9",
        };
    }
  };

  const actionInfo = getActionInfo(review.action);
  const hasReason = review.reason && review.reason.trim().length > 0;

  const formatReviewDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return { time: `${hours}:${minutes}`, date: `${day}/${month}/${year}` };
  };

  const formattedDate = formatReviewDate(review.createdAt);

  const parseReasons = (reasonText) => {
    if (!reasonText) return [];
    return reasonText.split(", ").filter((r) => r.trim().length > 0);
  };

  const reasonList = hasReason ? parseReasons(review.reason) : [];
  const shouldShowExpand = reasonList.length > 3;
  const visibleReasons = expanded ? reasonList : reasonList.slice(0, 3);

  return (
    <div className={styles.reviewItem}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewActionWrapper}>
          <div
            className={styles.reviewActionIcon}
            style={{
              backgroundColor: actionInfo.bgColor,
              color: actionInfo.iconColor,
            }}
          >
            <FontAwesomeIcon icon={actionInfo.icon} />
          </div>
          <div>
            <span
              className={`${styles.reviewActionLabel} ${actionInfo.className}`}
            >
              {actionInfo.label}
            </span>
            <div className={styles.reviewTimeWrapper}>
              <span className={styles.reviewTime}>{formattedDate.time}</span>
              <span className={styles.reviewDate}>{formattedDate.date}</span>
            </div>
          </div>
        </div>
      </div>

      {hasReason && (
        <div className={styles.reviewReasons}>
          <div className={styles.reasonLabel}>
            <span>Lý do từ chối</span>
          </div>
          <div className={styles.reasonListDisplay}>
            {visibleReasons.map((reason, index) => (
              <span key={index} className={styles.reasonTag}>
                {reason}
              </span>
            ))}
            {shouldShowExpand && (
              <button
                type="button"
                className={styles.expandBtn}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Thu gọn" : `+${reasonList.length - 3} nữa`}
                <FontAwesomeIcon
                  icon={expanded ? faChevronUp : faChevronDown}
                />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====
function AdminListeningLessonDetail() {
  const navigate = useNavigate();
  const { topicId, lessonId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [lesson, setLesson] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchData();
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
      const message =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải thông tin bài nghe.";
      setError(message);
      toast.error("❌ " + message);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleGoBack = () => {
    navigate(`/dashboard/admin/topics/${topicId}/listening-lessons`);
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

  // ===== ADMIN ACTIONS =====

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

  const handleRejectSubmit = async (reason) => {
    try {
      setActionLoading(true);
      showLoading();

      await listeningLessonService.reject(lessonId);

      await listeningLessonReviewService.create({
        listeningLessonId: Number(lessonId),
        action: "REJECT",
        reason: reason,
      });

      toast.success("❌ Từ chối bài nghe thành công!");
      setShowRejectModal(false);
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

  const statusInfo = STATUS_BG_COLOR_MAP[lesson.status] || {
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
          <span>Quay lại danh sách</span>
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
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
            >
              <FontAwesomeIcon icon={faTimes} />
              Từ chối
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

      {/* Main Content */}
      <div className={styles.content}>
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
                {reviews.length > 0 && (
                  <span className={styles.reviewCount}>{reviews.length}</span>
                )}
              </h3>
              {reviews.length === 0 ? (
                <p className={styles.noReviewText}>Chưa có lịch sử duyệt.</p>
              ) : (
                <div className={styles.reviewList}>
                  {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal - Component riêng */}
      <RejectForm
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleRejectSubmit}
        isLoading={actionLoading}
      />
    </div>
  );
}

export default AdminListeningLessonDetail;
