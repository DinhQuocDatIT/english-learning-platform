import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./UpdateVocabulary.module.css";
import { speakText, getAvailableVoices } from "../../../utils/textToSpeech";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimes,
  faPlus,
  faTrashAlt,
  faArrowLeft,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";

import {
  validateWord,
  validatePronunciation,
  validatePartOfSpeech,
  validateMeaning,
  validateExample,
  validateVocabularyForm,
  hasVocabularyErrors,
  emptyVocabularyErrors,
} from "../../../utils/vocabularyValidation";

import vocabulary from "../../../services/vocabulary";
import { useLoading } from "../../../contexts/LoadingContext";

function UpdateVocabulary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    word: "",
    pronunciation: "",
    meanings: [
      {
        partOfSpeech: "noun",
        meaning: "",
        example: "",
      },
    ],
  });

  const [errors, setErrors] = useState(emptyVocabularyErrors);
  const { showLoading, hideLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        showLoading();
        setError("");

        const response = await vocabulary.getVocabularyById(id);
        const data = response.data.data;

        setFormData({
          word: data.word || "",

          pronunciation: data.pronunciation || "",

          meanings:
            Array.isArray(data.meanings) && data.meanings.length > 0
              ? data.meanings.map((item) => ({
                  partOfSpeech: item.partOfSpeech || "",

                  meaning: item.meaning || "",

                  example: item.example || "",
                }))
              : [
                  {
                    partOfSpeech: "noun",
                    meaning: "",
                    example: "",
                  },
                ],
        });

        // Reset validation
        setErrors(emptyVocabularyErrors);
      } catch (err) {
        console.error("Lỗi lấy vocabulary:", err);

        setError(
          err.response?.data?.message || "Không thể tải thông tin từ vựng.",
        );
      } finally {
        hideLoading();
      }
    };

    if (id) {
      fetchVocabulary();
    }
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");

    // Validate ngay khi nhập
    if (name === "word") {
      setErrors((prev) => ({
        ...prev,
        word: validateWord(value),
      }));
    }

    if (name === "pronunciation") {
      setErrors((prev) => ({
        ...prev,
        pronunciation: validatePronunciation(value),
      }));
    }
  };
  const handleMeaningChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedMeanings = [...prev.meanings];

      updatedMeanings[index] = {
        ...updatedMeanings[index],
        [field]: value,
      };

      return {
        ...prev,
        meanings: updatedMeanings,
      };
    });
    setErrors((prev) => {
      const updatedMeaningErrors = [...(prev.meanings || [])];

      while (updatedMeaningErrors.length <= index) {
        updatedMeaningErrors.push({
          partOfSpeech: "",
          meaning: "",
          example: "",
        });
      }

      const currentErrors = {
        ...updatedMeaningErrors[index],
      };

      if (field === "partOfSpeech") {
        currentErrors.partOfSpeech = validatePartOfSpeech(value);
      }

      if (field === "meaning") {
        currentErrors.meaning = validateMeaning(value);
      }

      if (field === "example") {
        currentErrors.example = validateExample(value);
      }

      updatedMeaningErrors[index] = currentErrors;

      return {
        ...prev,
        meanings: updatedMeaningErrors,
      };
    });

    setError("");
  };
  const handleAddMeaning = () => {
    setFormData((prev) => ({
      ...prev,
      meanings: [
        ...prev.meanings,
        {
          partOfSpeech: "noun",
          meaning: "",
          example: "",
        },
      ],
    }));

    setErrors((prev) => ({
      ...prev,
      meanings: [
        ...(prev.meanings || []),
        {
          partOfSpeech: "",
          meaning: "",
          example: "",
        },
      ],
    }));

    setError("");
  };
  const handleRemoveMeaning = (index) => {
    if (formData.meanings.length <= 1) {
      setError("Từ vựng phải có ít nhất một nghĩa.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      meanings: prev.meanings.filter((_, i) => i !== index),
    }));

    setErrors((prev) => ({
      ...prev,
      meanings: (prev.meanings || []).filter((_, i) => i !== index),
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      setError("Không tìm thấy ID từ vựng.");
      return;
    }

    const validationErrors = validateVocabularyForm(formData);

    setErrors(validationErrors);

    if (hasVocabularyErrors(validationErrors)) {
      setError("");
      setTimeout(() => {
        const firstError = document.querySelector(`.${styles.inputError}`);

        if (firstError) {
          firstError.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          firstError.focus();
        }
      }, 50);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const requestData = {
        word: formData.word.trim(),

        pronunciation: formData.pronunciation.trim(),

        meanings: formData.meanings.map((item) => ({
          partOfSpeech: item.partOfSpeech.trim(),

          meaning: item.meaning.trim(),

          example: item.example.trim(),
        })),
      };

      console.log("PUT vocabulary:", requestData);

      await vocabulary.updateVocabulary(id, requestData);

      alert("Cập nhật từ vựng thành công!");

      navigate(-1);
    } catch (err) {
      console.error("Lỗi cập nhật vocabulary:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Cập nhật từ vựng thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.word) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <button
              type="button"
              className={styles.backLink}
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Quay lại danh sách
            </button>

            <h1 className={styles.title}>Chỉnh sửa từ vựng</h1>

            <p className={styles.subtitle}>
              Cập nhật chi tiết từ vựng và các tầng nghĩa của từ.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.discardButton}
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} />
              Hủy thay đổi
            </button>

            <button
              type="submit"
              form="updateVocabularyForm"
              className={styles.updateButton}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSave} />

              {loading ? " Đang cập nhật..." : " Cập nhật"}
            </button>
          </div>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form
          id="updateVocabularyForm"
          onSubmit={handleSubmit}
          className={styles.formGrid}
          noValidate
        >
          <div className={styles.leftColumn}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Thông tin cơ bản</h2>

              <div className={styles.formGroup}>
                <label htmlFor="word" className={styles.label}>
                  Từ vựng (Word)
                  <span className={styles.required}>*</span>
                </label>

                <input
                  id="word"
                  type="text"
                  name="word"
                  value={formData.word}
                  onChange={handleChange}
                  placeholder="Nhập từ vựng..."
                  maxLength={100}
                  className={`${styles.input} ${
                    errors.word ? styles.inputError : ""
                  }`}
                  disabled={loading}
                  aria-invalid={!!errors.word}
                />

                {errors.word && (
                  <div className={styles.fieldError}>{errors.word}</div>
                )}

                <div className={styles.charCounter}>
                  {formData.word.length}/100
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pronunciation" className={styles.label}>
                  Phát âm (Pronunciation)
                </label>

                <input
                  id="pronunciation"
                  type="text"
                  name="pronunciation"
                  value={formData.pronunciation}
                  onChange={handleChange}
                  placeholder="Ví dụ: /rʌn/"
                  maxLength={100}
                  className={`${styles.input} ${
                    errors.pronunciation ? styles.inputError : ""
                  }`}
                  disabled={loading}
                  aria-invalid={!!errors.pronunciation}
                />

                {errors.pronunciation && (
                  <div className={styles.fieldError}>
                    {errors.pronunciation}
                  </div>
                )}

                <div className={styles.charCounter}>
                  {formData.pronunciation.length}
                  /100
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.card}>
              <div className={styles.cardHeaderFlex}>
                <h2 className={styles.cardTitle}>Ý nghĩa & Cách dùng</h2>

                <button
                  type="button"
                  className={styles.addMeaningButton}
                  onClick={handleAddMeaning}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Thêm nghĩa
                </button>
              </div>

              {formData.meanings.map((meaningItem, index) => {
                const meaningErrors = errors.meanings?.[index] || {
                  partOfSpeech: "",
                  meaning: "",
                  example: "",
                };

                return (
                  <div key={index} className={styles.meaningItemBox}>
                    {/* Meaning header */}
                    <div className={styles.meaningItemHeader}>
                      <span className={styles.meaningIndex}>
                        Nghĩa #{index + 1}
                      </span>

                      {formData.meanings.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeMeaningButton}
                          onClick={() => handleRemoveMeaning(index)}
                          title="Xóa nghĩa này"
                          disabled={loading}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      )}
                    </div>

                    {/* PART OF SPEECH + MEANING */}
                    <div className={styles.formRow}>
                      {/* Part of Speech */}
                      <div className={styles.formGroup}>
                        <label
                          htmlFor={`partOfSpeech-${index}`}
                          className={styles.label}
                        >
                          Từ loại (Part of Speech)
                          <span className={styles.required}>*</span>
                        </label>

                        <select
                          id={`partOfSpeech-${index}`}
                          value={meaningItem.partOfSpeech}
                          onChange={(e) =>
                            handleMeaningChange(
                              index,
                              "partOfSpeech",
                              e.target.value,
                            )
                          }
                          className={`${styles.select} ${
                            meaningErrors.partOfSpeech ? styles.inputError : ""
                          }`}
                          disabled={loading}
                          aria-invalid={!!meaningErrors.partOfSpeech}
                        >
                          <option value="">-- Chọn từ loại --</option>

                          <option value="noun">Danh từ (Noun)</option>

                          <option value="verb">Động từ (Verb)</option>

                          <option value="adjective">Tính từ (Adjective)</option>

                          <option value="adverb">Trạng từ (Adverb)</option>

                          <option value="pronoun">Đại từ (Pronoun)</option>

                          <option value="preposition">
                            Giới từ (Preposition)
                          </option>

                          <option value="conjunction">
                            Liên từ (Conjunction)
                          </option>

                          <option value="interjection">
                            Thán từ (Interjection)
                          </option>
                        </select>

                        {meaningErrors.partOfSpeech && (
                          <div className={styles.fieldError}>
                            {meaningErrors.partOfSpeech}
                          </div>
                        )}
                      </div>

                      {/* Meaning */}
                      <div className={styles.formGroupFlex}>
                        <label
                          htmlFor={`meaning-${index}`}
                          className={styles.label}
                        >
                          Nghĩa tiếng Việt (Meaning)
                          <span className={styles.required}>*</span>
                        </label>

                        <input
                          id={`meaning-${index}`}
                          type="text"
                          value={meaningItem.meaning}
                          onChange={(e) =>
                            handleMeaningChange(
                              index,
                              "meaning",
                              e.target.value,
                            )
                          }
                          placeholder="Nhập nghĩa tiếng Việt..."
                          maxLength={1000}
                          className={`${styles.input} ${
                            meaningErrors.meaning ? styles.inputError : ""
                          }`}
                          disabled={loading}
                          aria-invalid={!!meaningErrors.meaning}
                        />

                        {meaningErrors.meaning && (
                          <div className={styles.fieldError}>
                            {meaningErrors.meaning}
                          </div>
                        )}

                        <div className={styles.charCounter}>
                          {meaningItem.meaning.length}
                          /1000
                        </div>
                      </div>
                    </div>

                    {/* ================= EXAMPLE ================= */}
                    <div className={styles.formGroup}>
                      <label
                        htmlFor={`example-${index}`}
                        className={styles.label}
                      >
                        Câu ví dụ (Example Sentence)
                        <span className={styles.required}>*</span>
                      </label>

                      <textarea
                        id={`example-${index}`}
                        value={meaningItem.example}
                        onChange={(e) =>
                          handleMeaningChange(index, "example", e.target.value)
                        }
                        placeholder="Nhập câu ví dụ sử dụng từ này..."
                        rows={3}
                        maxLength={1000}
                        className={`${styles.textarea} ${
                          meaningErrors.example ? styles.inputError : ""
                        }`}
                        disabled={loading}
                        aria-invalid={!!meaningErrors.example}
                      />

                      {meaningErrors.example && (
                        <div className={styles.fieldError}>
                          {meaningErrors.example}
                        </div>
                      )}

                      <div className={styles.charCounter}>
                        {meaningItem.example?.length || 0}
                        /1000
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateVocabulary;
