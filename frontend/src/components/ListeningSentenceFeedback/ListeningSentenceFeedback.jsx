// src/components/ListeningSentenceFeedback/ListeningSentenceFeedback.jsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faPaperPlane,
  faTrash,
  faClock,
  faFaceSmile,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import EmojiPicker from "emoji-picker-react";

import listeningSentenceFeedbackService from "../../services/listeningSentenceFeedbackService";
import { useLoading } from "../../contexts/LoadingContext";

import styles from "./ListeningSentenceFeedback.module.css";

// ============================================================
// SUB-COMPONENTS (Memoized để tối ưu re-render)
// ============================================================

// Feedback Item Component
const FeedbackItem = memo(
  ({ feedback, isMine, studentName, onDelete, formatTime }) => (
    <div className={styles.feedbackItem}>
      <div className={styles.feedbackItemHeader}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {isMine
              ? studentName || "Học viên"
              : feedback.studentName || feedback.userName || "Học viên"}
          </span>
          <span className={styles.feedbackTime}>
            <FontAwesomeIcon icon={faClock} />
            {formatTime(feedback.createdAt)}
          </span>
        </div>
        {isMine && (
          <button
            className={styles.deleteBtn}
            onClick={() => onDelete(feedback.id)}
            title="Xóa"
            aria-label="Xóa phản hồi"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>
      <div className={styles.feedbackItemContent}>{feedback.content}</div>
    </div>
  ),
);

FeedbackItem.displayName = "FeedbackItem";

// ============================================================
// MAIN COMPONENT
// ============================================================

function ListeningSentenceFeedback({ sentenceId, lessonId }) {
  const { showLoading, hideLoading } = useLoading();

  // State
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [myStudentName, setMyStudentName] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Refs
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const containerRef = useRef(null);

  // ============================================================
  // MEMOIZED VALUES
  // ============================================================

  const myFeedbackIds = useMemo(
    () => new Set(myFeedbacks.map((f) => f.id)),
    [myFeedbacks],
  );

  const totalCount = useMemo(
    () => allFeedbacks.length + myFeedbacks.length,
    [allFeedbacks.length, myFeedbacks.length],
  );

  // ============================================================
  // CALLBACKS (Stable references)
  // ============================================================

  const fetchMyFeedbacks = useCallback(async () => {
    if (!sentenceId) return;

    try {
      setIsLoading(true);
      const response =
        await listeningSentenceFeedbackService.getMyFeedbackBySentence(
          sentenceId,
        );
      const data = response?.data?.data;

      if (Array.isArray(data)) {
        setMyFeedbacks(data);
        if (data.length > 0) {
          const name =
            data[0]?.studentName ||
            data[0]?.student?.name ||
            data[0]?.userName ||
            data[0]?.user?.name ||
            "";
          setMyStudentName(name);
        } else {
          setMyStudentName("");
        }
      } else {
        setMyFeedbacks([]);
        setMyStudentName("");
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Lỗi lấy feedback:", error);
      }
      setMyFeedbacks([]);
      setMyStudentName("");
    } finally {
      setIsLoading(false);
    }
  }, [sentenceId]);

  const fetchAllFeedbacks = useCallback(async () => {
    if (!lessonId) return;

    try {
      const response =
        await listeningSentenceFeedbackService.getByLesson(lessonId);
      setAllFeedbacks(response?.data?.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách feedback:", error);
    }
  }, [lessonId]);

  const handleCreate = useCallback(async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      toast.warning("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    setIsSubmitting(true);
    try {
      showLoading();
      const response = await listeningSentenceFeedbackService.create({
        listeningSentenceId: sentenceId,
        content: trimmedContent,
      });

      const data = response?.data?.data;

      setMyFeedbacks((prev) => [data, ...prev]);

      const name =
        data?.studentName ||
        data?.student?.name ||
        data?.userName ||
        data?.user?.name ||
        "";
      if (name) setMyStudentName(name);

      setContent("");
      setShowEmojiPicker(false);
      toast.success("Gửi phản hồi thành công!");

      if (showAllFeedbacks) {
        await fetchAllFeedbacks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi phản hồi.");
    } finally {
      hideLoading();
      setIsSubmitting(false);
    }
  }, [
    content,
    sentenceId,
    showAllFeedbacks,
    fetchAllFeedbacks,
    showLoading,
    hideLoading,
  ]);

  const handleDelete = useCallback(
    async (feedbackId) => {
      if (!window.confirm("Bạn có chắc muốn xóa phản hồi này?")) return;

      try {
        showLoading();
        await listeningSentenceFeedbackService.delete(feedbackId);

        setMyFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
        toast.success("Xóa phản hồi thành công!");

        if (showAllFeedbacks) {
          await fetchAllFeedbacks();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Không thể xóa phản hồi.");
      } finally {
        hideLoading();
      }
    },
    [showAllFeedbacks, fetchAllFeedbacks, showLoading, hideLoading],
  );

  const handleToggleAllFeedbacks = useCallback(async () => {
    const newState = !showAllFeedbacks;
    if (newState) {
      await fetchAllFeedbacks();
    }
    setShowAllFeedbacks(newState);
  }, [showAllFeedbacks, fetchAllFeedbacks]);

  const handleEmojiClick = useCallback((emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  }, []);

  const formatTime = useCallback((date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleCreate();
      }
    },
    [handleCreate],
  );

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    fetchMyFeedbacks();
  }, [fetchMyFeedbacks]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FontAwesomeIcon icon={faComment} className={styles.headerIcon} />
          <h3 className={styles.headerTitle}>Phản hồi</h3>
          <span className={styles.countBadge}>{totalCount}</span>
        </div>
        <button
          className={styles.toggleBtn}
          onClick={handleToggleAllFeedbacks}
          aria-expanded={showAllFeedbacks}
        >
          {showAllFeedbacks ? "Ẩn" : "Xem tất cả"}
        </button>
      </div>

      {/* CREATE AREA */}
      <div className={styles.createArea}>
        <div className={styles.inputWrapper}>
          <div className={styles.textareaWrapper}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Viết phản hồi của bạn... "
              disabled={isSubmitting}
              aria-label="Nội dung phản hồi"
            />
            <button
              className={styles.emojiBtn}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              type="button"
              title="Chọn biểu tượng cảm xúc"
              aria-label="Mở bảng chọn emoji"
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faFaceSmile} />
            </button>
          </div>

          {showEmojiPicker && (
            <div className={styles.emojiPickerWrapper} ref={emojiPickerRef}>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                searchPlaceholder="Tìm kiếm emoji..."
                width="100%"
                height="350px"
                skinTonesDisabled
              />
            </div>
          )}

          <div className={styles.toolbar}>
            <button
              className={styles.sendBtn}
              onClick={handleCreate}
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} />
              )}
              {isSubmitting ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        </div>
      </div>

      {/* MY FEEDBACKS */}
      {myFeedbacks.length > 0 && (
        <div className={styles.myFeedbacks}>
          <div className={styles.divider} />
          <h4 className={styles.sectionTitle}>
            Phản hồi của tôi ({myFeedbacks.length})
          </h4>
          <div className={styles.feedbackList}>
            {myFeedbacks.map((item) => (
              <FeedbackItem
                key={item.id}
                feedback={item}
                isMine={true}
                studentName={myStudentName}
                onDelete={handleDelete}
                formatTime={formatTime}
              />
            ))}
          </div>
        </div>
      )}

      {/* ALL FEEDBACKS */}
      {showAllFeedbacks && (
        <div className={styles.allFeedbacks}>
          <div className={styles.divider} />
          <h4 className={styles.sectionTitle}>
            Tất cả phản hồi ({allFeedbacks.length})
          </h4>
          {allFeedbacks.length === 0 ? (
            <p className={styles.emptyText}>Chưa có phản hồi nào.</p>
          ) : (
            <div className={styles.feedbackList}>
              {allFeedbacks.map((item) => (
                <FeedbackItem
                  key={item.id}
                  feedback={item}
                  isMine={myFeedbackIds.has(item.id)}
                  studentName={myStudentName}
                  onDelete={handleDelete}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ListeningSentenceFeedback);
