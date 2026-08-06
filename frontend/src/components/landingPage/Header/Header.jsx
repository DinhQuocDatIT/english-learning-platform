import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../common/Button/Button";
import styles from "./Header.module.css";
import Logo from "../../common/Logo/Logo";
import AuthStorage from "../../../services/AuthStorage";
const navbarLinks = [
  {
    href: "#hero",
    name: "Trang chủ",
  },
  {
    href: "#features",
    name: "Tính năng",
  },
  {
    href: "#aisection",
    name: "Trí tuệ nhân tạo",
  },
  {
    href: "#timeline",
    name: "Lộ trình",
  },
  {
    href: "#pricing",
    name: "Bảng giá",
  },
];
function Header() {
  const [isActive, setIsActive] = useState(navbarLinks[0].href);
  const isAuth = AuthStorage.isAuthenticated();
  return (
    <header className={styles.wrapper}>
      <Logo />

      <nav>
        <ul className={styles.nav}>
          {navbarLinks.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`${styles.navItem}  ${isActive === item.href ? styles.active : ""} `}
                onClick={() => setIsActive(item.href)}
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.actions}>
        {!isAuth && (
          <Link to={"/register"} className={styles.registerLink}>
            Đăng ký
          </Link>
        )}

        {isAuth ? (
          <Link to={"/dashboard"} className={styles.loginLink}>
            Bắt đầu học ngay
          </Link>
        ) : (
          <Link to={"/login"} className={styles.loginLink}>
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
