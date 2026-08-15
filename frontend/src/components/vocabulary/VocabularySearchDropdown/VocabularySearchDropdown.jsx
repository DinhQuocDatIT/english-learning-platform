import React, { useState, useRef, useEffect } from "react";
import styles from "./VocabularySearchDropdown.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";

import vocabularyService from "../../../services/vocabularyService";
import studentVocabularyService from "../../../services/studentVocabulary";

import VocabularyResult from "../VocabularyResult/VocabularyResult";

function VocabularySearchDropdown() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [vocabularyList, setVocabularyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const searchRef = useRef(null);



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

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await vocabularyService.searchVocabulary(keyword);

        console.log("Vocabulary search API:", response);

        const data = response?.data?.data ?? [];

        setVocabularyList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi tra cứu từ vựng:", error);

        setVocabularyList([]);

        toast.error(
          error.response?.data?.message || "Không thể tra cứu từ vựng.",
        );
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);


  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  
  const handleSaveVocabulary = async (vocabulary) => {
    if (!vocabulary?.id) {
      toast.error("Không xác định được từ vựng.");
      return;
    }

    try {
      setSavingId(vocabulary.id);

      const response = await studentVocabularyService.saveVocabulary({
        vocabularyId: vocabulary.id,
      });

      console.log("Save vocabulary response:", response);

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
  };

  return (
    <div className={styles.container} ref={searchRef}>
      {/* SEARCH SECTION */}

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
          {/* LOADING */}

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
            vocabularyList.map((vocabulary) => (
              <VocabularyResult
                key={vocabulary.id}
                vocabulary={vocabulary}
                onSave={handleSaveVocabulary}
                saving={savingId === vocabulary.id}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default VocabularySearchDropdown;
