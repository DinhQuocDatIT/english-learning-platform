import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faEdit,
  faTrash,
  faGripVertical,
  faSave,
  faTimes,
  faHeadphones,
  faLanguage,
  faPlay,
  faSpinner,
  faBook,
  faTag,
  faCrown,
  faPause,
  faForward,
  faStop,
  faLock,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import listeningLessonService from "../../../../services/listeningLessonService";
import listeningSentenceService from "../../../../services/listeningSentenceService";
import getImageUrl from "../../../../utils/imageUrl";
import { useLoading } from "../../../../contexts/LoadingContext";
import { speakText } from "../../../../utils/textToSpeech";
import { STATUS_MAP, STATUS_BG_COLOR_MAP } from "../../../../constants/status";
import PlaybackSpeedPopup from "../../../../components/PlaybackSpeedPopup/PlaybackSpeedPopup";
import PlaybackVoicePopup from "../../../../components/PlaybackVoicePopup/PlaybackVoicePopup";
import styles from "./ListeningSentenceManage.module.css";

const EDITABLE_STATUSES = ["DRAFT", "REJECTED"];

function ListeningSentenceManage() {
  const navigate = useNavigate();
  const { topicId, lessonId } = useParams();
  const { showLoading, hideLoading } = useLoading();

  const [lesson, setLesson] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho câu đang chọn để nghe
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // State cho text-to-speech
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);

  // State cho tốc độ và popup
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [showSpeedPopup, setShowSpeedPopup] = useState(false);
  const [showVoicePopup, setShowVoicePopup] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSentence, setEditingSentence] = useState(null);
  const [formData, setFormData] = useState({
    englishText: "",
    vietnameseMeaning: "",
    sentenceOrder: 1,
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Kiểm tra có được chỉnh sửa không
  const canEdit = EDITABLE_STATUSES.includes(lesson?.status);

  // Helper để lấy tốc độ dạng số
  const getNumericSpeed = (speedStr) =>
    parseFloat(speedStr.replace("x", "")) || 1.0;

  // Khởi tạo voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter((v) =>
        v.lang.startsWith("en"),
      );
      const listToUse =
        englishVoices.length > 0 ? englishVoices : availableVoices;

      setVoices(listToUse);
      setSelectedVoice((prev) => {
        if (prev && listToUse.some((v) => v.name === prev.name)) return prev;
        return (
          listToUse.find((v) => v.lang === "en-US") || listToUse[0] || null
        );
      });
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    fetchData();
    return () => window.speechSynthesis.cancel();
  }, [lessonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      showLoading();

      const [lessonResponse, sentenceResponse] = await Promise.all([
        listeningLessonService.getById(lessonId),
        listeningSentenceService.getByLesson(lessonId),
      ]);

      const lessonData = lessonResponse?.data?.data;
      const sentenceData = sentenceResponse?.data?.data;

      setLesson(lessonData || null);
      setSentences(Array.isArray(sentenceData) ? sentenceData : []);

      if (sentenceData && sentenceData.length > 0) {
        setSelectedSentence(sentenceData[0]);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleGoBack = () => {
    window.speechSynthesis.cancel();
    navigate(`/dashboard/teacher/topics/${topicId}`);
  };

  // ===== TEXT-TO-SPEECH =====
  const handleSpeak = (text, sentenceId) => {
    if (speakingId === sentenceId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsPlaying(false);
      return;
    }

    if (speakingId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsPlaying(false);
    }

    setIsPlaying(true);

    speakText(text, {
      lang: selectedVoice ? selectedVoice.lang : "en-US",
      voice: selectedVoice,
      rate: getNumericSpeed(playbackSpeed),
      onStart: () => {
        setSpeakingId(sentenceId);
      },
      onEnd: () => {
        setSpeakingId(null);
        setIsPlaying(false);
      },
      onError: () => {
        setSpeakingId(null);
        setIsPlaying(false);
        toast.error("Lỗi khi phát âm. Vui lòng thử lại.");
      },
    });
  };

  // ===== CLICK VÀO CÂU =====
  const handleSelectSentence = (sentence) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      setIsPlaying(false);
    }
    setSelectedSentence(sentence);
  };

  // ===== OPEN MODAL =====
  const openCreateModal = () => {
    // Chỉ cho phép khi có thể chỉnh sửa
    if (!canEdit) {
      toast.warning(
        `Không thể thêm câu hỏi khi bài nghe ở trạng thái "${STATUS_MAP[lesson?.status]}"`,
      );
      return;
    }
    setEditingSentence(null);
    setFormData({
      englishText: "",
      vietnameseMeaning: "",
      sentenceOrder: sentences.length + 1,
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (sentence) => {
    // Chỉ cho phép khi có thể chỉnh sửa
    if (!canEdit) {
      toast.warning(
        `Không thể chỉnh sửa câu hỏi khi bài nghe ở trạng thái "${STATUS_MAP[lesson?.status]}"`,
      );
      return;
    }
    setEditingSentence(sentence);
    setFormData({
      englishText: sentence.englishText,
      vietnameseMeaning: sentence.vietnameseMeaning || "",
      sentenceOrder: sentence.sentenceOrder,
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSentence(null);
    setFormData({
      englishText: "",
      vietnameseMeaning: "",
      sentenceOrder: 1,
    });
    setFormError("");
  };

  // ===== HANDLE FORM =====
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "sentenceOrder" ? parseInt(value) || 0 : value,
    }));
    setFormError("");
  };

  const validateForm = () => {
    if (!formData.englishText.trim()) {
      setFormError("Nội dung tiếng Anh không được để trống.");
      return false;
    }
    if (!formData.sentenceOrder || formData.sentenceOrder < 1) {
      setFormError("Thứ tự câu phải lớn hơn 0.");
      return false;
    }
    const duplicate = sentences.some(
      (s) =>
        s.sentenceOrder === formData.sentenceOrder &&
        s.id !== editingSentence?.id,
    );
    if (duplicate) {
      setFormError("Thứ tự câu đã tồn tại. Vui lòng chọn thứ tự khác.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      showLoading();

      const requestData = {
        listeningLessonId: Number(lessonId),
        englishText: formData.englishText.trim(),
        vietnameseMeaning: formData.vietnameseMeaning.trim(),
        sentenceOrder: formData.sentenceOrder,
      };

      if (editingSentence) {
        await listeningSentenceService.update(editingSentence.id, requestData);
        toast.success("Cập nhật câu hỏi thành công!");
      } else {
        await listeningSentenceService.create(requestData);
        toast.success("Thêm câu hỏi thành công!");
      }

      closeModal();
      await fetchData();
    } catch (error) {
      console.error("Lỗi lưu câu hỏi:", error);
      setFormError(error.response?.data?.message || "Không thể lưu câu hỏi.");
    } finally {
      setSaving(false);
      hideLoading();
    }
  };

  // ===== DELETE =====
  const handleDelete = async (sentence) => {
    // Chỉ cho phép khi có thể chỉnh sửa
    if (!canEdit) {
      toast.warning(
        `Không thể xóa câu hỏi khi bài nghe ở trạng thái "${STATUS_MAP[lesson?.status]}"`,
      );
      return;
    }

    if (!window.confirm(`Bạn chắc chắn muốn xóa câu hỏi này?`)) return;

    try {
      showLoading();
      await listeningSentenceService.delete(sentence.id);
      toast.success("Xóa câu hỏi thành công!");

      if (selectedSentence?.id === sentence.id) {
        const remaining = sentences.filter((s) => s.id !== sentence.id);
        setSelectedSentence(remaining.length > 0 ? remaining[0] : null);
      }

      await fetchData();
    } catch (error) {
      console.error("Lỗi xóa câu hỏi:", error);
      toast.error(error.response?.data?.message || "Không thể xóa câu hỏi.");
    } finally {
      hideLoading();
    }
  };

  // ===== DRAG & DROP REORDER =====
  const onDragEnd = async (result) => {
    // Chỉ cho phép khi có thể chỉnh sửa
    if (!canEdit) {
      toast.warning(
        `Không thể sắp xếp câu hỏi khi bài nghe ở trạng thái "${STATUS_MAP[lesson?.status]}"`,
      );
      return;
    }

    if (!result.destination) return;

    const items = Array.from(sentences);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedSentences = items.map((item, index) => ({
      ...item,
      sentenceOrder: index + 1,
    }));

    setSentences(reorderedSentences);

    try {
      const sentenceIds = reorderedSentences.map((item) => item.id);
      await listeningSentenceService.reorder(Number(lessonId), sentenceIds);
    } catch (error) {
      console.error("Lỗi sắp xếp:", error);
      toast.error(error.response?.data?.message || "Không thể sắp xếp.");
      await fetchData();
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_BG_COLOR_MAP[lesson?.status] || "#64748b";

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Quay lại</span>
        </button>

        <div className={styles.headerStatus}>
          {!canEdit && (
            <span className={styles.headerLocked}>
              <FontAwesomeIcon icon={faLock} />
              Chỉ xem
            </span>
          )}
        </div>
        <button
          className={styles.previewBtn}
          onClick={() =>
            navigate(
              `/dashboard/teacher/topics/${topicId}/listening-lessons/${lessonId}/preview`,
            )
          }
        >
          <FontAwesomeIcon icon={faEye} />
          Xem trước
        </button>
      </div>

      {/* Two columns layout */}
      <div className={styles.twoColumns}>
        {/* LEFT COLUMN - Lesson Info */}
        <div className={styles.leftColumn}>
          {/* Lesson Card */}
          <div className={styles.lessonCard}>
            {/* Image */}
            <div className={styles.lessonImageWrapper}>
              {getImageUrl(lesson?.lessonImage) ? (
                <img
                  src={getImageUrl(lesson?.lessonImage)}
                  alt={lesson?.title}
                  className={styles.lessonImage}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : (
                <div className={styles.lessonImageFallback}>
                  <FontAwesomeIcon icon={faHeadphones} />
                </div>
              )}
              <div className={styles.lessonImageOverlay}>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: statusColor }}
                >
                  {STATUS_MAP[lesson?.status] || lesson?.status}
                </span>
                {lesson?.isPremium && (
                  <span className={styles.premiumBadge}>
                    <FontAwesomeIcon icon={faCrown} />
                    Pro
                  </span>
                )}
              </div>
            </div>

            {/* Lesson Info compact */}
            <div className={styles.lessonInfoCompact}>
              <h2 className={styles.lessonTitleCompact}>{lesson?.title}</h2>
              {lesson?.description && (
                <p className={styles.lessonDescCompact}>
                  {lesson?.description}
                </p>
              )}
              <div className={styles.lessonMetaCompact}>
                <span>
                  <FontAwesomeIcon icon={faBook} />
                  {lesson?.topicTitle || "N/A"}
                </span>
                <span style={{ color: lesson?.levelColor || "#64748b" }}>
                  <FontAwesomeIcon icon={faTag} />
                  {lesson?.levelName || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Player Section */}
          <div className={styles.playerSection}>
            <div className={styles.playerHeader}>
              <span className={styles.playerTitle}>
                <FontAwesomeIcon icon={faPlay} />
              </span>
              {selectedSentence && (
                <span className={styles.playerOrder}>
                  #{selectedSentence.sentenceOrder}
                </span>
              )}
            </div>

            {selectedSentence ? (
              <div className={styles.playerContent}>
                <div className={styles.playerText}>
                  <p className={styles.playerEnglish}>
                    {selectedSentence.englishText}
                  </p>
                  {selectedSentence.vietnameseMeaning && (
                    <p className={styles.playerVietnamese}>
                      {selectedSentence.vietnameseMeaning}
                    </p>
                  )}
                </div>

                <div className={styles.playerControls}>
                  {/* Play Button */}
                  <button
                    type="button"
                    className={`${styles.playBtn} ${
                      isPlaying && speakingId === selectedSentence.id
                        ? styles.playing
                        : ""
                    }`}
                    onClick={() =>
                      handleSpeak(
                        selectedSentence.englishText,
                        selectedSentence.id,
                      )
                    }
                    disabled={!selectedSentence}
                    title={
                      isPlaying && speakingId === selectedSentence.id
                        ? "Đang phát..."
                        : "Phát"
                    }
                  >
                    {isPlaying && speakingId === selectedSentence.id ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Đang phát...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlay} />
                        Phát
                      </>
                    )}
                  </button>
                  <div>
                    {" "}
                    {/* Voice Selector */}
                    <PlaybackVoicePopup
                      voices={voices}
                      selectedVoice={selectedVoice}
                      setSelectedVoice={setSelectedVoice}
                      showVoicePopup={showVoicePopup}
                      setShowVoicePopup={setShowVoicePopup}
                    />
                    {/* Speed Selector */}
                    <PlaybackSpeedPopup
                      playbackSpeed={playbackSpeed}
                      setPlaybackSpeed={setPlaybackSpeed}
                      showSpeedPopup={showSpeedPopup}
                      setShowSpeedPopup={setShowSpeedPopup}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.playerEmpty}>
                <p>Chọn một câu ở bên phải để nghe</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <button
              className={`${styles.actionBtn} ${!canEdit ? styles.actionBtnDisabled : ""}`}
              onClick={openCreateModal}
              disabled={!canEdit}
              title={
                !canEdit
                  ? `Không thể thêm khi bài nghe ở trạng thái ${STATUS_MAP[lesson?.status]}`
                  : ""
              }
            >
              <FontAwesomeIcon icon={faPlus} />
              {canEdit ? "Thêm câu hỏi" : "Không thể thêm"}
            </button>
          </div>

          {/* Thông báo nếu không thể chỉnh sửa */}
          {!canEdit && (
            <div className={styles.lockedNotice}>
              <FontAwesomeIcon icon={faLock} />
              <span>
                Bài nghe đang ở trạng thái{" "}
                <strong>"{STATUS_MAP[lesson?.status]}"</strong>, không thể chỉnh
                sửa câu hỏi.
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Sentences List */}
        <div className={styles.rightColumn}>
          <div className={styles.sentencesHeader}>
            <div className={styles.sentencesTitle}>
              <FontAwesomeIcon icon={faLanguage} />
              <span>Danh sách câu hỏi</span>
            </div>
            <span className={styles.sentenceCount}>{sentences.length}</span>
          </div>

          {sentences.length === 0 ? (
            <div className={styles.emptySentences}>
              <FontAwesomeIcon icon={faLanguage} className={styles.emptyIcon} />
              <p>Chưa có câu hỏi nào</p>
              {canEdit ? (
                <button
                  className={styles.emptyAddBtn}
                  onClick={openCreateModal}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Thêm câu hỏi đầu tiên
                </button>
              ) : (
                <p className={styles.emptyLocked}>
                  <FontAwesomeIcon icon={faLock} />
                  Không thể thêm câu hỏi khi bài nghe ở trạng thái "
                  {STATUS_MAP[lesson?.status]}"
                </p>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sentences">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={styles.sentencesList}
                  >
                    {sentences.map((sentence, index) => (
                      <Draggable
                        key={sentence.id}
                        draggableId={String(sentence.id)}
                        index={index}
                        isDragDisabled={!canEdit}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${styles.sentenceItem} ${
                              selectedSentence?.id === sentence.id
                                ? styles.sentenceActive
                                : ""
                            } ${!canEdit ? styles.sentenceReadonly : ""}`}
                            onClick={() => handleSelectSentence(sentence)}
                          >
                            <div
                              className={styles.dragHandle}
                              {...provided.dragHandleProps}
                              style={{
                                cursor: canEdit ? "grab" : "default",
                                opacity: canEdit ? 1 : 0.3,
                              }}
                            >
                              <FontAwesomeIcon icon={faGripVertical} />
                            </div>
                            <div className={styles.sentenceOrder}>
                              {sentence.sentenceOrder}
                            </div>
                            <div className={styles.sentenceContent}>
                              <div className={styles.englishText}>
                                {sentence.englishText}
                              </div>
                              {sentence.vietnameseMeaning && (
                                <div className={styles.vietnameseText}>
                                  {sentence.vietnameseMeaning}
                                </div>
                              )}
                            </div>
                            <div className={styles.sentenceActions}>
                              {canEdit && (
                                <>
                                  <button
                                    className={styles.editBtn}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(sentence);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(sentence);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </>
                              )}
                              {!canEdit && (
                                <span className={styles.readonlyIcon}>
                                  <FontAwesomeIcon icon={faLock} />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* MODAL - Chỉ hiện khi canEdit */}
      {showModal && canEdit && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {editingSentence ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
              </h2>
              <button className={styles.modalClose} onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {formError && (
                <div className={styles.errorMessage}>{formError}</div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="englishText">
                  Nội dung tiếng Anh <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="englishText"
                  name="englishText"
                  value={formData.englishText}
                  onChange={handleFormChange}
                  placeholder="Nhập câu tiếng Anh..."
                  rows={3}
                  className={styles.textarea}
                  disabled={saving}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="vietnameseMeaning">Nghĩa tiếng Việt</label>
                <textarea
                  id="vietnameseMeaning"
                  name="vietnameseMeaning"
                  value={formData.vietnameseMeaning}
                  onChange={handleFormChange}
                  placeholder="Nhập nghĩa tiếng Việt (tùy chọn)..."
                  rows={2}
                  className={styles.textarea}
                  disabled={saving}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="sentenceOrder">
                  Thứ tự <span className={styles.required}>*</span>
                </label>
                <input
                  id="sentenceOrder"
                  name="sentenceOrder"
                  type="number"
                  min="1"
                  value={formData.sentenceOrder}
                  onChange={handleFormChange}
                  className={styles.input}
                  disabled={saving}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faSave} />
                  {saving
                    ? "Đang lưu..."
                    : editingSentence
                      ? "Cập nhật"
                      : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListeningSentenceManage;
