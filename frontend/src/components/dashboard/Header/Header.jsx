import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBars, 
  faMagnifyingGlass, 
  faBell, 
  faChevronDown 
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Header.module.css";

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  return (
    <header className={`${styles.header} ${!isSidebarOpen ? styles.expanded : ""}`}>
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
        <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
        <input type="text" placeholder="Tìm bài học, từ vựng..." />
      </div>

      <div className={styles.right}>
        {/* Notifications */}
        <div className={styles.notificationBtn} aria-label="Thông báo">
          <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />
          <span className={styles.badge}></span>
        </div>
        
        {/* User Profile */}
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=DuyDat" alt="Avatar" />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Duy Đạt</span>
            <span className={styles.userRole}>Học viên</span>
          </div>
          <FontAwesomeIcon icon={faChevronDown} className={styles.dropdownIcon} />
        </div>
      </div>
    </header>
  );
};

export default Header;
