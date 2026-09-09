import React, { useEffect, useState } from "react";
import styles from "./LevelManage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faLayerGroup,
  faLock,
  faUnlock,
  faPen,
  faTrash,
  faCircle,
  faBan,
  faSync,
  faSearch,
  faSort,
  faClock,
  faTag,
  faShieldAlt,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import AddLevelModal from "../../../../components/level/AddLevelModal/AddLevelModal";
import levelService from "../../../../services/levelService";
import { useLoading } from "../../../../contexts/LoadingContext";
import UpdateLevelModal from "../../../../components/level/UpdateLevelModal/UpdateLevelModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LevelManage() {
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [refreshing, setRefreshing] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const fetchLevels = async () => {
    try {
      showLoading();
      setError("");

      const response = await levelService.getAll();
      const data = response.data?.data ?? [];
      setLevels(data);
      applyFiltersAndSort(data, searchTerm, filterStatus, sortOrder);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách level:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách cấp độ.",
      );
    } finally {
      hideLoading();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLevels();
    toast.info("Đã làm mới danh sách!");
    setTimeout(() => setRefreshing(false), 500);
  };

  const applyFiltersAndSort = (data, search, status, sort) => {
    let result = [...data];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (level) =>
          level.name.toLowerCase().includes(searchLower) ||
          (level.description &&
            level.description.toLowerCase().includes(searchLower)),
      );
    }

    if (status === "active") {
      result = result.filter((level) => !isLocked(level));
    } else if (status === "locked") {
      result = result.filter((level) => isLocked(level));
    }

    result.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sort === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    setFilteredLevels(result);
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    applyFiltersAndSort(levels, searchTerm, filterStatus, sortOrder);
  }, [searchTerm, filterStatus, sortOrder, levels]);

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
      toast.success("Thêm cấp độ thành công!");
    } catch (err) {
      console.error("Lỗi khi thêm level:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể thêm cấp độ.";
      toast.error(errorMessage);
      throw err;
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = (level) => {
    if (isLocked(level)) {
      toast.warning(
        `Level "${level.name}" đã bị khóa! Vui lòng mở khóa trước khi sửa.`,
      );
      return;
    }
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

      toast.success("Cập nhật cấp độ thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật level:", err);

      const errorMessage =
        err.response?.data?.message || "Không thể cập nhật cấp độ.";
      toast.error(errorMessage);

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

      toast.success(`Khóa level "${level.name}" thành công!`);
    } catch (err) {
      console.error("Lỗi khi khóa level:", err);

      const errorMessage =
        err.response?.data?.message || "Không thể khóa level.";
      setError(errorMessage);
      toast.error(errorMessage);
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

      toast.success(`Mở khóa level "${level.name}" thành công!`);
    } catch (err) {
      console.error("Lỗi khi mở khóa level:", err);

      const errorMessage =
        err.response?.data?.message || "Không thể mở khóa level.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      hideLoading();
    }
  };

  const handleDelete = async (level) => {
    if (isLocked(level)) {
      toast.warning(
        `Level "${level.name}" đã bị khóa! Vui lòng mở khóa trước khi xóa.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn XÓA level "${level.name}" không?\nHành động này không thể hoàn tác!`,
    );

    if (!confirmed) return;

    try {
      showLoading();
      setError("");

      await levelService.delete(level.id);

      await fetchLevels();

      toast.success(`Xóa level "${level.name}" thành công!`);
    } catch (err) {
      console.error("Lỗi khi xóa level:", err);

      let errorMessage = err.response?.data?.message || "Không thể xóa level.";

      if (err.response?.status === 400) {
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (err.response?.status === 409) {
        errorMessage = "Không thể xóa level vì đang có dữ liệu tham chiếu!";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError(errorMessage);
        toast.error(`Xóa level thất bại: ${errorMessage}`);
      }
    } finally {
      hideLoading();
    }
  };

  const isLocked = (level) => {
    return level.deletedAt !== null && level.deletedAt !== undefined;
  };

  const getStatusCount = () => {
    const active = levels.filter((l) => !isLocked(l)).length;
    const locked = levels.filter((l) => isLocked(l)).length;
    return { total: levels.length, active, locked };
  };

  const statusCount = getStatusCount();

  return (
    <div className={styles.wrapper}>
      {/* Hero Banner */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>
            <FontAwesomeIcon icon={faLayerGroup} />
            <span>Quản lý Cấp độ</span>
          </div>
          <h1 className={styles.heroTitle}>
            Quản lý hệ thống cấp độ tiếng Anh
          </h1>
          <p className={styles.heroSubtitle}>
            Tạo mới, chỉnh sửa, khóa/mở khóa và xóa các cấp độ học tập. Mỗi cấp
            độ đại diện cho một trình độ tiếng Anh theo chuẩn CEFR.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.heroCreateBtn} onClick={handleCreate}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Thêm cấp độ mới</span>
            </button>
            <div className={styles.heroBadges}>
              <span className={styles.heroBadgeItem}>
                <FontAwesomeIcon icon={faCheckCircle} /> {statusCount.active}{" "}
                đang hoạt động
              </span>
              <span className={styles.heroBadgeItem}>
                <FontAwesomeIcon icon={faLock} /> {statusCount.locked} đã khóa
              </span>
            </div>
          </div>
        </div>

        <div className={styles.heroIllustration}>
          <div className={styles.heroFloatingCard}>
            <div className={styles.floatingHeader}>
              <div className={styles.floatingAvatar}>
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              <div>
                <h4>Hệ thống cấp độ</h4>
                <p>Tổng cộng {statusCount.total} cấp độ</p>
              </div>
            </div>
            <div className={styles.floatingStats}>
              <div className={styles.floatingStatItem}>
                <FontAwesomeIcon icon={faCircle} className={styles.activeDot} />
                <span>Đang hoạt động: {statusCount.active}</span>
              </div>
              <div className={styles.floatingStatItem}>
                <FontAwesomeIcon icon={faBan} className={styles.lockedDot} />
                <span>Đã khóa: {statusCount.locked}</span>
              </div>
            </div>
            <div className={styles.floatingFooter}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Quản lý linh hoạt, bảo mật cao</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}

      {/* Filter & Search Section */}
      <section className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm cấp độ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterControls}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>
          <button
            type="button"
            className={styles.sortBtn}
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <FontAwesomeIcon icon={faSort} />
            <span>{sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
          </button>
          <button
            type="button"
            className={`${styles.refreshBtn} ${refreshing ? styles.refreshing : ""}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faSync} spin={refreshing} />
          </button>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <FontAwesomeIcon icon={faTimesCircle} />
          <span>{error}</span>
        </div>
      )}

      {/* Level Grid */}
      {!error && filteredLevels.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <FontAwesomeIcon icon={faLayerGroup} />
          </div>
          <h3>Chưa có cấp độ nào</h3>
          <p>
            Bắt đầu bằng cách tạo cấp độ đầu tiên cho hệ thống. Mỗi cấp độ sẽ có
            tên, mô tả và màu sắc riêng.
          </p>
          <button className={styles.emptyStartBtn} onClick={handleCreate}>
            <FontAwesomeIcon icon={faPlus} />
            Tạo cấp độ đầu tiên
          </button>
        </div>
      )}

      {!error && filteredLevels.length > 0 && (
        <div className={styles.levelGrid}>
          {filteredLevels.map((level) => {
            const locked = isLocked(level);

            return (
              <div
                key={level.id}
                className={`${styles.levelCard} ${locked ? styles.cardLocked : styles.cardActive}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTopicBadge}>
                    <span
                      className={styles.topicIconBox}
                      style={{
                        background: `${level.color}20`,
                        color: level.color,
                      }}
                    >
                      <FontAwesomeIcon icon={faTag} />
                    </span>
                    <span className={styles.topicName}>{level.name}</span>
                  </div>

                  <span
                    className={`${styles.statusPill} ${
                      locked ? styles.statusLocked : styles.statusActive
                    }`}
                  >
                    <FontAwesomeIcon icon={locked ? faBan : faCircle} />
                    <span>{locked ? "Đã khóa" : "Hoạt động"}</span>
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.levelDescription}>
                    {level.description || "Chưa có mô tả cho cấp độ này."}
                  </p>
                </div>

                <div className={styles.cardMetaRow}>
                  <span className={styles.levelId}>
                    <FontAwesomeIcon icon={faTag} />
                    ID: {level.id}
                  </span>
                  <span className={styles.cardDate}>
                    <FontAwesomeIcon icon={faClock} />
                    {locked
                      ? `Đã khóa ${new Date(level.deletedAt).toLocaleDateString("vi-VN")}`
                      : level.createdAt
                        ? `Tạo ${new Date(level.createdAt).toLocaleDateString("vi-VN")}`
                        : ""}
                  </span>
                </div>

                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => handleEdit(level)}
                    disabled={locked}
                  >
                    <FontAwesomeIcon icon={faPen} />
                    Sửa
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(level)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Xóa
                  </button>
                  {locked ? (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.unlockBtn}`}
                      onClick={() => handleUnlock(level)}
                    >
                      <FontAwesomeIcon icon={faUnlock} />
                      Mở khóa
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.lockBtn}`}
                      onClick={() => handleLock(level)}
                    >
                      <FontAwesomeIcon icon={faLock} />
                      Khóa
                    </button>
                  )}
                </div>

                {/* Bỏ overlay này đi vì đã có status badge rồi */}
                {/* {locked && (
    <div className={styles.lockedOverlay}>
      <FontAwesomeIcon icon={faLock} />
      <span>Đã khóa</span>
    </div>
  )} */}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
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
