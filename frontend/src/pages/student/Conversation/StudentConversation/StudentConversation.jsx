import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faRobot,
  faBars,
  faSpinner,
  faTimes,
  faCheck,
  faTableColumns,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import conversationService from "../../../../services/conversationService";
import studentMembershipService from "../../../../services/studentMembershipService";
import { useLoading } from "../../../../contexts/LoadingContext";
import Loading from "../../../../components/common/Loading/Loading";
import {
  CONVERSATION_LEVELS,
  getLevelDisplay,
} from "../../../../constants/conversationLevelConstants";
import StudentConversationChat from "../StudentConversationChat/StudentConversationChat";
import styles from "./StudentConversation.module.css";

function StudentConversation() {
  const { conversationId: routeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get("id");

  const { showLoading, hideLoading } = useLoading();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMembership, setHasMembership] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(
    routeId || queryId || null,
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modal tạo mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("BEGINNER");
  const [creating, setCreating] = useState(false);

  // Load danh sách ban đầu
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Đồng bộ selectedConversationId khi URL thay đổi
  useEffect(() => {
    const targetId = routeId || searchParams.get("id");
    if (targetId && targetId !== selectedConversationId) {
      setSelectedConversationId(targetId);
    }
  }, [routeId, searchParams]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      showLoading();

      const [membershipResponse, historyResponse] = await Promise.allSettled([
        studentMembershipService.getCurrentMembership(),
        conversationService.getConversationHistory(0, 50),
      ]);

      const membershipData =
        membershipResponse.status === "fulfilled"
          ? membershipResponse.value?.data?.data
          : null;
      setHasMembership(!!membershipData);

      const historyData =
        historyResponse.status === "fulfilled"
          ? historyResponse.value?.data?.data?.content || []
          : [];
      setHistory(historyData);

      // Nếu chưa có ID nào được chọn, tự động chọn cuộc hội thoại đầu tiên
      const currentSelected = routeId || searchParams.get("id");
      if (!currentSelected && historyData.length > 0) {
        const firstId = String(historyData[0].id);
        setSelectedConversationId(firstId);
        setSearchParams({ id: firstId }, { replace: true });
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu.");
      setHistory([]);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  // Chọn cuộc hội thoại
  const handleSelectConversation = (id) => {
    const idStr = String(id);
    setSelectedConversationId(idStr);
    setSearchParams({ id: idStr });
  };

  // Mở modal tạo cuộc trò chuyện
  const handleOpenCreateModal = () => {
    if (!hasMembership) {
      toast.warning(
        "Chức năng Chat AI yêu cầu gói Premium. Vui lòng đăng ký để sử dụng!",
        { position: "top-center", autoClose: 5000 },
      );
      return;
    }
    setShowCreateModal(true);
  };

  // Xác nhận tạo cuộc trò chuyện
  const handleCreateConversation = async () => {
    try {
      setCreating(true);
      const response = await conversationService.createConversation({
        level: selectedLevel,
      });
      const newConv = response?.data?.data;
      const newId = String(newConv?.id);

      toast.success("Tạo cuộc hội thoại thành công!");

      // Thêm vào đầu danh sách history
      setHistory((prev) => [
        {
          id: newConv.id,
          level: newConv.level || selectedLevel,
          status: newConv.status || "ACTIVE",
          messageCount: 1,
          createdAt: newConv.createdAt || new Date().toISOString(),
          lastMessage: newConv.lastMessage || "",
        },
        ...prev,
      ]);

      // Chọn ngay cuộc hội thoại mới
      setSelectedConversationId(newId);
      setSearchParams({ id: newId });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Lỗi tạo cuộc hội thoại:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo cuộc hội thoại.",
      );
    } finally {
      setCreating(false);
    }
  };

  // Callback khi có tin nhắn mới gửi từ chat
  const handleConversationUpdated = ({
    conversationId,
    lastMessage,
    messageCount,
  }) => {
    setHistory((prev) =>
      prev.map((item) => {
        if (String(item.id) === String(conversationId)) {
          return {
            ...item,
            lastMessage: lastMessage || item.lastMessage,
            messageCount: messageCount || item.messageCount,
          };
        }
        return item;
      }),
    );
  };

  // Lọc danh sách hội thoại theo từ khóa tìm kiếm
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter((item) => {
      const level = getLevelDisplay(item.level)?.toLowerCase() || "";
      const lastMsg = (item.lastMessage || "").toLowerCase();
      return level.includes(q) || lastMsg.includes(q);
    });
  }, [history, searchQuery]);

  if (loading) {
    return <Loading size="large" text="Đang tải English Buddy AI..." />;
  }

  return (
    <div className={styles.appWindowWrapper}>
      {/* ================= MAIN 2-COLUMN LAYOUT ================= */}
      <div className={styles.appBody}>
        {/* ================= LEFT COLUMN: SIDEBAR ================= */}
        <aside
          className={`${styles.sidebar} ${
            isSidebarCollapsed ? styles.sidebarCollapsed : ""
          }`}
        >
          {/* Brand Header */}
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarBrand}>
              <div className={styles.sidebarLogoSquare}>
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <div className={styles.sidebarBrandMeta}>
                <h2 className={styles.sidebarBrandTitle}>English Buddy</h2>
                <span className={styles.sidebarBrandSubtitle}>
                  AI Conversation
                </span>
              </div>
            </div>

            <button
              className={styles.sidebarToggleBtn}
              onClick={() => setIsSidebarCollapsed(true)}
              title="Thu gọn danh sách"
            >
              <FontAwesomeIcon icon={faTableColumns} />
            </button>
          </div>

          {/* Nút Tạo cuộc trò chuyện mới */}
          <button
            type="button"
            className={styles.newChatBtn}
            onClick={handleOpenCreateModal}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Cuộc trò chuyện mới</span>
          </button>

          {/* Ô Tìm kiếm */}
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm kiếm hội thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tiêu đề mục Lịch sử */}
          <div className={styles.historySectionTitle}>LỊCH SỬ HỘI THOẠI</div>

          {/* Danh sách hội thoại */}
          <div className={styles.conversationList}>
            {filteredHistory.length === 0 ? (
              <div className={styles.listEmptyState}>
                {searchQuery
                  ? "Không tìm thấy cuộc hội thoại nào."
                  : "Chưa có cuộc trò chuyện nào."}
              </div>
            ) : (
              filteredHistory.map((item) => {
                const isSelected =
                  String(item.id) === String(selectedConversationId);
                const levelText = getLevelDisplay(item.level) || item.level;
                const msgCount = item.messageCount || 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.conversationItem} ${
                      isSelected ? styles.conversationItemActive : ""
                    }`}
                    onClick={() => handleSelectConversation(item.id)}
                  >
                    <div className={styles.itemMeta}>
                      <span className={styles.itemLevel}>{levelText}</span>
                      <span className={styles.itemSubtitle}>
                        {msgCount} tin nhắn
                      </span>
                    </div>

                    {isSelected && <span className={styles.itemActiveDot} />}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ================= RIGHT COLUMN: CHAT AREA ================= */}
        <section className={styles.chatArea}>
          {/* Nút mở lại sidebar nếu bị thu gọn */}
          {isSidebarCollapsed && (
            <button
              className={styles.expandSidebarBtn}
              onClick={() => setIsSidebarCollapsed(false)}
              title="Mở danh sách hội thoại"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}

          {/* Nhúng StudentConversationChat làm component */}
          <StudentConversationChat
            conversationId={selectedConversationId}
            onConversationUpdated={handleConversationUpdated}
            onNewConversation={handleOpenCreateModal}
          />
        </section>
      </div>

      {/* ================= MODAL CHỌN TRÌNH ĐỘ (CREATE NEW) ================= */}
      {showCreateModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => !creating && setShowCreateModal(false)}
        >
          <div
            className={styles.modalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalHeaderIcon}>
                  <FontAwesomeIcon icon={faRobot} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>
                    Bắt đầu cuộc trò chuyện mới
                  </h3>
                  <p className={styles.modalSubtitle}>
                    Chọn trình độ để AI điều chỉnh từ vựng & tốc độ phù hợp
                  </p>
                </div>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => !creating && setShowCreateModal(false)}
                disabled={creating}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <span className={styles.modalSectionLabel}>
                Trình độ tiếng Anh của bạn:
              </span>

              <div className={styles.levelOptionsList}>
                {CONVERSATION_LEVELS.map((level) => {
                  const isSelected = selectedLevel === level.value;
                  return (
                    <div
                      key={level.value}
                      className={`${styles.levelOptionCard} ${
                        isSelected ? styles.levelOptionCardActive : ""
                      }`}
                      onClick={() => setSelectedLevel(level.value)}
                    >
                      <div className={styles.levelOptionInfo}>
                        <div className={styles.levelOptionTitleRow}>
                          <span
                            className={styles.levelOptionDot}
                            style={{ backgroundColor: level.color }}
                          />
                          <span className={styles.levelOptionTitle}>
                            {level.label}
                          </span>
                        </div>
                        <span className={styles.levelOptionDesc}>
                          {level.description}
                        </span>
                      </div>

                      <div className={styles.levelOptionRadio}>
                        {isSelected && (
                          <div className={styles.levelOptionRadioInner} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => !creating && setShowCreateModal(false)}
                disabled={creating}
              >
                Hủy bỏ
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleCreateConversation}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Đang khởi tạo...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Bắt đầu trò chuyện</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentConversation;
