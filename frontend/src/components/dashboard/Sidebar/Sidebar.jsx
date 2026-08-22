import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faBookOpen,
  faBook,
  faPenToSquare,
  faGear,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Sidebar.module.css";
import Logo from "../../common/Logo/Logo";
import { sidebarMenus } from "../../../configs/sidebarMenu";
import { ROLES } from "../../../constants/roles";

const Sidebar = ({ isOpen }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;
  const menus = sidebarMenus[role] || [];
  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ""}`}>
      <div className={styles.topSection}>
        <div className={styles.logoContainer}>
          <Logo />
        </div>
      </div>

      <nav className={styles.nav}>
        {menus.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
            end={item.path === "/dashboard"}
          >
            <div className={styles.iconWrapper}>
              <FontAwesomeIcon icon={item.icon} className={styles.icon} />
            </div>
            <span className={styles.label}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {role === ROLES.STUDENT && (
        <div className={styles.bottomSection}>
          <NavLink
            to="/dashboard/student/student-membership"
            className={({ isActive }) =>
              `${styles.premiumCTA} ${isActive ? styles.premiumActive : ""} ${!isOpen ? styles.premiumCTAClosed : ""}`
            }
          >
            <div className={styles.premiumIconWrapper}>
              <FontAwesomeIcon icon={faCrown} />
            </div>
            {isOpen && (
              <div className={styles.premiumContent}>
                <span className={styles.premiumTitle}>Gói Thành Viên</span>
                <span className={styles.premiumSubtitle}>Nâng cấp Premium</span>
              </div>
            )}
          </NavLink>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
