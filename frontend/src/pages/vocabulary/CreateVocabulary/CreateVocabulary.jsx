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
import { speakText, getAvailableVoices } from "../../../utils/textToSpeech";
import vocabulary from "../../../services/vocabulary";
import { toast } from "react-toastify";
import { useLoading } from "../../../contexts/LoadingContext";

function CreateVocabulary() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  // State cho form
  const [word, setWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [meanings, setMeanings] = useState([
    { id: 1, partOfSpeech: "", meaning: "", example: "" },
  ]);

  // State cho validation
  const [errors, setErrors] = useState({
    word: "",
    pronunciation: "",
    meanings: [],
  });

  const [touched, setTouched] = useState({
    word: false,
    pronunciation: false,
    meanings: [],
  });

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.9);

  // Danh sách Part of Speech hợp lệ
  const VALID_PARTS_OF_SPEECH = [
    "Noun",
    "Verb",
    "Adjective",
    "Adverb",
    "Preposition",
    "Conjunction",
    "Pronoun",
    "Interjection",
    "Article",
    "Determiner",
  ];

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = getAvailableVoices();
      const englishVoices = availableVoices.filter((v) =>
        v.lang.startsWith("en"),
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
  }, [selectedVoice]);

  const handleSpeak = (text) => {
    if (!text) return;
    speakText(text, {
      voice: selectedVoice,
      rate: Number(speechRate),
    });
  };

  const handleAddMeaning = () => {
    const newId = Date.now();
    setMeanings([
      ...meanings,
      { id: newId, partOfSpeech: "", meaning: "", example: "" },
    ]);
    // Reset errors và touched cho meanings mới
    setErrors({
      ...errors,
      meanings: [
        ...errors.meanings,
        { meaning: "", partOfSpeech: "", example: "" },
      ],
    });
    setTouched({
      ...touched,
      meanings: [
        ...touched.meanings,
        { meaning: false, partOfSpeech: false, example: false },
      ],
    });
  };

  const handleRemoveMeaning = (id) => {
    if (meanings.length > 1) {
      const index = meanings.findIndex((item) => item.id === id);
      setMeanings(meanings.filter((item) => item.id !== id));
      // Remove error và touched cho meaning này
      setErrors({
        ...errors,
        meanings: errors.meanings.filter((_, i) => i !== index),
      });
      setTouched({
        ...touched,
        meanings: touched.meanings.filter((_, i) => i !== index),
      });
    }
  };

  const handleMeaningChange = (id, field, value) => {
    setMeanings(
      meanings.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
    // Mark as touched
    const index = meanings.findIndex((item) => item.id === id);
    const newTouched = { ...touched };
    newTouched.meanings[index] = {
      ...newTouched.meanings[index],
      [field]: true,
    };
    setTouched(newTouched);

    // Validate field
    validateMeaningField(index, field, value);
  };

  // Validate từng field của meaning
  const validateMeaningField = (index, field, value) => {
    const newErrors = { ...errors };
    if (!newErrors.meanings[index]) {
      newErrors.meanings[index] = {
        meaning: "",
        partOfSpeech: "",
        example: "",
      };
    }

    switch (field) {
      case "partOfSpeech":
        if (!value) {
          newErrors.meanings[index].partOfSpeech = "Vui lòng chọn từ loại";
        } else if (!VALID_PARTS_OF_SPEECH.includes(value)) {
          newErrors.meanings[index].partOfSpeech = "Từ loại không hợp lệ";
        } else {
          newErrors.meanings[index].partOfSpeech = "";
        }
        break;
      case "meaning":
        if (!value.trim()) {
          newErrors.meanings[index].meaning = "Ý nghĩa không được để trống";
        } else if (value.trim().length > 1000) {
          newErrors.meanings[index].meaning =
            "Ý nghĩa không được vượt quá 1000 ký tự";
        } else {
          newErrors.meanings[index].meaning = "";
        }
        break;
      case "example":
        if (!value.trim()) {
          newErrors.meanings[index].example = "Câu ví dụ không được để trống";
        } else if (value.trim().length > 1000) {
          newErrors.meanings[index].example =
            "Câu ví dụ không được vượt quá 1000 ký tự";
        } else {
          newErrors.meanings[index].example = "";
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  // Validate tất cả meanings
  const validateAllMeanings = () => {
    const newErrors = { ...errors };
    let isValid = true;

    meanings.forEach((item, index) => {
      if (!newErrors.meanings[index]) {
        newErrors.meanings[index] = {
          meaning: "",
          partOfSpeech: "",
          example: "",
        };
      }

      // Validate partOfSpeech
      if (!item.partOfSpeech) {
        newErrors.meanings[index].partOfSpeech = "Vui lòng chọn từ loại";
        isValid = false;
      } else if (!VALID_PARTS_OF_SPEECH.includes(item.partOfSpeech)) {
        newErrors.meanings[index].partOfSpeech = "Từ loại không hợp lệ";
        isValid = false;
      } else {
        newErrors.meanings[index].partOfSpeech = "";
      }

      // Validate meaning
      if (!item.meaning.trim()) {
        newErrors.meanings[index].meaning = "Ý nghĩa không được để trống";
        isValid = false;
      } else if (item.meaning.trim().length > 1000) {
        newErrors.meanings[index].meaning =
          "Ý nghĩa không được vượt quá 1000 ký tự";
        isValid = false;
      } else {
        newErrors.meanings[index].meaning = "";
      }

      // Validate example
      if (!item.example.trim()) {
        newErrors.meanings[index].example = "Câu ví dụ không được để trống";
        isValid = false;
      } else if (item.example.trim().length > 1000) {
        newErrors.meanings[index].example =
          "Câu ví dụ không được vượt quá 1000 ký tự";
        isValid = false;
      } else {
        newErrors.meanings[index].example = "";
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {
      word: "",
      pronunciation: "",
      meanings: [],
    };

    let isValid = true;

    // Validate word (BẮT BUỘC)
    if (!word.trim()) {
      newErrors.word = "Từ vựng không được để trống";
      isValid = false;
    } else if (word.trim().length > 100) {
      newErrors.word = "Từ vựng không được vượt quá 100 ký tự";
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(word.trim())) {
      newErrors.word =
        "Từ vựng chỉ được chứa chữ cái, khoảng trắng, dấu gạch nối và dấu nháy";
      isValid = false;
    }

    // Validate pronunciation (BẮT BUỘC)
    if (!pronunciation.trim()) {
      newErrors.pronunciation = "Phát âm không được để trống";
      isValid = false;
    } else if (pronunciation.trim().length > 100) {
      newErrors.pronunciation = "Phát âm không được vượt quá 100 ký tự";
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s\/\-']+$/.test(pronunciation.trim())) {
      newErrors.pronunciation =
        "Phát âm chỉ được chứa chữ cái, số, khoảng trắng, /, - và '";
      isValid = false;
    }

    // Validate meanings (BẮT BUỘC)
    if (meanings.length === 0) {
      newErrors.meanings = [
        {
          meaning: "Phải có ít nhất một ý nghĩa",
          partOfSpeech: "",
          example: "",
        },
      ];
      isValid = false;
    } else {
      meanings.forEach((item, index) => {
        const meaningErrors = { meaning: "", partOfSpeech: "", example: "" };

        // Validate partOfSpeech (BẮT BUỘC)
        if (!item.partOfSpeech) {
          meaningErrors.partOfSpeech = "Vui lòng chọn từ loại";
          isValid = false;
        } else if (!VALID_PARTS_OF_SPEECH.includes(item.partOfSpeech)) {
          meaningErrors.partOfSpeech = "Từ loại không hợp lệ";
          isValid = false;
        }

        // Validate meaning (BẮT BUỘC)
        if (!item.meaning.trim()) {
          meaningErrors.meaning = "Ý nghĩa không được để trống";
          isValid = false;
        } else if (item.meaning.trim().length > 1000) {
          meaningErrors.meaning = "Ý nghĩa không được vượt quá 1000 ký tự";
          isValid = false;
        }

        // Validate example (BẮT BUỘC)
        if (!item.example.trim()) {
          meaningErrors.example = "Câu ví dụ không được để trống";
          isValid = false;
        } else if (item.example.trim().length > 1000) {
          meaningErrors.example = "Câu ví dụ không được vượt quá 1000 ký tự";
          isValid = false;
        }

        newErrors.meanings[index] = meaningErrors;
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  // Real-time validation cho word
  const validateWord = (value) => {
    if (!value.trim()) {
      setErrors({ ...errors, word: "Từ vựng không được để trống" });
    } else if (value.trim().length > 100) {
      setErrors({ ...errors, word: "Từ vựng không được vượt quá 100 ký tự" });
    } else if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) {
      setErrors({
        ...errors,
        word: "Từ vựng chỉ được chứa chữ cái, khoảng trắng, dấu gạch nối và dấu nháy",
      });
    } else {
      setErrors({ ...errors, word: "" });
    }
  };

  // Real-time validation cho pronunciation
  const validatePronunciation = (value) => {
    if (!value.trim()) {
      setErrors({ ...errors, pronunciation: "Phát âm không được để trống" });
    } else if (value.trim().length > 100) {
      setErrors({
        ...errors,
        pronunciation: "Phát âm không được vượt quá 100 ký tự",
      });
    } else if (!/^[a-zA-Z0-9\s\/\-']+$/.test(value.trim())) {
      setErrors({
        ...errors,
        pronunciation:
          "Phát âm chỉ được chứa chữ cái, số, khoảng trắng, /, - và '",
      });
    } else {
      setErrors({ ...errors, pronunciation: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      word: true,
      pronunciation: true,
      meanings: meanings.map(() => ({
        meaning: true,
        partOfSpeech: true,
        example: true,
      })),
    });

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector(`.${styles.errorMessage}`);
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Chuẩn bị dữ liệu gửi lên API
    const requestData = {
      word: word.trim(),
      pronunciation: pronunciation.trim(),
      meanings: meanings.map((m) => ({
        partOfSpeech: m.partOfSpeech,
        meaning: m.meaning.trim(),
        example: m.example.trim(),
      })),
    };

    try {
      showLoading();
      const response = await vocabulary.addVocabulary(requestData);
      console.log("Vocabulary created:", response.data);

      toast.success("Tạo từ vựng thành công!");
      navigate("/dashboard/admin/vocabulary");
    } catch (error) {
      console.error("Error creating vocabulary:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Có lỗi xảy ra khi tạo từ vựng";
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Không thể kết nối đến máy chủ");
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại");
      }
    } finally {
      hideLoading();
    }
  };

  // Kiểm tra có lỗi không
  const hasErrors = () => {
    if (errors.word) return true;
    if (errors.pronunciation) return true;
    if (errors.meanings.some((m) => m.meaning || m.partOfSpeech || m.example))
      return true;
    return false;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerTop}>
        <Link to={-1} className={styles.backLink}>
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </Link>
        <h1 className={styles.title}>Tạo từ vựng</h1>
        <p className={styles.subtitle}>
          Thêm từ mới vào thư viện chương trình học.
        </p>
      </div>

      <div
        className={styles.card}
        style={{ marginBottom: "16px", padding: "16px 20px" }}
      >
        <h2 className={styles.cardTitle} style={{ marginBottom: "12px" }}>
          Cài đặt phát âm
        </h2>
        <div className={styles.formRow} style={{ marginBottom: 0 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Chọn giọng đọc (Accent)</label>
            <select
              className={styles.selectInput}
              value={selectedVoice ? selectedVoice.name : ""}
              onChange={(e) => {
                const found = voices.find((v) => v.name === e.target.value);
                setSelectedVoice(found);
              }}
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup} style={{ flex: "0 0 220px" }}>
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

      <form onSubmit={handleSubmit} noValidate>
        {/* Basic Information Card */}
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
                  onChange={(e) => {
                    setWord(e.target.value);
                    if (touched.word) validateWord(e.target.value);
                  }}
                  onBlur={() => {
                    setTouched({ ...touched, word: true });
                    validateWord(word);
                  }}
                  className={`${styles.input} ${touched.word && errors.word ? styles.inputError : ""}`}
                  required
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
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Phát âm (IPA) <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="VD: /juːˈbɪk.wɪ.təs/"
                value={pronunciation}
                onChange={(e) => {
                  setPronunciation(e.target.value);
                  if (touched.pronunciation)
                    validatePronunciation(e.target.value);
                }}
                onBlur={() => {
                  setTouched({ ...touched, pronunciation: true });
                  validatePronunciation(pronunciation);
                }}
                className={`${styles.input} ${touched.pronunciation && errors.pronunciation ? styles.inputError : ""}`}
                required
              />
              {touched.pronunciation && errors.pronunciation && (
                <div className={styles.errorMessage}>
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  <span>{errors.pronunciation}</span>
                </div>
              )}
              <div className={styles.helperText}>
                Định dạng IPA chuẩn, ví dụ: /ˈhæpi/
              </div>
            </div>
          </div>
        </div>

        {/* Meanings & Examples Card */}
        <div className={styles.card}>
          <div className={styles.cardHeaderFlex}>
            <h2 className={styles.cardTitle}>Ý nghĩa & Ví dụ</h2>
            <button
              type="button"
              className={styles.addMeaningBtn}
              onClick={handleAddMeaning}
            >
              <FontAwesomeIcon icon={faPlus} /> Thêm ý nghĩa
            </button>
          </div>

          {meanings.map((item, index) => (
            <div key={item.id} className={styles.meaningItemBox}>
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
                    <FontAwesomeIcon icon={faTrash} /> Xóa
                  </button>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Từ loại <span className={styles.required}>*</span>
                  </label>
                  <select
                    value={item.partOfSpeech}
                    onChange={(e) => {
                      handleMeaningChange(
                        item.id,
                        "partOfSpeech",
                        e.target.value,
                      );
                    }}
                    onBlur={() => {
                      const idx = meanings.findIndex((m) => m.id === item.id);
                      const newTouched = { ...touched };
                      if (!newTouched.meanings[idx]) {
                        newTouched.meanings[idx] = {
                          meaning: false,
                          partOfSpeech: false,
                          example: false,
                        };
                      }
                      newTouched.meanings[idx].partOfSpeech = true;
                      setTouched(newTouched);
                      validateMeaningField(
                        idx,
                        "partOfSpeech",
                        item.partOfSpeech,
                      );
                    }}
                    className={`${styles.selectInput} ${touched.meanings[index]?.partOfSpeech && errors.meanings[index]?.partOfSpeech ? styles.inputError : ""}`}
                    required
                  >
                    <option value="">Chọn từ loại...</option>
                    <option value="Noun">Danh từ (Noun)</option>
                    <option value="Verb">Động từ (Verb)</option>
                    <option value="Adjective">Tính từ (Adjective)</option>
                    <option value="Adverb">Trạng từ (Adverb)</option>
                    <option value="Preposition">Giới từ (Preposition)</option>
                    <option value="Conjunction">Liên từ (Conjunction)</option>
                    <option value="Pronoun">Đại từ (Pronoun)</option>
                    <option value="Interjection">Thán từ (Interjection)</option>
                    <option value="Article">Mạo từ (Article)</option>
                    <option value="Determiner">Từ hạn định (Determiner)</option>
                  </select>
                  {touched.meanings[index]?.partOfSpeech &&
                    errors.meanings[index]?.partOfSpeech && (
                      <div className={styles.errorMessage}>
                        <FontAwesomeIcon icon={faExclamationCircle} />
                        <span>{errors.meanings[index].partOfSpeech}</span>
                      </div>
                    )}
                </div>
                <div className={styles.formGroupFlex}>
                  <label className={styles.label}>
                    Ý nghĩa <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithAction}>
                    <input
                      type="text"
                      placeholder="Định nghĩa..."
                      value={item.meaning}
                      onChange={(e) => {
                        handleMeaningChange(item.id, "meaning", e.target.value);
                      }}
                      onBlur={() => {
                        const idx = meanings.findIndex((m) => m.id === item.id);
                        const newTouched = { ...touched };
                        if (!newTouched.meanings[idx]) {
                          newTouched.meanings[idx] = {
                            meaning: false,
                            partOfSpeech: false,
                            example: false,
                          };
                        }
                        newTouched.meanings[idx].meaning = true;
                        setTouched(newTouched);
                        validateMeaningField(idx, "meaning", item.meaning);
                      }}
                      className={`${styles.input} ${touched.meanings[index]?.meaning && errors.meanings[index]?.meaning ? styles.inputError : ""}`}
                      required
                    />
                    <button
                      type="button"
                      className={styles.speakBtn}
                      onClick={() => handleSpeak(item.meaning)}
                      title="Nghe ý nghĩa"
                      disabled={!item.meaning}
                    >
                      <FontAwesomeIcon icon={faVolumeHigh} />
                    </button>
                  </div>
                  {touched.meanings[index]?.meaning &&
                    errors.meanings[index]?.meaning && (
                      <div className={styles.errorMessage}>
                        <FontAwesomeIcon icon={faExclamationCircle} />
                        <span>{errors.meanings[index].meaning}</span>
                      </div>
                    )}
                </div>
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>
                  Câu ví dụ <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWithAction}>
                  <textarea
                    placeholder="Cung cấp bối cảnh ví dụ rõ ràng..."
                    value={item.example}
                    onChange={(e) => {
                      handleMeaningChange(item.id, "example", e.target.value);
                    }}
                    onBlur={() => {
                      const idx = meanings.findIndex((m) => m.id === item.id);
                      const newTouched = { ...touched };
                      if (!newTouched.meanings[idx]) {
                        newTouched.meanings[idx] = {
                          meaning: false,
                          partOfSpeech: false,
                          example: false,
                        };
                      }
                      newTouched.meanings[idx].example = true;
                      setTouched(newTouched);
                      validateMeaningField(idx, "example", item.example);
                    }}
                    className={`${styles.textarea} ${touched.meanings[index]?.example && errors.meanings[index]?.example ? styles.inputError : ""}`}
                    rows={2}
                    required
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
                {touched.meanings[index]?.example &&
                  errors.meanings[index]?.example && (
                    <div className={styles.errorMessage}>
                      <FontAwesomeIcon icon={faExclamationCircle} />
                      <span>{errors.meanings[index].example}</span>
                    </div>
                  )}
                <div className={styles.helperText}>
                  Ví dụ minh họa cách sử dụng từ trong ngữ cảnh
                </div>
              </div>
            </div>
          ))}

          {meanings.length === 0 && (
            <div className={styles.emptyMeanings}>
              <p>Chưa có ý nghĩa nào. Vui lòng thêm ít nhất một ý nghĩa.</p>
            </div>
          )}
        </div>

        {/* Form Actions Footer */}
        <div className={styles.formActions}>
          <Link
            to={-1}
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
  );
}

export default CreateVocabulary;
