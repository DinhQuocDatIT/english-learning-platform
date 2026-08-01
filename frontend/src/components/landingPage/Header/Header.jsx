import { useState } from "react";
import Button from "../../common/Button/Button";
import styles from "./Header.module.css";
import Logo from "../../common/Logo/Logo";
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
        <a href="#" className={styles.loginLink}>
          Đăng nhập
        </a>
        <Button onClick={() => console.log("Clicked!")}>
          Bắt đầu học ngay
        </Button>
      </div>
    </header>
  );
}

export default Header;
