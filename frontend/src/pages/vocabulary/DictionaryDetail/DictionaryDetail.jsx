import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

import dictWordService from "../../../services/dictWordService";
import { useLoading } from "../../../contexts/LoadingContext";
import Loading from "../../../components/common/Loading/Loading";
import { speakText } from "../../../utils/textToSpeech";
import { toast } from "react-toastify";
import styles from "./DictionaryDetail.module.css";

function DictionaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading();
        setError("");

        const res = await dictWordService.getDetail(id);
        setData(res.data.data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết:", err);
        setError(
          err.response?.data?.message || "Không thể tải chi tiết từ vựng.",
        );
        toast.error("Không thể tải chi tiết từ vựng.");
      } finally {
        hideLoading();
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSpeak = () => {
    if (!data?.word) return;
    speakText(data.word);
  };

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.errorBox}>{error}</div>
      </div>
    );
  }

  // ===== LOADING =====
  if (!data) {
    return <Loading size="large" text="Đang tải chi tiết từ vựng..." />;
  }

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <div className={styles.headerTop}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Quay lại
        </button>

        <span className={styles.idBadge}>#{data.id}</span>
      </div>

      {/* WORD INFO */}
      <div className={styles.card}>
        <div className={styles.wordHeader}>
          <div>
            <h1 className={styles.word}>{data.word}</h1>

            {data.pronunciation && (
              <p className={styles.pronunciation}>{data.pronunciation}</p>
            )}
          </div>

          <div className={styles.wordActions}>
            <span
              className={`${styles.langBadge} ${
                data.langCode === "en" ? styles.langEn : styles.langVi
              }`}
            >
              {data.langCode === "en" ? "Tiếng Anh" : "Tiếng Việt"}
            </span>

            <button
              type="button"
              className={styles.speakBtn}
              onClick={handleSpeak}
              title="Nghe phát âm"
            >
              <FontAwesomeIcon icon={faVolumeHigh} />
            </button>
          </div>
        </div>
      </div>

      {/* MEANINGS */}
      {data.meanings && data.meanings.length > 0 && (
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Nghĩa</h2>
            <span className={styles.countBadge}>
              {data.meanings.length} nghĩa
            </span>
          </div>

          <div className={styles.meaningsList}>
            {data.meanings.map((m, i) => (
              <div key={i} className={styles.meaningItem}>
                <div className={styles.meaningTop}>
                  {m.partOfSpeech && (
                    <span className={styles.posTag}>{m.partOfSpeech}</span>
                  )}
                  <p className={styles.meaningText}>{m.meaning}</p>
                </div>

                {m.example && <p className={styles.exampleText}>{m.example}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSLATIONS */}
      {data.translations && data.translations.length > 0 && (
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Bản dịch tiếng Anh</h2>
            <span className={styles.countBadge}>
              {data.translations.length}
            </span>
          </div>

          <div className={styles.translationList}>
            {data.translations.map((t, i) => (
              <span key={i} className={styles.translationItem}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY */}
      {(!data.meanings || data.meanings.length === 0) &&
        (!data.translations || data.translations.length === 0) && (
          <div className={styles.card}>
            <div className={styles.emptyBox}>
              Không có dữ liệu nghĩa cho từ này.
            </div>
          </div>
        )}
    </div>
  );
}

export default DictionaryDetail;
