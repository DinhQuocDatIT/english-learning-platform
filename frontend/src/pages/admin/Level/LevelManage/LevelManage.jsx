import React, { useEffect, useState } from "react";
import styles from "./LevelManage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faLayerGroup,
  faLock,
  faUnlock,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import AddLevelModal from "../../../../components/level/AddLevelModal/AddLevelModal";
import levelService from "../../../../services/levelService";
import { useLoading } from "../../../../contexts/LoadingContext";
import UpdateLevelModal from "../../../../components/level/UpdateLevelModal/UpdateLevelModal";
function LevelManage() {
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const fetchLevels = async () => {
    try {
      showLoading();
      setError("");

      const response = await levelService.getAll();

      setLevels(response.data?.data ?? []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách level:", err);

      setError(
        err.response?.data?.message || "Không thể tải danh sách cấp độ.",
      );
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const handleCreate = () => {
    setAddModalOpen(true);
  };
  const handleCreateLevel = async (data) => {
    try {
      setAddLoading(true);
      setError("");

      await levelService.create(data);

      setAddModalOpen(false);

      await fetchLevels();
    } catch (err) {
      console.error("Lỗi khi thêm level:", err);

      throw err;
    } finally {
      setAddLoading(false);
    }
  };
  const handleEdit = (level) => {
    setSelectedLevel(level);
    setUpdateModalOpen(true);
  };
  const handleUpdateLevel = async (data) => {
    try {
      setUpdateLoading(true);
      setError("");

      await levelService.update(selectedLevel.id, data);

      setUpdateModalOpen(false);
      setSelectedLevel(null);

      await fetchLevels();
    } catch (err) {
      console.error("Lỗi khi cập nhật level:", err);

      throw err;
    } finally {
      setUpdateLoading(false);
    }
  };
  const handleLock = async (level) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn khóa level "${level.name}" không?`,
    );

    if (!confirmed) return;

    try {
      showLoading();
      setError("");

      await levelService.lock(level.id);

      await fetchLevels();
    } catch (err) {
      console.error("Lỗi khi khóa level:", err);

      setError(err.response?.data?.message || "Không thể khóa level.");
    } finally {
      hideLoading();
    }
  };

  const handleUnlock = async (level) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn mở khóa level "${level.name}" không?`,
    );

    if (!confirmed) return;

    try {
      showLoading();
      setError("");

      await levelService.unlock(level.id);

      await fetchLevels();
    } catch (err) {
      console.error("Lỗi khi mở khóa level:", err);

      setError(err.response?.data?.message || "Không thể mở khóa level.");
    } finally {
      hideLoading();
    }
  };

  const isLocked = (level) => {
    return Boolean(level.deletedAt);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.pageTitle}>Quản lý Cấp độ</h1>

          <p className={styles.subtitle}>
            Quản lý các cấp độ tiếng Anh trong hệ thống.
          </p>
        </div>

        <button
          type="button"
          className={styles.addLevelBtn}
          onClick={handleCreate}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Thêm cấp độ</span>
        </button>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summaryIcon}>
          <FontAwesomeIcon icon={faLayerGroup} />
        </div>

        <div>
          <span className={styles.summaryLabel}>TỔNG CẤP ĐỘ</span>

          <div className={styles.summaryNumber}>{levels.length}</div>
        </div>
      </div>

      <div className={styles.sectionTitleArea}>
        <h2 className={styles.sectionTitle}>Danh sách cấp độ</h2>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {!error && levels.length === 0 && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faLayerGroup} />

          <p>Chưa có cấp độ nào.</p>

          <button
            type="button"
            className={styles.emptyAddBtn}
            onClick={handleCreate}
          >
            <FontAwesomeIcon icon={faPlus} />
            Thêm cấp độ
          </button>
        </div>
      )}

      {!error && levels.length > 0 && (
        <div className={styles.levelGrid}>
          {levels.map((level) => {
            const locked = isLocked(level);

            return (
              <div
                key={level.id}
                className={`${styles.levelCard} ${
                  locked ? styles.levelCardLocked : ""
                }`}
              >
                <div className={styles.levelCardHeader}>
                  <div className={styles.levelNumber}>{level.id}</div>

                  <span
                    className={`${styles.statusBadge} ${locked ? styles.statusLocked : styles.statusActive
                      }`}
                  >
                    <FontAwesomeIcon icon={locked ? faLock : faLayerGroup} />

                    {locked ? "Đã khóa" : "Hoạt động"}
                  </span>
                </div>

                <div className={styles.levelContent}>
                  <h3
                    className={styles.levelName}
                    style={{
                      background: `${level.color}30`,
                      color: level.color,
                    }}
                  >
                    {level.name}
                  </h3>

                  <p className={styles.levelDescription}>
                    {level.description || "Chưa có mô tả cho cấp độ này."}
                  </p>
                </div>

                <div className={styles.levelFooter}>
                  <span className={styles.createdAt}>
                    {level.createdAt
                      ? `Tạo ngày ${new Date(
                        level.createdAt,
                      ).toLocaleDateString("vi-VN")}`
                      : ""}
                  </span>
                </div>

                <div className={styles.actionButtonRow}>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => handleEdit(level)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                    Sửa
                  </button>

                  {locked ? (
                    <button
                      type="button"
                      className={`${styles.statusBtn} ${styles.unlockBtn}`}
                      onClick={() => handleUnlock(level)}
                    >
                      <FontAwesomeIcon icon={faUnlock} />
                      Mở khóa
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.statusBtn} ${styles.lockBtn}`}
                      onClick={() => handleLock(level)}
                    >
                      <FontAwesomeIcon icon={faLock} />
                      Khóa
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <AddLevelModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateLevel}
        loading={addLoading}
      />
      <UpdateLevelModal
        isOpen={updateModalOpen}
        level={selectedLevel}
        onClose={() => {
          if (updateLoading) return;

          setUpdateModalOpen(false);
          setSelectedLevel(null);
        }}
        onSubmit={handleUpdateLevel}
        loading={updateLoading}
      />
    </div>
  );
}

export default LevelManage;
