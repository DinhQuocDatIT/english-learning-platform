import React, { useEffect, useState } from "react";
import styles from "./MyVocabulary.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faRotate } from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import studentVocabularyService from "../../../services/studentVocabulary";
import { useLoading } from "../../../contexts/LoadingContext";

import VocabularyCard from "../../../components/vocabulary/MyVocabularyCard/MyVocabularyCard";

function MyVocabulary() {
  const navigate = useNavigate();

  const { showLoading, hideLoading } = useLoading();

  const [activeTab, setActiveTab] = useState("all");
  const [vocabularyItems, setVocabularyItems] = useState([]);

  const studentName = "Học viên";

  const fetchVocabularies = async (tab = activeTab) => {
    try {
      showLoading();

      let response;

      if (tab === "all") {
        response = await studentVocabularyService.getAll();
      }

      if (tab === "unlearned") {
        response = await studentVocabularyService.getByStatus("NOT_LEARNED");
      }

      if (tab === "learned") {
        response = await studentVocabularyService.getByStatus("LEARNED");
      }

      const data = response?.data?.data ?? [];

      setVocabularyItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lấy từ vựng cá nhân:", error);

      setVocabularyItems([]);

      toast.error(
        error?.response?.data?.message || "Không thể lấy danh sách từ vựng.",
      );
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchVocabularies("all");
  }, []);

  const handleChangeTab = (tab) => {
    setActiveTab(tab);

    fetchVocabularies(tab);
  };
  const handleChangeStatus = async (item) => {
    try {
      showLoading();

      const newStatus =
        item.learningStatus === "LEARNED" ? "NOT_LEARNED" : "LEARNED";

      await studentVocabularyService.updateStatus(item.id, newStatus);

      toast.success(
        newStatus === "LEARNED"
          ? `Đã đánh dấu "${item.word}" là đã học`
          : `Đã đánh dấu "${item.word}" là chưa học`,
      );

      await fetchVocabularies(activeTab);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);

      toast.error(
        error?.response?.data?.message || "Không thể cập nhật trạng thái.",
      );
    } finally {
      hideLoading();
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "unlearned":
        return "Không có từ chưa học";

      case "learned":
        return "Không có từ đã học";

      default:
        return "Bạn chưa lưu từ vựng nào";
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.pageTitle}>Kho từ vựng của {studentName}</h1>

          <p className={styles.subtitle}>
            Danh sách cá nhân bạn đã lưu{" "}
            <span className={styles.highlightCount}>
              {vocabularyItems.length} từ
            </span>
            .
          </p>
        </div>

        <button
          type="button"
          className={styles.createSessionBtn}
          onClick={() => navigate("/dashboard/student/create-study-session")}
        >
          <FontAwesomeIcon icon={faPlay} />
          Tạo phiên học
        </button>
      </div>

      

      <div className={styles.filterBar}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "all" ? styles.activeTab : ""
            }`}
            onClick={() => handleChangeTab("all")}
          >
            Tất cả
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "unlearned" ? styles.activeTab : ""
            }`}
            onClick={() => handleChangeTab("unlearned")}
          >
            Chưa học
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "learned" ? styles.activeTab : ""
            }`}
            onClick={() => handleChangeTab("learned")}
          >
            Đã học
          </button>
        </div>


        <button
          type="button"
          className={styles.refreshBtn}
          onClick={() => fetchVocabularies(activeTab)}
          title="Làm mới"
        >
          <FontAwesomeIcon icon={faRotate} />
        </button>
      </div>

      {vocabularyItems.length === 0 && (
        <div className={styles.emptyState}>
          <h3>{getEmptyMessage()}</h3>

          <p>Hãy tra cứu và lưu thêm từ vựng để bắt đầu học nhé.</p>
        </div>
      )}

      {vocabularyItems.length > 0 && (
        <div className={styles.gridContainer}>
          {vocabularyItems.map((item) => (
            <VocabularyCard
              key={item.id}
              vocabulary={item}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyVocabulary;
