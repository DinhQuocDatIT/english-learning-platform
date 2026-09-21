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

  // Lấy role của user hiện tại
  const role = AuthStorage.getRole();

  // Chỉ STUDENT mới được hiện thanh tìm kiếm
  const isStudent = role?.toUpperCase() === "STUDENT";

  const handleLogout = () => {
    AuthStorage.removeAuth();
    window.location.href = "/";
  };

  // Đóng tìm kiếm khi click ra ngoài
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

      {/* SEARCH - Chỉ STUDENT mới hiện */}
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
        {/* Notifications */}
        <div className={styles.notificationBtn} aria-label="Thông báo">
          <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />

          <span className={styles.badge}></span>
        </div>

        {/* User Profile */}
        <div className={styles.userProfile} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.avatar}>
            <img
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=DuyDat"
              alt="Avatar"
            />
          </div>

          <div className={styles.userInfo}>
            {" "}
            <span className={styles.userName}> {userName} </span>{" "}
            <span className={styles.userRole}> {userRole} </span>{" "}
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
