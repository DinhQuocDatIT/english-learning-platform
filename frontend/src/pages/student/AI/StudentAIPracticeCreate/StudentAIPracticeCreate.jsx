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
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import practiceService from "../../../../services/practiceService";
import vocabularyService from "../../../../services/vocabularyService";
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

  const [vocabularies, setVocabularies] = useState([]);
  const [selectedVocab, setSelectedVocab] = useState([]);
  const [searchVocab, setSearchVocab] = useState("");
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const LEVELS = [
    { value: "A1", label: "A1 - Sơ cấp", color: "#22c55e" },
    { value: "A2", label: "A2 - Sơ cấp+", color: "#84cc16" },
    { value: "B1", label: "B1 - Trung cấp", color: "#eab308" },
    { value: "B2", label: "B2 - Trung cấp+", color: "#f97316" },
    { value: "C1", label: "C1 - Cao cấp", color: "#ef4444" },
    { value: "C2", label: "C2 - Thành thạo", color: "#8b5cf6" },
  ];

  const SENTENCE_TYPES = [
    { value: "QUESTION", label: "Câu hỏi" },
    { value: "ANSWER", label: "Câu trả lời" },
    { value: "RANDOM", label: "Ngẫu nhiên" },
  ];

  const TOPICS = [
    { value: "DAILY_CONVERSATION", label: "Đời sống hàng ngày" },
    { value: "SHOPPING", label: "Mua sắm" },
    { value: "RESTAURANT", label: "Nhà hàng" },
    { value: "TRAVEL", label: "Du lịch" },
    { value: "WORK", label: "Công việc" },
    { value: "SCHOOL", label: "Trường học" },
    { value: "FAMILY", label: "Gia đình" },
    { value: "FRIENDS", label: "Bạn bè" },
  ];

  const QUESTION_LIMITS = [
    { value: 10, label: "10 câu" },
    { value: 20, label: "20 câu" },
    { value: 30, label: "30 câu" },
    { value: 50, label: "50 câu" },
  ];

  useEffect(() => {
    fetchVocabularies();
  }, []);

  const fetchVocabularies = async () => {
    try {
      setLoadingVocab(true);
      const response = await vocabularyService.getStudentVocabularies();
      setVocabularies(response?.data?.data || []);
    } catch (error) {
      console.error("Lỗi lấy từ vựng:", error);
    } finally {
      setLoadingVocab(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVocabToggle = (vocab) => {
    setSelectedVocab((prev) => {
      if (prev.find((v) => v.id === vocab.id)) {
        return prev.filter((v) => v.id !== vocab.id);
      } else {
        return [...prev, vocab];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      showLoading();

      const payload = {
        ...formData,
        vocabularyWords: selectedVocab.map((v) => v.word),
      };

      const response = await practiceService.createPractice(payload);
      const data = response?.data?.data;

      toast.success("Tạo bài luyện tập thành công!");
      navigate(`/dashboard/student/ai-practice/chat/${data.id}`);
    } catch (error) {
      console.error("Lỗi tạo practice:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo bài luyện tập.",
      );
    } finally {
      setIsSubmitting(false);
      hideLoading();
    }
  };

  const handleBack = () => {
    navigate("/dashboard/student/ai-practice");
  };

  const filteredVocab = vocabularies.filter((v) =>
    v.word.toLowerCase().includes(searchVocab.toLowerCase()),
  );

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

          {/* Vocabulary */}
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faLightbulb} />
              Từ vựng (không bắt buộc)
            </label>
            <p className={styles.formHint}>
              Chọn từ vựng để AI sử dụng trong các câu hỏi
            </p>

            <div className={styles.vocabSearch}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Tìm từ vựng..."
                value={searchVocab}
                onChange={(e) => setSearchVocab(e.target.value)}
              />
              <span className={styles.searchCount}>
                {selectedVocab.length} từ đã chọn
              </span>
            </div>

            {loadingVocab ? (
              <div className={styles.vocabLoading}>
                <FontAwesomeIcon icon={faSpinner} spin />
                Đang tải từ vựng...
              </div>
            ) : vocabularies.length === 0 ? (
              <div className={styles.vocabEmpty}>
                <p>Chưa có từ vựng nào. Hãy lưu từ vựng trước khi luyện tập.</p>
              </div>
            ) : (
              <div className={styles.vocabGrid}>
                {filteredVocab.map((vocab) => (
                  <div
                    key={vocab.id}
                    className={`${styles.vocabItem} ${
                      selectedVocab.find((v) => v.id === vocab.id)
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => handleVocabToggle(vocab)}
                  >
                    <span className={styles.vocabWord}>{vocab.word}</span>
                    <span className={styles.vocabMeaning}>{vocab.meaning}</span>
                    {selectedVocab.find((v) => v.id === vocab.id) && (
                      <span className={styles.vocabCheck}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
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
            disabled={isSubmitting}
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
