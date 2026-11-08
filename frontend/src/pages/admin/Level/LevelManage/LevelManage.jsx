import { useEffect, useState, useMemo } from "react";
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

  const isLocked = (level) => {
    return level.deletedAt !== null && level.deletedAt !== undefined;
  };

  const fetchLevels = async () => {
    try {
      showLoading();
      setError("");

      const response = await levelService.getAll();
      const data = response.data?.data ?? [];
      setLevels(data);
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
    let isMounted = true;

    const loadData = async () => {
      try {
        showLoading();

        const response = await levelService.getAll();
        const data = response.data?.data ?? [];

        if (isMounted) {
          setLevels(data);
          setError("");
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách level:", err);
        if (isMounted) {
          setError(
            err.response?.data?.message || "Không thể tải danh sách cấp độ.",
          );
        }
      } finally {
        hideLoading();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lọc + sắp xếp bằng useMemo thay vì state riêng
  const filteredLevels = useMemo(() => {
    let result = [...levels];

    // Tìm kiếm
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (level) =>
          level.name.toLowerCase().includes(q) ||
          (level.description && level.description.toLowerCase().includes(q)),
      );
    }

    // Lọc trạng thái
    if (filterStatus === "active") {
      result = result.filter((level) => !isLocked(level));
    } else if (filterStatus === "locked") {
      result = result.filter((level) => isLocked(level));
    }

    // Sắp xếp
    result.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    return result;
  }, [levels, searchTerm, filterStatus, sortOrder]);

  // Thống kê
  const stats = useMemo(() => {
    const active = levels.filter((l) => !isLocked(l)).length;
    const locked = levels.filter((l) => isLocked(l)).length;
    return { total: levels.length, active, locked };
  }, [levels]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLevels();
    toast.info("Đã làm mới danh sách!");
    setTimeout(() => setRefreshing(false), 500);
  };

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

  return (
    <div className={styles.wrapper}>
      {/* Page Header — compact */}
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
        
         
        </div>
        <div className={styles.headerRight}>
          <button className={styles.createBtn} onClick={handleCreate}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Thêm cấp độ</span>
          </button>
        </div>
      </header>

      {/* Stats chips */}
      <div className={styles.statsRow}>
        <span className={`${styles.statChip} ${styles.statChipTotal}`}>
          <FontAwesomeIcon icon={faLayerGroup} />
          Tổng cộng: {stats.total}
        </span>
        <span className={`${styles.statChip} ${styles.statChipActive}`}>
          <FontAwesomeIcon icon={faCircle} />
          Hoạt động: {stats.active}
        </span>
        <span className={`${styles.statChip} ${styles.statChipLocked}`}>
          <FontAwesomeIcon icon={faLock} />
          Đã khóa: {stats.locked}
        </span>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
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
          <span>{sortOrder === "asc" ? "A → Z" : "Z → A"}</span>
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

      {/* Error */}
      {error && (
        <div className={styles.errorMessage}>
          <FontAwesomeIcon icon={faTimesCircle} />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!error && filteredLevels.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <FontAwesomeIcon icon={faLayerGroup} />
          </div>
          <h3>Chưa có cấp độ nào</h3>
          <p>
            Bắt đầu bằng cách tạo cấp độ đầu tiên. Mỗi cấp độ sẽ có tên, mô
            tả và màu sắc riêng.
          </p>
          <button className={styles.emptyStartBtn} onClick={handleCreate}>
            <FontAwesomeIcon icon={faPlus} />
            Tạo cấp độ đầu tiên
          </button>
        </div>
      )}

      {/* Level list / table */}
      {!error && filteredLevels.length > 0 && (
        <div className={styles.levelTable}>
          {filteredLevels.map((level) => {
            const locked = isLocked(level);

            return (
              <div
                key={level.id}
                className={`${styles.levelRow} ${locked ? styles.rowLocked : ""}`}
              >
                {/* Color dot */}
                <span
                  className={styles.levelColorDot}
                  style={{ backgroundColor: level.color, color: level.color }}
                />

                {/* Name + description */}
                <div className={styles.levelMainInfo}>
                  <span className={styles.levelName}>{level.name}</span>
                  {level.description && (
                    <span className={styles.levelDesc}>
                      {level.description}
                    </span>
                  )}
                </div>

                {/* Status */}
                <span
                  className={`${styles.statusBadge} ${locked ? styles.badgeLocked : styles.badgeActive}`}
                >
                  <FontAwesomeIcon icon={locked ? faBan : faCircle} />
                  {locked ? "Đã khóa" : "Hoạt động"}
                </span>

                {/* Date */}
                <span className={styles.levelDate}>
                  <FontAwesomeIcon icon={faClock} />
                  {locked
                    ? new Date(level.deletedAt).toLocaleDateString("vi-VN")
                    : level.createdAt
                      ? new Date(level.createdAt).toLocaleDateString("vi-VN")
                      : "—"}
                </span>

                {/* Actions */}
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                    onClick={() => handleEdit(level)}
                    disabled={locked}
                    title="Chỉnh sửa"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>

                  <span className={styles.actionDivider} />

                  {locked ? (
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnUnlock}`}
                      onClick={() => handleUnlock(level)}
                      title="Mở khóa"
                    >
                      <FontAwesomeIcon icon={faUnlock} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnLock}`}
                      onClick={() => handleLock(level)}
                      title="Khóa"
                    >
                      <FontAwesomeIcon icon={faLock} />
                    </button>
                  )}

                  <span className={styles.actionDivider} />

                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                    onClick={() => handleDelete(level)}
                    title="Xóa"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
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
