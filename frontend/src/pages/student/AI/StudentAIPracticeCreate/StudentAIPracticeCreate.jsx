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
  faMagnifyingGlass,
  faCircleCheck,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import practiceService from "../../../../services/practiceService";
import studentMembershipService from "../../../../services/studentMembershipService";
import vocabularyService from "../../../../services/vocabularyService";
import studentVocabularyService from "../../../../services/studentVocabularyService"; // ✅ Thêm API kho từ
import { useLoading } from "../../../../contexts/LoadingContext";
import {
  TOPIC_DISPLAY,
  getTopicIcon,
} from "../../../../constants/topicConstants";
import { getRandomVocabSuggestions } from "../../../../constants/vocabularySuggestions";
import Loading from "../../../../components/common/Loading/Loading";
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [aiUsage, setAiUsage] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // ✅ State cho phần Tìm kiếm / Kho từ vựng
  const [vocabSourceTab, setVocabSourceTab] = useState("search"); // "search" | "saved"
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [savedWords, setSavedWords] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedSearchQuery, setSavedSearchQuery] = useState(""); // Tìm kiếm nhanh trong kho đã lưu

  const MAX_VOCAB_WORDS = 5;

  useEffect(() => {
    checkMembershipAndLoad();
  }, []);

  useEffect(() => {
    const list = getRandomVocabSuggestions(formData.topic, formData.level, 20);
    setSuggestions(list);
  }, [formData.topic, formData.level]);

  // ✅ Gọi API lấy Kho từ vựng khi chuyển Tab
  useEffect(() => {
    if (vocabSourceTab === "saved" && savedWords.length === 0) {
      fetchSavedWords();
    }
  }, [vocabSourceTab]);

  const fetchSavedWords = async () => {
    try {
      setLoadingSaved(true);
      const response = await studentVocabularyService.getAll();
      const data = response?.data?.data ?? [];
      setSavedWords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy kho từ vựng:", error);
      toast.error("Không thể tải kho từ vựng.");
    } finally {
      setLoadingSaved(false);
    }
  };

  // ✅ Debounce Tìm kiếm API bên ngoài
  useEffect(() => {
    const timer = setTimeout(() => {
      if (vocabSourceTab === "search") {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, vocabSourceTab]);

  const handleSearch = async () => {
    const keyword = searchQuery.trim();
    if (!keyword) {
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      const response = await vocabularyService.lookup(keyword);
      const data = response?.data?.data;
      if (data) {
        const resultsArray = Array.isArray(data) ? data : [data];
        const formattedResults = resultsArray.map((item) => ({
          ...item,
          id: item.id || `lookup-${item.word}`,
        }));
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm từ vựng:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const checkMembershipAndLoad = async () => {
    try {
      showLoading();
      setIsCheckingAccess(true);
      const [membershipResponse, usageResponse] = await Promise.all([
        studentMembershipService.getCurrentMembership(),
        studentMembershipService.getAIUsage(),
      ]);

      const membershipInfo = membershipResponse?.data?.data;
      const usageInfo = usageResponse?.data?.data;

      if (!membershipInfo) {
        toast.warning("Chức năng Luyện tập AI yêu cầu gói Premium.", { position: "top-center" });
        navigate("/dashboard/student/ai-practice");
        return;
      }
      if (usageInfo && !usageInfo.canMakeRequest) {
        toast.warning("Bạn đã hết lượt sử dụng AI hôm nay.", { position: "top-center" });
        navigate("/dashboard/student/ai-practice");
        return;
      }
      setAiUsage(usageInfo);
      setIsCheckingAccess(false);
    } catch (error) {
      console.error("Lỗi kiểm tra quyền truy cập:", error);
      toast.error("Không thể kiểm tra quyền truy cập.");
      navigate("/dashboard/student/ai-practice");
    } finally {
      hideLoading();
    }
  };

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
  const TOPICS = Object.entries(TOPIC_DISPLAY).map(([value, label]) => ({
    value,
    label: `${getTopicIcon(value)} ${label}`,
  }));
  const QUESTION_LIMITS = [
    { value: 10, label: "10 câu" },
    { value: 20, label: "20 câu" },
    { value: 30, label: "30 câu" },
    { value: 50, label: "50 câu" },
  ];

  const getWordId = (wordObj) => wordObj.id || wordObj.word;
  
  const isWordSelected = (wordObj) => {
    return formData.vocabularyWords.some(
      (w) => w.word.toLowerCase() === wordObj.word.toLowerCase()
    );
  };

  const handleAddWord = (wordObj) => {
    if (isWordSelected(wordObj)) return;
    if (formData.vocabularyWords.length >= MAX_VOCAB_WORDS) {
      toast.warning(`Chỉ được chọn tối đa ${MAX_VOCAB_WORDS} từ vựng`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      vocabularyWords: [...prev.vocabularyWords, wordObj]
    }));
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveWord = (wordObj) => {
    setFormData((prev) => ({
      ...prev,
      vocabularyWords: prev.vocabularyWords.filter(
        (w) => w.word.toLowerCase() !== wordObj.word.toLowerCase()
      )
    }));
  };

  const handleSelectSuggestion = (suggestionObj) => {
    const wordObj = { word: suggestionObj.en, meanings: [{ meaning: suggestionObj.vi }] };
    if (!isWordSelected(wordObj)) handleAddWord(wordObj);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic) {
      toast.warning("Vui lòng chọn chủ đề.");
      return;
    }
    if (aiUsage && !aiUsage.canMakeRequest) {
      toast.warning("Bạn đã hết lượt sử dụng AI hôm nay.");
      return;
    }
    try {
      setIsSubmitting(true);
      showLoading();

      const wordStrings = formData.vocabularyWords.map((w) => w.word);
      const payload = {
        level: formData.level,
        sentenceType: formData.sentenceType,
        topic: formData.topic,
        questionLimit: formData.questionLimit,
        vocabularyWords: wordStrings,
      };

      const response = await practiceService.createPractice(payload);
      const data = response?.data?.data;
      toast.success("🎉 Tạo bài luyện tập thành công!");
      navigate(`/dashboard/student/ai-practice/chat/${data.id}`);
    } catch (error) {
      console.error("❌ Lỗi tạo practice:", error);
      toast.error(error.response?.data?.message || "Không thể tạo bài luyện tập.");
    } finally {
      setIsSubmitting(false);
      hideLoading();
    }
  };

  const handleBack = () => navigate("/dashboard/student/ai-practice");
  const isFormValid = formData.level && formData.topic && formData.sentenceType;

  if (isCheckingAccess) return <Loading size="large" text="Đang kiểm tra quyền truy cập..." />;

  // Lọc danh sách kho từ vựng dựa trên thanh tìm kiếm nhanh
  const filteredSavedWords = savedWords.filter(item => 
    item.word.toLowerCase().includes(savedSearchQuery.toLowerCase())
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </button>
       
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          {/* LEVEL */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}><FontAwesomeIcon icon={faBookOpen} /> Trình độ</label>
            <div className={styles.levelOptions}>
              {LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`${styles.levelOption} ${formData.level === level.value ? styles.active : ""}`}
                  onClick={() => setFormData((prev) => ({ ...prev, level: level.value }))}
                  style={{
                    borderColor: formData.level === level.value ? level.color : "",
                    backgroundColor: formData.level === level.value ? `${level.color}15` : "",
                  }}
                >
                  <span className={styles.levelDot} style={{ backgroundColor: level.color }} />
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* SENTENCE TYPE */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}><FontAwesomeIcon icon={faList} /> Loại câu</label>
            <div className={styles.typeOptions}>
              {SENTENCE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`${styles.typeOption} ${formData.sentenceType === type.value ? styles.active : ""}`}
                  onClick={() => setFormData((prev) => ({ ...prev, sentenceType: type.value }))}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* TOPIC */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}><FontAwesomeIcon icon={faTags} /> Chủ đề</label>
            <div className={styles.topicOptions}>
              {TOPICS.map((topic) => (
                <button
                  key={topic.value}
                  type="button"
                  className={`${styles.topicOption} ${formData.topic === topic.value ? styles.active : ""}`}
                  onClick={() => setFormData((prev) => ({ ...prev, topic: topic.value }))}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* QUESTION LIMIT */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Số câu</label>
            <div className={styles.limitOptions}>
              {QUESTION_LIMITS.map((limit) => (
                <button
                  key={limit.value}
                  type="button"
                  className={`${styles.limitOption} ${formData.questionLimit === limit.value ? styles.active : ""}`}
                  onClick={() => setFormData((prev) => ({ ...prev, questionLimit: limit.value }))}
                >
                  {limit.label}
                </button>
              ))}
            </div>
          </div>

          {/* VOCABULARY */}
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faLightbulb} /> Từ vựng (không bắt buộc)
            </label>
            <p className={styles.formHint}>
              Tìm kiếm từ mới hoặc chọn từ trong kho của bạn (tối đa {MAX_VOCAB_WORDS} từ)
            </p>

            {/* TAB CHUYỂN ĐỔI NGUỒN TỪ VỰNG */}
            <div className={styles.vocabTabs}>
              <button
                type="button"
                className={`${styles.vocabTabBtn} ${vocabSourceTab === "search" ? styles.vocabTabActive : ""}`}
                onClick={() => setVocabSourceTab("search")}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} /> Tìm từ mới
              </button>
              <button
                type="button"
                className={`${styles.vocabTabBtn} ${vocabSourceTab === "saved" ? styles.vocabTabActive : ""}`}
                onClick={() => setVocabSourceTab("saved")}
              >
                <FontAwesomeIcon icon={faFolderOpen} /> Kho từ vựng của tôi
              </button>
            </div>

            {/* TAB 1: TÌM KIẾM TỪ MỚI */}
            {vocabSourceTab === "search" && (
              <div className={styles.tabContent}>
                <div className={styles.searchBoxWrapper}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIconInline} />
                  <input
                    type="text"
                    placeholder="Nhập từ tiếng Anh để tìm (vd: travel, hotel...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInputInline}
                  />
                </div>
                {searchQuery.trim() && (
                  <div className={styles.searchResults}>
                    {searching && <p>Đang tìm kiếm...</p>}
                    {!searching && searchResults.length === 0 && <p>Không tìm thấy từ vựng.</p>}
                    {!searching && searchResults.map((wordObj) => {
                      const isSelected = isWordSelected(wordObj);
                      const isFull = formData.vocabularyWords.length >= MAX_VOCAB_WORDS;
                      return (
                        <div key={getWordId(wordObj)} className={styles.searchResultItem}>
                          <div>
                            <strong>{wordObj.word}</strong>
                            {wordObj.pronunciation && <span>{wordObj.pronunciation}</span>}
                            <small>{wordObj.meanings?.[0]?.meaning || "Chưa có nghĩa"}</small>
                          </div>
                          <button type="button" disabled={isSelected || isFull} onClick={() => handleAddWord(wordObj)}>
                            <FontAwesomeIcon icon={isSelected ? faCircleCheck : faPlus} />
                            {isSelected ? "Đã thêm" : isFull ? "Đã đủ" : "Thêm"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: KHO TỪ VỰNG CÁ NHÂN */}
            {vocabSourceTab === "saved" && (
              <div className={styles.tabContent}>
                <div className={styles.searchBoxWrapper}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIconInline} />
                  <input
                    type="text"
                    placeholder="Lọc nhanh trong kho từ vựng..."
                    value={savedSearchQuery}
                    onChange={(e) => setSavedSearchQuery(e.target.value)}
                    className={styles.searchInputInline}
                  />
                </div>
                {loadingSaved ? (
                  <p className={styles.loadingText}>Đang tải kho từ vựng...</p>
                ) : filteredSavedWords.length === 0 ? (
                  <p className={styles.loadingText}>Chưa có từ vựng nào trong kho.</p>
                ) : (
                  <div className={styles.searchResults}>
                    {filteredSavedWords.map((wordObj) => {
                      const isSelected = isWordSelected(wordObj);
                      const isFull = formData.vocabularyWords.length >= MAX_VOCAB_WORDS;
                      return (
                        <div key={wordObj.id} className={styles.searchResultItem}>
                          <div>
                            <strong>{wordObj.word}</strong>
                            {wordObj.pronunciation && <span>{wordObj.pronunciation}</span>}
                            <small>{wordObj.meanings?.[0]?.meaning || "Chưa có nghĩa"}</small>
                          </div>
                          <button type="button" disabled={isSelected || isFull} onClick={() => handleAddWord(wordObj)}>
                            <FontAwesomeIcon icon={isSelected ? faCircleCheck : faPlus} />
                            {isSelected ? "Đã thêm" : isFull ? "Đã đủ" : "Thêm"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TỪ VỰNG ĐÃ CHỌN */}
            {formData.vocabularyWords.length > 0 && (
              <div className={styles.selectedWordsBox}>
                <div className={styles.selectedWordsLabel}>Từ vựng đã chọn:</div>
                <div className={styles.selectedWordsTags}>
                  {formData.vocabularyWords.map((wordObj, idx) => (
                    <div key={idx} className={styles.selectedWordTag}>
                      <span>{wordObj.word}</span>
                      <button type="button" onClick={() => handleRemoveWord(wordObj)}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GỢI Ý TỪ VỰNG */}
            {suggestions.length > 0 && (
              <div className={styles.suggestionSection}>
                <div className={styles.suggestionLabel}>Gợi ý cho chủ đề & trình độ này:</div>
                <div className={styles.suggestionChips}>
                  {suggestions.map((wordObj, idx) => {
                    const wordObjFormatted = { word: wordObj.en, meanings: [{ meaning: wordObj.vi }] };
                    const isSelected = isWordSelected(wordObjFormatted);
                    return (
                      <div key={`${wordObj.en}-${idx}`} className={styles.chipWrapper}>
                        <button
                          type="button"
                          className={`${styles.suggestionChip} ${isSelected ? styles.suggestionChipActive : ""}`}
                          onClick={() =>
                            isSelected ? handleRemoveWord(wordObjFormatted) : handleSelectSuggestion(wordObj)
                          }
                          disabled={!isSelected && formData.vocabularyWords.length >= MAX_VOCAB_WORDS}
                        >
                          {isSelected && "✓ "} {wordObj.en}
                        </button>
                        <span className={styles.tooltip}>{wordObj.vi}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.vocabCounter}>
              <span>Đã chọn: {formData.vocabularyWords.length} / {MAX_VOCAB_WORDS} từ</span>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={handleBack}>Hủy</button>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Đang tạo...</>
            ) : (
              <><FontAwesomeIcon icon={faPlay} /> Bắt đầu luyện tập</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentAIPracticeCreate;