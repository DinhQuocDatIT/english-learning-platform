import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faVolumeHigh,
  faSpinner,
  faBookOpen,
  faCircleExclamation,
  faPlus,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

import dictWordService from "../../services/dictWordService";
import studentVocabularyService from "../../services/studentVocabularyService";
import { speakText } from "../../utils/textToSpeech";
import styles from "./DictWordDetailModal.module.css";

function DictWordDetailModal({ word, onClose }) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [speakingText, setSpeakingText] = useState(null);

  const cleanWord = word
    ? word.replace(/^[.,!?;:'"()\[\]{}]+|[.,!?;:'"()\[\]{}]+$/g, "").trim()
    : "";

  // ===== FETCH DETAIL =====
  useEffect(() => {
    if (!cleanWord) return;

    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setSaved(false);

        const res = await dictWordService.find(cleanWord);
        const list = res?.data?.data;

        if (!Array.isArray(list) || list.length === 0) {
          if (isMounted) setDetail(null);
          return;
        }

        if (isMounted) setDetail(list[0]);
      } catch (error) {
        console.error("Lỗi tra từ:", error);
        if (isMounted) setDetail(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [cleanWord]);

  // ===== ESC ĐỂ ĐÓNG =====
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // ===== KHÓA SCROLL BODY =====
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!word) return null;

  const handleSpeak = (text) => {
    if (!text) return;
    setSpeakingText(text);
    speakText(text, { lang: "en-US", rate: 1.0 });
    setTimeout(() => {
      setSpeakingText(null);
    }, 1200);
  };

  const formatPronunciation = (pron) => {
    if (!pron) return "";
    const trimmed = pron.trim();
    if (trimmed.startsWith("/") && trimmed.endsWith("/")) return trimmed;
    return `/${trimmed}/`;
  };

  // ===== LƯU TỪ =====
  const handleSave = async () => {
    if (!detail || saving || saved) return;

    try {
      setSaving(true);

      const payload = {
        word: detail.word,
        pronunciation: detail.pronunciation || null,
        meanings: (detail.meanings || []).map((m) => ({
          partOfSpeech: m.partOfSpeech || "",
          meaning: m.meaning,
          example: m.example || null,
        })),
      };

      await studentVocabularyService.saveVocabulary(payload);

      setSaved(true);
      toast.success(`Đã lưu từ "${detail.word}" vào sổ tay!`);
    } catch (error) {
      console.error("Lỗi lưu từ:", error);

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (
        status === 409 ||
        (message && message.toLowerCase().includes("đã tồn tại"))
      ) {
        setSaved(true);
        toast.info(`Từ "${detail.word}" đã có trong sổ tay!`);
      } else {
        toast.error(message || "Không thể lưu từ. Vui lòng thử lại.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconBox}>
              <FontAwesomeIcon icon={faBookOpen} />
            </div>
            <span className={styles.headerTitle}>Tra từ điển</span>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          {loading ? (
            <div className={styles.loadingBox}>
              <FontAwesomeIcon icon={faSpinner} spin />
              <p>Đang tìm kiếm trong từ điển...</p>
            </div>
          ) : !detail ? (
            <div className={styles.emptyBox}>
              <div className={styles.emptyIconBox}>
                <FontAwesomeIcon icon={faCircleExclamation} />
              </div>
              <p className={styles.emptyTitle}>Không tìm thấy kết quả</p>
              <p className={styles.emptyText}>
                Chưa có dữ liệu cho từ{" "}
                <strong>&ldquo;{cleanWord}&rdquo;</strong>
              </p>
            </div>
          ) : (
            <>
              {/* WORD HEADER CARD */}
              <div className={styles.wordHeader}>
                <div className={styles.wordInfo}>
                  <div className={styles.wordTitleRow}>
                    <h2 className={styles.wordTitle}>{detail.word}</h2>
                    <button
                      type="button"
                      className={`${styles.speakBtn} ${
                        speakingText === detail.word ? styles.speaking : ""
                      }`}
                      onClick={() => handleSpeak(detail.word)}
                      title="Phát âm từ"
                    >
                      <FontAwesomeIcon icon={faVolumeHigh} />
                    </button>
                  </div>
                  {detail.pronunciation && (
                    <span className={styles.pronunciation}>
                      {formatPronunciation(detail.pronunciation)}
                    </span>
                  )}
                </div>

                <div className={styles.wordActions}>
                  {/* Nút lưu */}
                  <button
                    type="button"
                    className={`${styles.saveBtn} ${
                      saved ? styles.saveBtnSaved : ""
                    }`}
                    onClick={handleSave}
                    disabled={saving || saved}
                    title={saved ? "Đã trong sổ tay" : "Lưu vào sổ tay cá nhân"}
                  >
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <span>Đang lưu</span>
                      </>
                    ) : saved ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Đã lưu</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Lưu vào sổ tay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* MEANINGS SECTION */}
              {detail.meanings && detail.meanings.length > 0 ? (
                <div className={styles.section}>
                  {/* <div className={styles.sectionHeader}>
                    <span>Các nghĩa của từ</span>
                  </div> */}
                  <ul className={styles.meaningList}>
                    {detail.meanings.map((m, idx) => (
                      <li key={idx} className={styles.meaningItem}>
                        <div className={styles.meaningMainBox}>
                          {m.partOfSpeech && (
                            <span className={styles.posTag}>
                              {m.partOfSpeech}
                            </span>
                          )}
                          <span className={styles.meaningText}>
                            {m.meaning}
                          </span>
                        </div>

                        {m.example && (
                          <div className={styles.exampleBox}>
                            <span
                              className={styles.exampleText}
                              onClick={() => handleSpeak(m.example)}
                              title="Click để nghe phát âm câu ví dụ"
                            >
                              &ldquo;{m.example}&rdquo;
                            </span>
                            <button
                              type="button"
                              className={`${styles.exampleSpeakBtn} ${
                                speakingText === m.example
                                  ? styles.speaking
                                  : ""
                              }`}
                              onClick={() => handleSpeak(m.example)}
                              title="Nghe câu ví dụ"
                            >
                              <FontAwesomeIcon icon={faVolumeHigh} />
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className={styles.emptyBox}>
                  <p className={styles.emptyText}>
                    Chưa có thông tin định nghĩa chi tiết
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DictWordDetailModal;
