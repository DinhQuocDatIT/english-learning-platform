import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faRobot,
  faPlay,
  faSpinner,
  faBookOpen,
  faTags,
  faList,
  faLightbulb,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import practiceService from "../../../../services/practiceService";
import { useLoading } from "../../../../contexts/LoadingContext";
import styles from "./StudentAIPracticeCreate.module.css";

function StudentAIPracticeCreate() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [formData, setFormData] = useState({
    level: "B1",
    sentenceType: "RANDOM",
    topic: "TRAVEL",
    questionLimit: 20,
    vocabularyWords: [],
  });

  // ✅ State cho từ vựng nhập tay
  const [vocabInputs, setVocabInputs] = useState([""]); // Mỗi ô là 1 từ
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ LEVELS - Khớp với backend (A1, A2, B1, B2, C1, C2)
  const LEVELS = [
    { value: "A1", label: "A1 - Sơ cấp", color: "#22c55e" },
    { value: "A2", label: "A2 - Sơ cấp+", color: "#84cc16" },
    { value: "B1", label: "B1 - Trung cấp", color: "#eab308" },
    { value: "B2", label: "B2 - Trung cấp+", color: "#f97316" },
    { value: "C1", label: "C1 - Cao cấp", color: "#ef4444" },
    { value: "C2", label: "C2 - Thành thạo", color: "#8b5cf6" },
  ];

  // ✅ SENTENCE_TYPES - Khớp với backend (QUESTION, ANSWER, RANDOM)
  const SENTENCE_TYPES = [
    { value: "QUESTION", label: "Câu hỏi" },
    { value: "ANSWER", label: "Câu trả lời" },
    { value: "RANDOM", label: "Ngẫu nhiên" },
  ];

  const TOPICS = [
    { value: "DAILY_CONVERSATION", label: "💬 Đời sống hàng ngày" },
    { value: "SHOPPING", label: "🛍️ Mua sắm" },
    { value: "RESTAURANT", label: "🍽️ Nhà hàng" },
    { value: "TRAVEL", label: "✈️ Du lịch" },
    { value: "WORK", label: "💼 Công việc" },
    { value: "SCHOOL", label: "🏫 Trường học" },
    { value: "FAMILY", label: "👨‍👩‍👧‍👦 Gia đình" },
    { value: "FRIENDS", label: "🤝 Bạn bè" },
    { value: "FOOD", label: "🍕 Đồ ăn" },
    { value: "HEALTH", label: "🏥 Sức khỏe" },
    { value: "EDUCATION", label: "📚 Giáo dục" },
    { value: "TECHNOLOGY", label: "💻 Công nghệ" },
    { value: "HOBBIES", label: "🎨 Sở thích" },
    { value: "DAILY_ROUTINE", label: "🌅 Thói quen hàng ngày" },
  ];

  // ✅ QUESTION_LIMITS - Khớp với backend (10, 20, 30, 50)
  const QUESTION_LIMITS = [
    { value: 10, label: "10 câu" },
    { value: 20, label: "20 câu" },
    { value: 30, label: "30 câu" },
    { value: 50, label: "50 câu" },
  ];

  // ✅ MAX VOCABULARY WORDS
  const MAX_VOCAB_WORDS = 5; // Tối đa 5 từ

  // ===== HANDLE VOCABULARY INPUT =====

  // Thay đổi giá trị của 1 ô nhập
  const handleVocabChange = (index, value) => {
    const newInputs = [...vocabInputs];
    newInputs[index] = value;
    setVocabInputs(newInputs);
  };

  // Thêm ô nhập mới
  const addVocabInput = () => {
    if (vocabInputs.length >= MAX_VOCAB_WORDS) {
      toast.warning(`Chỉ được nhập tối đa ${MAX_VOCAB_WORDS} từ vựng`);
      return;
    }
    setVocabInputs([...vocabInputs, ""]);
  };

  // Xóa 1 ô nhập
  const removeVocabInput = (index) => {
    if (vocabInputs.length <= 1) {
      // Không xóa ô cuối cùng, chỉ clear giá trị
      setVocabInputs([""]);
      return;
    }
    const newInputs = vocabInputs.filter((_, i) => i !== index);
    setVocabInputs(newInputs);
  };

  // Lấy danh sách từ vựng hợp lệ (không rỗng)
  const getValidVocabWords = () => {
    return vocabInputs
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
  };

  // ===== HANDLE SUBMIT =====

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate: Phải chọn topic
    if (!formData.topic) {
      toast.warning("Vui lòng chọn chủ đề.");
      return;
    }

    // Lấy danh sách từ vựng hợp lệ
    const vocabularyWords = getValidVocabWords();

    // Kiểm tra số lượng từ vựng
    if (vocabularyWords.length > MAX_VOCAB_WORDS) {
      toast.warning(`Chỉ được nhập tối đa ${MAX_VOCAB_WORDS} từ vựng`);
      return;
    }

    try {
      setIsSubmitting(true);
      showLoading();

      // ✅ Payload đúng với CreatePracticeRequest của backend
      const payload = {
        level: formData.level,
        sentenceType: formData.sentenceType,
        topic: formData.topic,
        questionLimit: formData.questionLimit,
        vocabularyWords: vocabularyWords, // Gửi danh sách từ đã nhập
      };

      console.log("📤 Payload gửi lên backend:", payload);

      const response = await practiceService.createPractice(payload);
      const data = response?.data?.data;

      toast.success("🎉 Tạo bài luyện tập thành công!");
      navigate(`/dashboard/student/ai-practice/chat/${data.id}`);
    } catch (error) {
      console.error("❌ Lỗi tạo practice:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.data?.message ||
        "Không thể tạo bài luyện tập. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      hideLoading();
    }
  };

  const handleBack = () => {
    navigate("/dashboard/student/ai-practice");
  };

  // ✅ Kiểm tra form đã hợp lệ chưa
  const isFormValid = formData.level && formData.topic && formData.sentenceType;

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Quay lại
        </button>
        <h1 className={styles.headerTitle}>
          <FontAwesomeIcon icon={faRobot} className={styles.headerIcon} />
          Tạo bài luyện tập
        </h1>
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          {/* Level */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faBookOpen} />
              Trình độ
            </label>
            <div className={styles.levelOptions}>
              {LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`${styles.levelOption} ${
                    formData.level === level.value ? styles.active : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, level: level.value }))
                  }
                  style={{
                    borderColor:
                      formData.level === level.value ? level.color : "",
                    backgroundColor:
                      formData.level === level.value ? `${level.color}15` : "",
                  }}
                >
                  <span
                    className={styles.levelDot}
                    style={{ backgroundColor: level.color }}
                  />
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sentence Type */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faList} />
              Loại câu
            </label>
            <div className={styles.typeOptions}>
              {SENTENCE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`${styles.typeOption} ${
                    formData.sentenceType === type.value ? styles.active : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      sentenceType: type.value,
                    }))
                  }
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faTags} />
              Chủ đề
            </label>
            <div className={styles.topicOptions}>
              {TOPICS.map((topic) => (
                <button
                  key={topic.value}
                  type="button"
                  className={`${styles.topicOption} ${
                    formData.topic === topic.value ? styles.active : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, topic: topic.value }))
                  }
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Limit */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Số câu</label>
            <div className={styles.limitOptions}>
              {QUESTION_LIMITS.map((limit) => (
                <button
                  key={limit.value}
                  type="button"
                  className={`${styles.limitOption} ${
                    formData.questionLimit === limit.value ? styles.active : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      questionLimit: limit.value,
                    }))
                  }
                >
                  {limit.label}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ VOCABULARY - NHẬP TAY TỪNG Ô */}
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faLightbulb} />
              Từ vựng (không bắt buộc)
            </label>
            <p className={styles.formHint}>
              Nhập từ vựng bạn muốn AI sử dụng trong câu hỏi (tối đa{" "}
              {MAX_VOCAB_WORDS} từ)
            </p>

            <div className={styles.vocabInputContainer}>
              {vocabInputs.map((word, index) => (
                <div key={index} className={styles.vocabInputWrapper}>
                  <input
                    type="text"
                    className={styles.vocabInput}
                    placeholder={`Nhập từ cần luyện`}
                    value={word}
                    onChange={(e) => handleVocabChange(index, e.target.value)}
                    maxLength={50}
                  />
                  {vocabInputs.length > 1 && (
                    <button
                      type="button"
                      className={styles.vocabRemoveBtn}
                      onClick={() => removeVocabInput(index)}
                      title="Xóa từ này"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              ))}

              {vocabInputs.length < MAX_VOCAB_WORDS && (
                <button
                  type="button"
                  className={styles.vocabAddBtn}
                  onClick={addVocabInput}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Thêm từ
                </button>
              )}
            </div>

            {/* Hiển thị số từ đã nhập */}
            <div className={styles.vocabCounter}>
              <span>
                Đã nhập: {getValidVocabWords().length} / {MAX_VOCAB_WORDS} từ
              </span>
              {getValidVocabWords().length > 0 && (
                <span className={styles.vocabPreview}>
                  ({getValidVocabWords().join(", ")})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleBack}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Đang tạo...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlay} />
                Bắt đầu luyện tập
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentAIPracticeCreate;
