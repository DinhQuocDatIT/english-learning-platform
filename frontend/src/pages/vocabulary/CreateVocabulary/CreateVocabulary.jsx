import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import styles from "./CreateVocabulary.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faVolumeHigh,
  faArrowLeft,
  faExclamationCircle,
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

import { speakText, getAvailableVoices } from "../../../utils/textToSpeech";

import vocabulary from "../../../services/vocabulary";

import { toast } from "react-toastify";
import { useLoading } from "../../../contexts/LoadingContext";

function CreateVocabulary() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  // =========================================================
  // FORM DATA
  // =========================================================
  const [word, setWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");

  const [meanings, setMeanings] = useState([
    {
      id: Date.now(),
      partOfSpeech: "",
      meaning: "",
      example: "",
    },
  ]);

  // =========================================================
  // VALIDATION ERRORS
  // =========================================================
  const [errors, setErrors] = useState(emptyVocabularyErrors);

  // =========================================================
  // TOUCHED
  // Chỉ hiện lỗi sau khi user blur hoặc submit
  // =========================================================
  const [touched, setTouched] = useState({
    word: false,
    pronunciation: false,
    meanings: [
      {
        partOfSpeech: false,
        meaning: false,
        example: false,
      },
    ],
  });

  // =========================================================
  // TEXT TO SPEECH
  // =========================================================
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const [speechRate, setSpeechRate] = useState(0.9);

  // =========================================================
  // LOAD VOICES
  // =========================================================
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = getAvailableVoices();

      const englishVoices = availableVoices.filter((voice) =>
        voice.lang.startsWith("en"),
      );

      setVoices(englishVoices);

      if (englishVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(englishVoices[0]);
      }
    };

    loadVoices();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

  // =========================================================
  // SPEAK
  // =========================================================
  const handleSpeak = (text) => {
    if (!text?.trim()) return;

    speakText(text, {
      voice: selectedVoice,
      rate: Number(speechRate),
    });
  };

  // =========================================================
  // BUILD FORM DATA
  // Dùng chung format với VocabularyRequest
  // =========================================================
  const buildFormData = (
    currentWord = word,
    currentPronunciation = pronunciation,
    currentMeanings = meanings,
  ) => {
    return {
      word: currentWord,
      pronunciation: currentPronunciation,
      meanings: currentMeanings.map((item) => ({
        partOfSpeech: item.partOfSpeech,
        meaning: item.meaning,
        example: item.example,
      })),
    };
  };

  // =========================================================
  // HANDLE WORD
  // =========================================================
  const handleWordChange = (value) => {
    setWord(value);

    if (touched.word) {
      setErrors((prev) => ({
        ...prev,
        word: validateWord(value),
      }));
    }
  };

  const handleWordBlur = () => {
    setTouched((prev) => ({
      ...prev,
      word: true,
    }));

    setErrors((prev) => ({
      ...prev,
      word: validateWord(word),
    }));
  };

  // =========================================================
  // HANDLE PRONUNCIATION
  // =========================================================
  const handlePronunciationChange = (value) => {
    setPronunciation(value);

    if (touched.pronunciation) {
      setErrors((prev) => ({
        ...prev,
        pronunciation: validatePronunciation(value),
      }));
    }
  };

  const handlePronunciationBlur = () => {
    setTouched((prev) => ({
      ...prev,
      pronunciation: true,
    }));

    setErrors((prev) => ({
      ...prev,
      pronunciation: validatePronunciation(pronunciation),
    }));
  };

  // =========================================================
  // ADD MEANING
  // =========================================================
  const handleAddMeaning = () => {
    const newMeaning = {
      id: Date.now(),
      partOfSpeech: "",
      meaning: "",
      example: "",
    };

    setMeanings((prev) => [...prev, newMeaning]);

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

    setTouched((prev) => ({
      ...prev,
      meanings: [
        ...(prev.meanings || []),
        {
          partOfSpeech: false,
          meaning: false,
          example: false,
        },
      ],
    }));
  };

  // =========================================================
  // REMOVE MEANING
  // =========================================================
  const handleRemoveMeaning = (id) => {
    if (meanings.length <= 1) {
      toast.error("Từ vựng phải có ít nhất một nghĩa.");
      return;
    }

    const index = meanings.findIndex((item) => item.id === id);

    setMeanings((prev) => prev.filter((item) => item.id !== id));

    setErrors((prev) => ({
      ...prev,
      meanings: (prev.meanings || []).filter((_, i) => i !== index),
    }));

    setTouched((prev) => ({
      ...prev,
      meanings: (prev.meanings || []).filter((_, i) => i !== index),
    }));
  };

  // =========================================================
  // HANDLE MEANING CHANGE
  // =========================================================
  const handleMeaningChange = (id, field, value) => {
    const index = meanings.findIndex((item) => item.id === id);

    if (index === -1) return;

    // -----------------------------------------
    // Update meanings
    // -----------------------------------------
    setMeanings((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );

    // -----------------------------------------
    // Validate field nếu đã touched
    // -----------------------------------------
    const fieldWasTouched = touched.meanings?.[index]?.[field];

    if (fieldWasTouched) {
      let fieldError = "";

      if (field === "partOfSpeech") {
        fieldError = validatePartOfSpeech(value);
      }

      if (field === "meaning") {
        fieldError = validateMeaning(value);
      }

      if (field === "example") {
        fieldError = validateExample(value);
      }

      setErrors((prev) => {
        const updatedMeanings = [...(prev.meanings || [])];

        while (updatedMeanings.length <= index) {
          updatedMeanings.push({
            partOfSpeech: "",
            meaning: "",
            example: "",
          });
        }

        updatedMeanings[index] = {
          ...updatedMeanings[index],
          [field]: fieldError,
        };

        return {
          ...prev,
          meanings: updatedMeanings,
        };
      });
    }
  };

  // =========================================================
  // MARK MEANING FIELD TOUCHED + VALIDATE
  // =========================================================
  const handleMeaningBlur = (index, field) => {
    const item = meanings[index];

    if (!item) return;

    // -----------------------------------------
    // Mark touched
    // -----------------------------------------
    setTouched((prev) => {
      const updatedMeanings = [...(prev.meanings || [])];

      while (updatedMeanings.length <= index) {
        updatedMeanings.push({
          partOfSpeech: false,
          meaning: false,
          example: false,
        });
      }

      updatedMeanings[index] = {
        ...updatedMeanings[index],
        [field]: true,
      };

      return {
        ...prev,
        meanings: updatedMeanings,
      };
    });

    // -----------------------------------------
    // Validate
    // -----------------------------------------
    let fieldError = "";

    if (field === "partOfSpeech") {
      fieldError = validatePartOfSpeech(item.partOfSpeech);
    }

    if (field === "meaning") {
      fieldError = validateMeaning(item.meaning);
    }

    if (field === "example") {
      fieldError = validateExample(item.example);
    }

    setErrors((prev) => {
      const updatedMeanings = [...(prev.meanings || [])];

      while (updatedMeanings.length <= index) {
        updatedMeanings.push({
          partOfSpeech: "",
          meaning: "",
          example: "",
        });
      }

      updatedMeanings[index] = {
        ...updatedMeanings[index],
        [field]: fieldError,
      };

      return {
        ...prev,
        meanings: updatedMeanings,
      };
    });
  };

  // =========================================================
  // VALIDATE ENTIRE FORM
  // =========================================================
  const validateForm = () => {
    const formData = buildFormData();

    const validationErrors = validateVocabularyForm(formData);

    setErrors(validationErrors);

    return !hasVocabularyErrors(validationErrors);
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // -----------------------------------------
    // Mark tất cả field touched
    // -----------------------------------------
    setTouched({
      word: true,
      pronunciation: true,
      meanings: meanings.map(() => ({
        partOfSpeech: true,
        meaning: true,
        example: true,
      })),
    });

    // -----------------------------------------
    // Validate
    // -----------------------------------------
    const formData = buildFormData();

    const validationErrors = validateVocabularyForm(formData);

    setErrors(validationErrors);

    if (hasVocabularyErrors(validationErrors)) {
      toast.error("Vui lòng kiểm tra lại thông tin.");

      // Scroll tới lỗi đầu tiên
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

    // -----------------------------------------
    // Request DTO
    // -----------------------------------------
    const requestData = {
      word: word.trim(),

      pronunciation: pronunciation.trim(),

      meanings: meanings.map((item) => ({
        partOfSpeech: item.partOfSpeech.trim(),

        meaning: item.meaning.trim(),

        example: item.example.trim(),
      })),
    };

    // -----------------------------------------
    // POST API
    // -----------------------------------------
    try {
      showLoading();

      const response = await vocabulary.addVocabulary(requestData);

      console.log("Vocabulary created:", response.data);

      toast.success("Tạo từ vựng thành công!");

      navigate("/dashboard/admin/vocabulary");
    } catch (error) {
      console.error("Error creating vocabulary:", error);

      if (error.response) {
        toast.error(
          error.response.data?.message ||
            error.response.data?.error ||
            "Có lỗi xảy ra khi tạo từ vựng.",
        );
      } else if (error.request) {
        toast.error("Không thể kết nối đến máy chủ.");
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
      }
    } finally {
      hideLoading();
    }
  };

  // =========================================================
  // CHECK FORM HAS ERRORS
  // =========================================================
  const hasErrors = () => {
    return hasVocabularyErrors(errors);
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className={styles.header}>
          <div>
            <Link to="/dashboard/admin/vocabulary" className={styles.backLink}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Quay lại
            </Link>

            <h1 className={styles.title}>Tạo từ vựng</h1>

            <p className={styles.subtitle}>
              Thêm từ mới vào thư viện chương trình học.
            </p>
          </div>
        </div>

        {/* =====================================================
            PRONUNCIATION SETTINGS
        ====================================================== */}
        <div
          className={styles.card}
          style={{
            marginBottom: "16px",
            padding: "16px 20px",
          }}
        >
          <h2
            className={styles.cardTitle}
            style={{
              marginBottom: "12px",
            }}
          >
            Cài đặt phát âm
          </h2>

          <div
            className={styles.formRow}
            style={{
              marginBottom: 0,
            }}
          >
            <div className={styles.formGroup}>
              <label className={styles.label}>Chọn giọng đọc (Accent)</label>

              <select
                className={styles.selectInput}
                value={selectedVoice ? selectedVoice.name : ""}
                onChange={(e) => {
                  const found = voices.find(
                    (voice) => voice.name === e.target.value,
                  );

                  setSelectedVoice(found);
                }}
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div
              className={styles.formGroup}
              style={{
                flex: "0 0 220px",
              }}
            >
              <label className={styles.label}>Tốc độ đọc</label>

              <select
                className={styles.selectInput}
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
              >
                <option value="0.7">Chậm (0.7x)</option>

                <option value="0.9">Bình thường (0.9x)</option>

                <option value="1.0">Nhanh (1.0x)</option>
              </select>
            </div>
          </div>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}
        <form onSubmit={handleSubmit} noValidate>
          {/* ===================================================
              BASIC INFORMATION
          ==================================================== */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Thông tin cơ bản</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Từ vựng <span className={styles.required}>*</span>
                </label>

                <div className={styles.inputWithAction}>
                  <input
                    type="text"
                    placeholder="VD: Ubiquitous"
                    value={word}
                    onChange={(e) => handleWordChange(e.target.value)}
                    onBlur={handleWordBlur}
                    maxLength={100}
                    className={`${styles.input} ${
                      touched.word && errors.word ? styles.inputError : ""
                    }`}
                    aria-invalid={touched.word && !!errors.word}
                  />

                  <button
                    type="button"
                    className={styles.speakBtn}
                    onClick={() => handleSpeak(word)}
                    title="Nghe phát âm"
                    disabled={!word}
                  >
                    <FontAwesomeIcon icon={faVolumeHigh} />
                  </button>
                </div>

                {touched.word && errors.word && (
                  <div className={styles.errorMessage}>
                    <FontAwesomeIcon icon={faExclamationCircle} />

                    <span>{errors.word}</span>
                  </div>
                )}

                <div className={styles.charCounter}>{word.length}/100</div>
              </div>

              {/* PRONUNCIATION */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Phát âm (IPA)</label>

                <input
                  type="text"
                  placeholder="VD: /juːˈbɪk.wɪ.təs/"
                  value={pronunciation}
                  onChange={(e) => handlePronunciationChange(e.target.value)}
                  onBlur={handlePronunciationBlur}
                  maxLength={100}
                  className={`${styles.input} ${
                    touched.pronunciation && errors.pronunciation
                      ? styles.inputError
                      : ""
                  }`}
                  aria-invalid={touched.pronunciation && !!errors.pronunciation}
                />

                {touched.pronunciation && errors.pronunciation && (
                  <div className={styles.errorMessage}>
                    <FontAwesomeIcon icon={faExclamationCircle} />

                    <span>{errors.pronunciation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===================================================
              MEANINGS
          ==================================================== */}
          <div className={styles.card}>
            <div className={styles.cardHeaderFlex}>
              <h2 className={styles.cardTitle}>Ý nghĩa & Ví dụ</h2>

              <button
                type="button"
                className={styles.addMeaningBtn}
                onClick={handleAddMeaning}
              >
                <FontAwesomeIcon icon={faPlus} />
                Thêm ý nghĩa
              </button>
            </div>

            {meanings.map((item, index) => {
              const meaningErrors = errors.meanings?.[index] || {
                partOfSpeech: "",
                meaning: "",
                example: "",
              };

              const meaningTouched = touched.meanings?.[index] || {
                partOfSpeech: false,
                meaning: false,
                example: false,
              };

              return (
                <div key={item.id} className={styles.meaningItemBox}>
                  {/* MEANING HEADER */}
                  <div className={styles.meaningHeader}>
                    <span className={styles.meaningNumber}>
                      Ý nghĩa {index + 1}
                    </span>

                    {meanings.length > 1 && (
                      <button
                        type="button"
                        className={styles.deleteBtnSmall}
                        onClick={() => handleRemoveMeaning(item.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Xóa
                      </button>
                    )}
                  </div>

                  {/* PART OF SPEECH + MEANING */}
                  <div className={styles.formRow}>
                    {/* PART OF SPEECH */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Từ loại <span className={styles.required}>*</span>
                      </label>

                      <select
                        value={item.partOfSpeech}
                        onChange={(e) =>
                          handleMeaningChange(
                            item.id,
                            "partOfSpeech",
                            e.target.value,
                          )
                        }
                        onBlur={() => handleMeaningBlur(index, "partOfSpeech")}
                        className={`${styles.selectInput} ${
                          meaningTouched.partOfSpeech &&
                          meaningErrors.partOfSpeech
                            ? styles.inputError
                            : ""
                        }`}
                        aria-invalid={
                          meaningTouched.partOfSpeech &&
                          !!meaningErrors.partOfSpeech
                        }
                      >
                        <option value="">Chọn từ loại...</option>

                        <option value="noun">Danh từ (Noun)</option>

                        <option value="verb">Động từ (Verb)</option>

                        <option value="adjective">Tính từ (Adjective)</option>

                        <option value="adverb">Trạng từ (Adverb)</option>

                        <option value="preposition">
                          Giới từ (Preposition)
                        </option>

                        <option value="conjunction">
                          Liên từ (Conjunction)
                        </option>

                        <option value="pronoun">Đại từ (Pronoun)</option>

                        <option value="interjection">
                          Thán từ (Interjection)
                        </option>

                        <option value="article">Mạo từ (Article)</option>

                        <option value="determiner">
                          Từ hạn định (Determiner)
                        </option>
                      </select>

                      {meaningTouched.partOfSpeech &&
                        meaningErrors.partOfSpeech && (
                          <div className={styles.errorMessage}>
                            <FontAwesomeIcon icon={faExclamationCircle} />

                            <span>{meaningErrors.partOfSpeech}</span>
                          </div>
                        )}
                    </div>

                    {/* MEANING */}
                    <div className={styles.formGroupFlex}>
                      <label className={styles.label}>
                        Ý nghĩa <span className={styles.required}>*</span>
                      </label>

                      <div className={styles.inputWithAction}>
                        <input
                          type="text"
                          placeholder="Định nghĩa..."
                          value={item.meaning}
                          onChange={(e) =>
                            handleMeaningChange(
                              item.id,
                              "meaning",
                              e.target.value,
                            )
                          }
                          onBlur={() => handleMeaningBlur(index, "meaning")}
                          maxLength={1000}
                          className={`${styles.input} ${
                            meaningTouched.meaning && meaningErrors.meaning
                              ? styles.inputError
                              : ""
                          }`}
                          aria-invalid={
                            meaningTouched.meaning && !!meaningErrors.meaning
                          }
                        />
                      </div>

                      {meaningTouched.meaning && meaningErrors.meaning && (
                        <div className={styles.errorMessage}>
                          <FontAwesomeIcon icon={faExclamationCircle} />

                          <span>{meaningErrors.meaning}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* EXAMPLE */}
                  <div className={styles.formGroupFull}>
                    <label className={styles.label}>
                      Câu ví dụ <span className={styles.required}>*</span>
                    </label>

                    <div className={styles.inputWithAction}>
                      <textarea
                        placeholder="Cung cấp bối cảnh ví dụ rõ ràng..."
                        value={item.example}
                        onChange={(e) =>
                          handleMeaningChange(
                            item.id,
                            "example",
                            e.target.value,
                          )
                        }
                        onBlur={() => handleMeaningBlur(index, "example")}
                        rows={2}
                        maxLength={1000}
                        className={`${styles.textarea} ${
                          meaningTouched.example && meaningErrors.example
                            ? styles.inputError
                            : ""
                        }`}
                        aria-invalid={
                          meaningTouched.example && !!meaningErrors.example
                        }
                      />

                      <button
                        type="button"
                        className={styles.speakBtn}
                        onClick={() => handleSpeak(item.example)}
                        title="Nghe câu ví dụ"
                        disabled={!item.example}
                      >
                        <FontAwesomeIcon icon={faVolumeHigh} />
                      </button>
                    </div>

                    {meaningTouched.example && meaningErrors.example && (
                      <div className={styles.errorMessage}>
                        <FontAwesomeIcon icon={faExclamationCircle} />

                        <span>{meaningErrors.example}</span>
                      </div>
                    )}

                    <div className={styles.helperText}>
                      Ví dụ minh họa cách sử dụng từ trong ngữ cảnh.
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Không nên xảy ra vì luôn khởi tạo 1 meaning */}
            {meanings.length === 0 && (
              <div className={styles.emptyMeanings}>
                <p>Chưa có ý nghĩa nào. Vui lòng thêm ít nhất một ý nghĩa.</p>
              </div>
            )}
          </div>

          {/* ===================================================
              FORM ACTIONS
          ==================================================== */}
          <div className={styles.formActions}>
            <Link
              to="/dashboard/admin/vocabulary"
              className={styles.cancelBtn}
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Hủy
            </Link>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={hasErrors()}
            >
              Lưu từ vựng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateVocabulary;
