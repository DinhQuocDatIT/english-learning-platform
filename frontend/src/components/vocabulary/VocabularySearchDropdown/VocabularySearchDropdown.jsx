import React, { useState, useRef, useEffect } from "react";
import styles from "./VocabularySearchDropdown.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";

import vocabularyService from "../../../services/vocabularyService";
import studentVocabularyService from "../../../services/studentVocabularyService";

import VocabularyResult from "../VocabularyResult/VocabularyResult";

function VocabularySearchDropdown() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [vocabularyList, setVocabularyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const searchRef = useRef(null);
  const inputRef = useRef(null); // ← THÊM ref cho input

  // ✅ Auto focus khi component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const keyword = searchTerm.trim();

    if (!keyword) {
      setVocabularyList([]);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    const controller = new AbortController();
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await vocabularyService.search(keyword, 10, {
          signal: controller.signal,
        });

        if (isCancelled) return;

        const data = response?.data?.data ?? [];

        const seen = new Set();
        const unique = [];

        for (const item of data) {
          const key =
            item.word.toLowerCase() +
            "|" +
            (item.meanings || []).map((m) => m.meaning.toLowerCase()).join("|");

          if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        }

        setVocabularyList(unique);
      } catch (error) {
        if (error.name === "CanceledError" || isCancelled) return;

        console.error("Lỗi tra cứu từ vựng:", error);
        setVocabularyList([]);

        toast.error(
          error.response?.data?.message || "Không thể tra cứu từ vựng.",
        );
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSaveVocabulary = async (vocabulary) => {
    if (!vocabulary?.word) {
      toast.error("Không xác định được từ vựng.");
      return;
    }

    try {
      setSavingId(vocabulary.word);

      await studentVocabularyService.saveVocabulary({
        word: vocabulary.word,
        pronunciation: vocabulary.pronunciation,
        meanings: vocabulary.meanings,
      });

      toast.success(`Đã lưu từ "${vocabulary.word}" vào kho từ vựng!`);
    } catch (error) {
      console.error("Lỗi lưu từ vựng:", error);
      const message = error.response?.data?.message || "Không thể lưu từ vựng.";
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setVocabularyList([]);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={styles.container} ref={searchRef}>
      <div className={styles.searchSection}>
        <div className={styles.sectionHeader}>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className={styles.headerIcon}
          />
          <span>TỪ ĐIỂN</span>
        </div>

        <div className={styles.searchBoxWrapper}>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className={styles.searchIcon}
          />

          <input
            ref={inputRef} // ← GẮN REF VÀO INPUT
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchTerm.trim()) {
                setIsOpen(true);
              }
            }}
            placeholder="Tìm kiếm từ vựng..."
            className={styles.searchInput}
          />

          {searchTerm && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              aria-label="Xóa tìm kiếm"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdownResultOverlay}>
          {loading && (
            <div className={styles.loading}>
              <FontAwesomeIcon icon={faMagnifyingGlass} spin />
              <span>Đang tra cứu...</span>
            </div>
          )}

          {!loading && searchTerm.trim() && vocabularyList.length === 0 && (
            <div className={styles.emptyResult}>
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </div>
              <p>
                Không tìm thấy từ <strong>"{searchTerm}"</strong>
              </p>
              <span>Hãy thử nhập từ khác</span>
            </div>
          )}

          {!loading &&
            vocabularyList.length > 0 &&
            vocabularyList.map((vocabulary, index) => (
              <VocabularyResult
                key={`${vocabulary.word}-${index}`}
                vocabulary={vocabulary}
                onSave={handleSaveVocabulary}
                saving={savingId === vocabulary.word}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default VocabularySearchDropdown;
