import React, { useEffect, useState } from "react";
import styles from "./CreateStudySession.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faLayerGroup,
  faCircleCheck,
  faClockRotateLeft,
  faMagnifyingGlass,
  faArrowRight,
  faXmark,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";

import studentVocabularyService from "../../../services/studentVocabularyService";
import vocabularyService from "../../../services/vocabularyService";

function CreateStudySession() {
  const navigate = useNavigate();

  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedCount, setSelectedCount] = useState(20);
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadWordsBySource();
  }, [selectedSource]);

  const loadWordsBySource = async () => {
    try {
      setLoading(true);

      let response;

      if (selectedSource === "all") {
        response = await studentVocabularyService.getAll();
      } else if (selectedSource === "learned") {
        response = await studentVocabularyService.getByStatus("LEARNED");
      } else if (selectedSource === "unlearned") {
        response = await studentVocabularyService.getByStatus("NOT_LEARNED");
      }

      if (!response) {
        setAvailableWords([]);
        setSelectedWords([]);
        return;
      }

      const words = response.data?.data ?? response.data ?? [];
      setAvailableWords(words);
      const limit = Math.min(selectedCount, words.length);
      setSelectedWords(words.slice(0, limit));
    } catch (error) {
      console.error("Không thể lấy danh sách từ:", error);
      setAvailableWords([]);
      setSelectedWords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSource = (source) => {
    setSelectedSource(source);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleChangeCount = (count) => {
    if (count <= 0) return;
    setSelectedCount(count);
    const limit = Math.min(count, availableWords.length);
    setSelectedWords(availableWords.slice(0, limit));
  };

  const handleRemoveWord = (wordId) => {
    setSelectedWords((prev) =>
      prev.filter((word) => getWordId(word) !== wordId),
    );
  };

  const handleAddWord = (word) => {
    const wordId = getWordId(word);
    const alreadyExists = selectedWords.some(
      (item) => getWordId(item) === wordId,
    );

    if (alreadyExists) return;

    if (selectedWords.length >= selectedCount) {
      alert(`Chỉ được chọn tối đa ${selectedCount} từ.`);
      return;
    }

    setSelectedWords((prev) => [...prev, word]);
    setSearchResults([]);
    setSearchQuery("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    const keyword = searchQuery.trim();

    if (!keyword) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await vocabularyService.searchVocabulary(keyword);
      const words = response.data?.data ?? response.data ?? [];
      setSearchResults(words);
    } catch (error) {
      console.error("Search vocabulary error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleStartStudy = () => {
    if (selectedWords.length === 0) {
      alert("Vui lòng chọn ít nhất 1 từ để học.");
      return;
    }

    navigate("/dashboard/student/study-flash-card", {
      state: {
        words: selectedWords,
        source: selectedSource,
      },
    });
  };

  const getWordId = (word) => {
    return word.vocabularyId ?? word.id;
  };

  const getMeaning = (word) => {
    if (!word.meanings || word.meanings.length === 0) {
      return "Chưa có nghĩa";
    }
    return word.meanings[0].meaning;
  };

  const getPartOfSpeech = (word) => {
    if (!word.meanings || word.meanings.length === 0) {
      return "";
    }
    return word.meanings[0].partOfSpeech ?? "";
  };

  return (
    <div className={styles.container}>
      <div className={styles.topHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Quay lại
        </button>

        <h1 className={styles.pageTitle}>Tạo phiên học</h1>
        <p className={styles.subtitle}>Chọn những từ bạn muốn ôn tập hôm nay</p>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionHeading}>
              Bạn muốn học những từ nào?
            </h2>

            <div className={styles.sourceGrid}>
              <div
                className={`${styles.sourceCard} ${
                  selectedSource === "all" ? styles.selectedSourceCard : ""
                }`}
                onClick={() => handleChangeSource("all")}
              >
                <div className={styles.sourceCardTop}>
                  <div
                    className={`${styles.sourceIconBox} ${styles.iconGreen}`}
                  >
                    <FontAwesomeIcon icon={faLayerGroup} />
                  </div>
                  <span className={styles.sourceCountBadge}>Tất cả</span>
                </div>

                <div className={styles.sourceInfo}>
                  <h3>Tất cả đã lưu</h3>
                  <p>Ôn tập từ vựng bạn đã lưu</p>
                </div>
              </div>

              <div
                className={`${styles.sourceCard} ${
                  selectedSource === "learned" ? styles.selectedSourceCard : ""
                }`}
                onClick={() => handleChangeSource("learned")}
              >
                <div className={styles.sourceCardTop}>
                  <div className={`${styles.sourceIconBox} ${styles.iconBlue}`}>
                    <FontAwesomeIcon icon={faCircleCheck} />
                  </div>
                  <span className={styles.sourceCountBadge}>Đã học</span>
                </div>

                <div className={styles.sourceInfo}>
                  <h3>Từ đã học</h3>
                  <p>Những từ bạn đã học trước đó</p>
                </div>
              </div>

              <div
                className={`${styles.sourceCard} ${
                  selectedSource === "unlearned"
                    ? styles.selectedSourceCard
                    : ""
                }`}
                onClick={() => handleChangeSource("unlearned")}
              >
                <div className={styles.sourceCardTop}>
                  <div
                    className={`${styles.sourceIconBox} ${styles.iconOrange}`}
                  >
                    <FontAwesomeIcon icon={faClockRotateLeft} />
                  </div>
                  <span className={styles.sourceCountBadge}>Chưa nhớ</span>
                </div>

                <div className={styles.sourceInfo}>
                  <h3>Từ chưa nhớ</h3>
                  <p>Những từ bạn cần ôn tập lại</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionHeading}>Số lượng từ</h2>
              <span className={styles.maxLimitLabel}>
                Có {availableWords.length} từ
              </span>
            </div>

            <div className={styles.numberOptions}>
              {[10, 20, 30, 40, 50].map((num) => {
                const active = selectedCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    className={`${styles.numBtn} ${
                      active ? styles.activeNumBtn : ""
                    }`}
                    onClick={() => handleChangeCount(num)}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionHeading}>Từ vựng trong phiên học</h2>
              <span className={styles.maxLimitLabel}>
                {selectedWords.length} / {selectedCount} từ
              </span>
            </div>

            <div className={styles.searchBoxWrapper}>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className={styles.searchIconInline}
              />

              <input
                type="text"
                placeholder="Tìm từ vựng để thêm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInputInline}
              />
            </div>

            {searchQuery.trim() && (
              <div className={styles.searchResults}>
                {searching && <p>Đang tìm...</p>}

                {!searching && searchResults.length === 0 && (
                  <p>Không tìm thấy từ vựng.</p>
                )}

                {!searching &&
                  searchResults.map((word) => {
                    const id = getWordId(word);
                    const exists = selectedWords.some(
                      (item) => getWordId(item) === id,
                    );
                    const isFull = selectedWords.length >= selectedCount;

                    return (
                      <div key={id} className={styles.searchResultItem}>
                        <div>
                          <strong>{word.word}</strong>
                          <span>{word.pronunciation}</span>
                          <small>{getMeaning(word)}</small>
                        </div>

                        <button
                          type="button"
                          disabled={exists || isFull}
                          onClick={() => handleAddWord(word)}
                        >
                          <FontAwesomeIcon
                            icon={exists ? faCircleCheck : faPlus}
                          />
                          {exists ? "Đã thêm" : isFull ? "Đã đủ" : "Thêm"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className={styles.wordsGrid}>
              {loading && <p>Đang tải danh sách từ...</p>}

              {!loading && selectedWords.length === 0 && (
                <p>Chưa có từ nào trong phiên học.</p>
              )}

              {!loading &&
                selectedWords.map((word) => {
                  const id = getWordId(word);

                  return (
                    <div key={id} className={styles.wordCheckboxCard}>
                      <div className={styles.wordCardContent}>
                        <span className={styles.cardWordTitle}>
                          {word.word}
                        </span>
                        <span className={styles.cardWordPronounce}>
                          {word.pronunciation}
                        </span>
                        <span className={styles.cardWordMeaning}>
                          {getMeaning(word)}
                        </span>
                        {getPartOfSpeech(word) && (
                          <small>{getPartOfSpeech(word)}</small>
                        )}
                      </div>

                      <button
                        type="button"
                        className={styles.removeWordBtn}
                        onClick={() => handleRemoveWord(id)}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <div className={styles.summaryIconBox}>
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              <h3 className={styles.summaryTitle}>Phiên học của bạn</h3>
            </div>

            <div className={styles.summaryDetailList}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Nguồn từ</span>
                <span className={styles.summaryValue}>
                  {selectedSource === "all" && "Tất cả từ đã lưu"}
                  {selectedSource === "learned" && "Từ đã học"}
                  {selectedSource === "unlearned" && "Từ chưa nhớ"}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Số lượng</span>
                <span className={styles.summaryValue}>
                  {selectedWords.length} / {selectedCount} từ
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Thời gian dự kiến</span>
                <span className={styles.summaryValueTime}>
                  <FontAwesomeIcon icon={faClockRotateLeft} />~{" "}
                  {Math.max(1, Math.round(selectedWords.length * 0.25))} phút
                </span>
              </div>
            </div>

            <button
              type="button"
              className={styles.startSessionBtn}
              disabled={selectedWords.length === 0}
              onClick={handleStartStudy}
            >
              Bắt đầu học
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateStudySession;
