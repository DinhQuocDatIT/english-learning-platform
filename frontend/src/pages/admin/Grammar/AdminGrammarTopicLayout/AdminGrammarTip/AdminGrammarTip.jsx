import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import grammarService from "../../../../../services/grammarService";
import styles from "./AdminGrammarTip.module.css";

const OPTION_LABELS = ["A", "B", "C", "D"];

// =====================================================
// TIP CARD — có quiz tương tác
// =====================================================
function TipCard({ tip }) {
  // State chọn đáp án riêng cho từng tip
  const [selected, setSelected] = useState(null); // "A" | "B" | ... | null
  const [submitted, setSubmitted] = useState(false); // đã chọn đáp án chưa

  const isCorrect = selected === tip.correctAnswer;

  const handleSelect = (label) => {
    if (submitted) return; // đã chọn thì không đổi được
    setSelected(label);
    setSubmitted(true); // chọn xong là hiện kết quả luôn
  };

  const handleReset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className={styles.tipCard}>
      {/* HEADER */}
      <div className={styles.tipHeader}>
        <div className={styles.tipIcon}>
          <FontAwesomeIcon icon={faLightbulb} />
        </div>
        <h3 className={styles.tipTitle}>{tip.title}</h3>
      </div>

      {/* CONTENT */}
      {tip.content && <p className={styles.tipContent}>{tip.content}</p>}

      {/* APPLY STEPS */}
      {tip.applySteps?.length > 0 && (
        <div className={styles.applyBox}>
          <span className={styles.boxLabel}>CÁCH ÁP DỤNG</span>
          <ol className={styles.stepList}>
            {tip.applySteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {/* QUIZ */}
      {tip.question && tip.options?.length > 0 && (
        <div className={styles.quizBox}>
          <span className={styles.boxLabel}>THỬ ÁP DỤNG NGAY</span>
          <p className={styles.question}>{tip.question}</p>

          <div className={styles.optionsPreview}>
            {tip.options.map((opt, i) => {
              const label = OPTION_LABELS[i];
              const isThisCorrect = label === tip.correctAnswer;
              const isThisSelected = label === selected;

              // Class trạng thái
              let stateClass = "";
              if (submitted) {
                if (isThisCorrect) stateClass = styles.optionCorrect;
                else if (isThisSelected) stateClass = styles.optionWrong;
              } else if (isThisSelected) {
                stateClass = styles.optionSelected;
              }

              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.optionPreview} ${stateClass}`}
                  onClick={() => handleSelect(label)}
                  disabled={submitted}
                >
                  <span className={styles.optionLabel}>{label}.</span>
                  <span className={styles.optionText}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Kết quả — chỉ hiện khi đã chọn đáp án */}
          {submitted && (
            <div
              className={`${styles.resultBox} ${
                isCorrect ? styles.resultCorrect : styles.resultWrong
              }`}
            >
              <strong>
                {isCorrect
                  ? "Chính xác!"
                  : `Sai rồi! Đáp án đúng là ${tip.correctAnswer}.`}
              </strong>
              {tip.explanation && <p>{tip.explanation}</p>}

              <button
                type="button"
                className={styles.resetBtn}
                onClick={handleReset}
              >
                Làm lại
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
// MAIN
// =====================================================
function AdminGrammarTip() {
  const { topicId } = useOutletContext();

  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) fetchTips();
  }, [topicId]);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const res = await grammarService.adminGetTips(topicId);
      setTips(res?.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
      </div>
    );
  }

  if (tips.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <FontAwesomeIcon icon={faLightbulb} className={styles.emptyIcon} />
        <p>Chủ điểm này chưa có mẹo nào.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {tips.map((tip) => (
        <TipCard key={tip.id} tip={tip} />
      ))}
    </div>
  );
}

export default AdminGrammarTip;
