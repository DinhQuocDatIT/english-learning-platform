import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CreateVocabulary.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faVolumeHigh,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { speakText, getAvailableVoices } from "../../../utils/textToSpeech";
import vocabulary from "../../../services/vocabulary";
import { toast } from "react-toastify";
import { useLoading } from "../../../contexts/LoadingContext";

function CreateVocabulary() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [word, setWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [meanings, setMeanings] = useState([
    { id: 1, partOfSpeech: "", meaning: "", example: "" },
  ]);

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.9);

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
    speakText(text, {
      voice: selectedVoice,
      rate: Number(speechRate),
    });
  };

  const handleAddMeaning = () => {
    setMeanings([
      ...meanings,
      { id: Date.now(), partOfSpeech: "", meaning: "", example: "" },
    ]);
  };

  const handleRemoveMeaning = (id) => {
    if (meanings.length > 1) {
      setMeanings(meanings.filter((item) => item.id !== id));
    }
  };

  const handleMeaningChange = (id, field, value) => {
    setMeanings(
      meanings.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dữ liệu trước khi gửi
    if (!word.trim()) {
      toast.error("Vui lòng nhập từ vựng");
      return;
    }

    if (meanings.some((m) => !m.meaning.trim())) {
      toast.error("Vui lòng nhập đầy đủ ý nghĩa cho từ vựng");
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

      navigate("/dashboard/admin/vocabulary"); // Đường dẫn đến trang danh sách từ vựng
    } catch (error) {
      console.error("Error creating vocabulary:", error);

      if (error.response) {
        // Server trả về lỗi
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

  return (
    <div className={styles.wrapper}>
      {/* Header section với nút quay về trang trước */}
      <div className={styles.headerTop}>
        <Link to={-1} className={styles.backLink}>
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </Link>
        <h1 className={styles.title}>Tạo từ vựng</h1>
        <p className={styles.subtitle}>
          Thêm từ mới vào thư viện chương trình học.
        </p>
      </div>

      {/* Card Cài đặt âm thanh (Giọng đọc & Tốc độ) */}
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
              onChange={(e) => setSpeechRate(e.target.value)}
            >
              <option value="0.7">Chậm (0.7x)</option>
              <option value="0.9">Bình thường (0.9x)</option>
              <option value="1.0">Nhanh (1.0x)</option>
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Thông tin cơ bản</h2>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Từ vựng</label>
              <div className={styles.inputWithAction}>
                <input
                  type="text"
                  placeholder="VD: Ubiquitous"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className={styles.input}
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
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phát âm (IPA)</label>
              <input
                type="text"
                placeholder="VD: /juːˈbɪk.wɪ.təs/"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                className={styles.input}
              />
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

          {meanings.map((item) => (
            <div key={item.id} className={styles.meaningItemBox}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Từ loại</label>
                  <select
                    value={item.partOfSpeech}
                    onChange={(e) =>
                      handleMeaningChange(
                        item.id,
                        "partOfSpeech",
                        e.target.value,
                      )
                    }
                    className={styles.selectInput}
                  >
                    <option value="">Chọn...</option>
                    <option value="Noun">Danh từ (Noun)</option>
                    <option value="Verb">Động từ (Verb)</option>
                    <option value="Adjective">Tính từ (Adjective)</option>
                    <option value="Adverb">Trạng từ (Adverb)</option>
                  </select>
                </div>
                <div className={styles.formGroupFlex}>
                  <label className={styles.label}>Ý nghĩa</label>
                  <div className={styles.inputWithAction}>
                    <input
                      type="text"
                      placeholder="Định nghĩa..."
                      value={item.meaning}
                      onChange={(e) =>
                        handleMeaningChange(item.id, "meaning", e.target.value)
                      }
                      className={styles.input}
                      required
                    />
                    {meanings.length > 1 && (
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleRemoveMeaning(item.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Câu ví dụ</label>
                <div className={styles.inputWithAction}>
                  <textarea
                    placeholder="Cung cấp bối cảnh ví dụ rõ ràng..."
                    value={item.example}
                    onChange={(e) =>
                      handleMeaningChange(item.id, "example", e.target.value)
                    }
                    className={styles.textarea}
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
              </div>
            </div>
          ))}
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
          <button type="submit" className={styles.submitBtn}>
            Lưu từ vựng
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateVocabulary;
