import React, { useState } from "react";
import styles from "./CreateStudySession.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faLayerGroup,
  faCircleCheck,
  faClockRotateLeft,
  faListCheck,
  faMagnifyingGlass,
  faArrowRight,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function CreateStudySession() {
  const navigate = useNavigate();

  // Các state cấu hình phiên học
  const [selectedSource, setSelectedSource] = useState("all"); // 'all' | 'learned' | 'unlearned' | 'custom'
  const [selectedCount, setSelectedCount] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");

  // Danh sách từ vựng mẫu cho phần "Tự chọn từ vựng"
  const [customWords, setCustomWords] = useState([
    {
      id: 1,
      word: "ubiquitous",
      pronunciation: "/juːˈbɪk.wə.təs/",
      meaning: "có mặt ở khắp nơi",
      selected: false,
    },
    {
      id: 2,
      word: "ephemeral",
      pronunciation: "/ɪˈfem.ər.əl/",
      meaning: "chóng tàn, phù du",
      selected: false,
    },
    {
      id: 3,
      word: "mitigate",
      pronunciation: "/ˈmɪt.ɪ.ɡeɪt/",
      meaning: "làm nhẹ, làm dịu",
      selected: false,
    },
    {
      id: 4,
      word: "pragmatic",
      pronunciation: "/præɡˈmæt.ɪk/",
      meaning: "thực tế, thực dụng",
      selected: false,
    },
    {
      id: 5,
      word: "benevolent",
      pronunciation: /bəˈnev.ə.lənt/,
      meaning: "nhân từ, rộng lượng",
      selected: false,
    },
  ]);

  const handleToggleWordSelection = (id) => {
    setCustomWords((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleSelectAll = () => {
    setCustomWords((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  // Tính toán số lượng từ được chọn thủ công
  const selectedCustomCount = customWords.filter((w) => w.selected).length;

  return (
    <div className={styles.container}>
      {/* Nút Quay lại & Tiêu đề */}
      <div className={styles.topHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </button>
        <h1 className={styles.pageTitle}>TẠO PHIÊN HỌC</h1>
        <p className={styles.subtitle}>Chọn những từ bạn muốn ôn tập hôm nay</p>
      </div>

      {/* Layout chính: Chia 2 cột (Trái: Cấu hình, Phải: Tổng quan phiên học) */}
      <div className={styles.mainLayout}>
        {/* CỘT TRÁI: Các thiết lập phiên học */}
        <div className={styles.leftColumn}>
          {/* Phần 1: Chọn nguồn từ */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionHeading}>
              Bạn muốn học những từ nào?
            </h2>
            <div className={styles.sourceGrid}>
              {/* Nguồn 1: Tất cả đã lưu */}
              <div
                className={`${styles.sourceCard} ${selectedSource === "all" ? styles.selectedSourceCard : ""}`}
                onClick={() => setSelectedSource("all")}
              >
                <div className={styles.sourceCardTop}>
                  <div
                    className={`${styles.sourceIconBox} ${styles.iconGreen}`}
                  >
                    <FontAwesomeIcon icon={faLayerGroup} />
                  </div>
                  <span className={styles.sourceCountBadge}>124 từ</span>
                </div>
                <div className={styles.sourceInfo}>
                  <h3>Tất cả đã lưu</h3>
                  <p>Ôn tập ngẫu nhiên từ kho từ vựng của bạn</p>
                </div>
              </div>

              {/* Nguồn 2: Từ đã học */}
              <div
                className={`${styles.sourceCard} ${selectedSource === "learned" ? styles.selectedSourceCard : ""}`}
                onClick={() => setSelectedSource("learned")}
              >
                <div className={styles.sourceCardTop}>
                  <div className={`${styles.sourceIconBox} ${styles.iconBlue}`}>
                    <FontAwesomeIcon icon={faCircleCheck} />
                  </div>
                  <span className={styles.sourceCountBadge}>35 từ</span>
                </div>
                <div className={styles.sourceInfo}>
                  <h3>Từ đã học</h3>
                  <p>Những từ bạn đã thuộc lòng</p>
                </div>
              </div>

              {/* Nguồn 3: Từ chưa nhớ */}
              <div
                className={`${styles.sourceCard} ${selectedSource === "unlearned" ? styles.selectedSourceCard : ""}`}
                onClick={() => setSelectedSource("unlearned")}
              >
                <div className={styles.sourceCardTop}>
                  <div
                    className={`${styles.sourceIconBox} ${styles.iconOrange}`}
                  >
                    <FontAwesomeIcon icon={faClockRotateLeft} />
                  </div>
                  <span className={styles.sourceCountBadge}>0 từ</span>
                </div>
                <div className={styles.sourceInfo}>
                  <h3>Từ chưa nhớ</h3>
                  <p>Từ bạn thường chọn sai</p>
                </div>
              </div>

              {/* Nguồn 4: Tự chọn từ vựng */}
              <div
                className={`${styles.sourceCard} ${selectedSource === "custom" ? styles.selectedSourceCard : ""}`}
                onClick={() => setSelectedSource("custom")}
              >
                <div className={styles.sourceCardTop}>
                  <div
                    className={`${styles.sourceIconBox} ${styles.iconPurple}`}
                  >
                    <FontAwesomeIcon icon={faListCheck} />
                  </div>
                  <span className={styles.sourceCountBadge}>
                    {selectedCustomCount}/124 từ
                  </span>
                </div>
                <div className={styles.sourceInfo}>
                  <h3>Tự chọn từ vựng</h3>
                  <p>Chủ động chọn những từ bạn muốn học</p>
                </div>
              </div>
            </div>
          </div>

          {/* Phần 2: Số lượng từ (Chỉ hiện khi không phải tự chọn) */}
          {selectedSource !== "custom" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionHeading}>Số lượng từ</h2>
                <span className={styles.maxLimitLabel}>Tối đa 124 từ</span>
              </div>
              <div className={styles.numberOptions}>
                {[10, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    className={`${styles.numBtn} ${selectedCount === num ? styles.activeNumBtn : ""}`}
                    onClick={() => setSelectedCount(num)}
                  >
                    {num}
                  </button>
                ))}
                <button className={styles.customNumBtn}>
                  <FontAwesomeIcon icon={faPen} /> Tùy chỉnh
                </button>
              </div>
            </div>
          )}

          {/* Phần 3: Danh sách từ vựng (Hiện khi chọn "Tự chọn từ vựng") */}
          {selectedSource === "custom" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionHeading}>
                  Từ vựng trong phiên học
                </h2>
                <div className={styles.actionLinks}>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={styles.textLink}
                  >
                    Chọn tất cả
                  </button>
                  <span className={styles.dotSeparator}>•</span>
                  <button type="button" className={styles.textLink}>
                    Xem danh sách ↗
                  </button>
                </div>
              </div>

              {/* Ô tìm kiếm trong danh sách */}
              <div className={styles.searchBoxWrapper}>
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className={styles.searchIconInline}
                />
                <input
                  type="text"
                  placeholder="Tìm từ vựng trong danh sách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInputInline}
                />
              </div>

              {/* Lưới các từ vựng để chọn */}
              <div className={styles.wordsGrid}>
                {customWords.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.wordCheckboxCard} ${item.selected ? styles.wordCardSelected : ""}`}
                    onClick={() => handleToggleWordSelection(item.id)}
                  >
                    <div className={styles.wordCardContent}>
                      <span className={styles.cardWordTitle}>{item.word}</span>
                      <span className={styles.cardWordPronounce}>
                        {item.pronunciation}
                      </span>
                      <span className={styles.cardWordMeaning}>
                        {item.meaning}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => {}} // Đã xử lý ở div cha
                      className={styles.styledCheckbox}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Summary Sidebar cố định */}
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
                  {selectedSource === "custom" && "Tự chọn từ vựng"}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Số lượng</span>
                <span className={styles.summaryValue}>
                  {selectedSource === "custom"
                    ? `${selectedCustomCount} từ`
                    : `${selectedCount} từ`}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Thời gian dự kiến</span>
                <span className={styles.summaryValueTime}>
                  <FontAwesomeIcon icon={faClockRotateLeft} /> ~{" "}
                  {selectedSource === "custom"
                    ? Math.max(1, Math.round(selectedCustomCount * 0.25))
                    : Math.round(selectedCount * 0.25)}{" "}
                  phút
                </span>
              </div>
            </div>

            <button className={styles.startSessionBtn}>
              Bắt đầu học <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateStudySession;
