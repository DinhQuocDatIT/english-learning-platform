import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMagnifyingGlass,
  faBell,
  faChevronDown,
  faUser,
  faGear,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Header.module.css";
import AuthStorage from "../../../services/AuthStorage";

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = () => {
    AuthStorage.removeAuth();
    window.location.href = "/";
  };
  return (
    <header
      className={`${styles.header} ${!isSidebarOpen ? styles.expanded : ""}`}
    >
      <div className={styles.left}>
        <button
          className={styles.toggleBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <FontAwesomeIcon icon={faBars} className={styles.toggleIcon} />
        </button>
      </div>

      <div className={styles.searchBar}>
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className={styles.searchIcon}
        />
        <input type="text" placeholder="Tìm bài học, từ vựng..." />
      </div>

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
            <span className={styles.userName}>Duy Đạt</span>
            <span className={styles.userRole}>Học viên</span>
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
