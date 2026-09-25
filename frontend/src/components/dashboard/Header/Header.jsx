import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMagnifyingGlass,
  faBell,
  faChevronDown,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./Header.module.css";
import AuthStorage from "../../../services/AuthStorage";
import VocabularySearchDropdown from "../../vocabulary/VocabularySearchDropdown/VocabularySearchDropdown";
import StreakBadge from "../../StreakBadge/StreakBadge";
import streakService from "../../../services/streakService"; // ✅

const roleLabels = {
  ADMIN: "Quản trị viên",
  TEACHER: "Giáo viên",
  STUDENT: "Học sinh",
};

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const user = AuthStorage.getUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showVocabularySearch, setShowVocabularySearch] = useState(false);
  const userName = user?.fullName || user?.name || "Người dùng";
  const userRole = roleLabels[user?.role?.toUpperCase()] || "Người dùng";
  const searchContainerRef = useRef(null);

  // ✅ Streak state
  const [currentStreak, setCurrentStreak] = useState(0);

  const role = AuthStorage.getRole();
  const isStudent = role?.toUpperCase() === "STUDENT";

  const handleLogout = () => {
    AuthStorage.removeAuth();
    window.location.href = "/";
  };

  // ✅ Load streak khi mount
  useEffect(() => {
    if (!isStudent) return;

    const fetchStreak = async () => {
      try {
        const res = await streakService.getMyStreak();
        const data = res?.data?.data;
        setCurrentStreak(data?.currentStreak || 0);
      } catch (err) {
        console.error("Lỗi lấy streak:", err);
      }
    };

    fetchStreak();

    // ✅ Listen event khi submit
    const handleStreakUpdate = (e) => {
      if (e.detail?.streak != null) {
        setCurrentStreak(e.detail.streak);
      }
    };

    window.addEventListener("streak-updated", handleStreakUpdate);

    return () => {
      window.removeEventListener("streak-updated", handleStreakUpdate);
    };
  }, [isStudent]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowVocabularySearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`${styles.header} ${!isSidebarOpen ? styles.expanded : ""}`}
    >
      {/* LEFT */}
      <div className={styles.left}>
        <button
          className={styles.toggleBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FontAwesomeIcon icon={faBars} className={styles.toggleIcon} />
        </button>
      </div>

      {/* SEARCH */}
      {isStudent && (
        <div className={styles.searchContainer} ref={searchContainerRef}>
          <div
            className={styles.searchBar}
            onClick={() => setShowVocabularySearch(true)}
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={styles.searchIcon}
            />
            <input
              type="text"
              placeholder="Tìm bài học, từ vựng..."
              onFocus={() => setShowVocabularySearch(true)}
              readOnly
            />
          </div>

          {showVocabularySearch && (
            <div className={styles.vocabularyDropdown}>
              <VocabularySearchDropdown />
            </div>
          )}
        </div>
      )}

      {/* RIGHT */}
      <div className={styles.right}>
        {isStudent && <StreakBadge streak={currentStreak} />}

        <div className={styles.notificationBtn} aria-label="Thông báo">
          <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />
          <span className={styles.badge}></span>
        </div>

        <div className={styles.userProfile} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.avatar}>
            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=DuyDat"
              alt="Avatar"
            />
          </div>

          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{userRole}</span>
          </div>

          <FontAwesomeIcon
            icon={faChevronDown}
            className={styles.dropdownIcon}
          />

          {isOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={handleLogout}>
                <FontAwesomeIcon icon={faRightFromBracket} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
