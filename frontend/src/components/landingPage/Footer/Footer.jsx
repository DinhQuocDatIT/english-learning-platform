import { faEarthAfrica } from "@fortawesome/free-solid-svg-icons";
import styles from "./Footer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReddit } from "@fortawesome/free-brands-svg-icons/faReddit";
import Logo from "../../common/Logo/Logo";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Cột 1: Thông tin thương hiệu */}
        <div className={styles.brandCol}>
          <Logo color="white" />
          <p className={styles.description}>
            Trao quyền cho công dân toàn cầu thông qua huấn luyện ngôn ngữ AI độ
            chính xác cao.
          </p>
          <div className={styles.socialIcons}>
            <button className={styles.iconBtn} aria-label="Globe">
              <FontAwesomeIcon icon={faEarthAfrica} />
            </button>
            <button className={styles.iconBtn} aria-label="Share">
              <FontAwesomeIcon icon={faReddit} />
            </button>
          </div>
        </div>
        {/* Cột 2: Sản phẩm */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Sản phẩm</h4>
          <ul className={styles.linkList}>
            <li>
              <a href="#" className={styles.link}>
                Khóa học
              </a>
            </li>
            <li>
              <a href="#" className={styles.link}>
                Bảng giá
              </a>
            </li>
            <li>
              <a href="#" className={styles.link}>
                Tính năng AI
              </a>
            </li>
          </ul>
        </div>
        {/* Cột 3: Cộng đồng */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Cộng đồng</h4>
          <ul className={styles.linkList}>
            <li>
              <a href="#" className={styles.link}>
                Câu chuyện thành công
              </a>
            </li>
            <li>
              <a href="#" className={styles.link}>
                Đại sứ
              </a>
            </li>
            <li>
              <a href="#" className={styles.link}>
                Nghề nghiệp
              </a>
            </li>
          </ul>
        </div>
        {/* Cột 4: Hỗ trợ */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Hỗ trợ</h4>
          <ul className={styles.linkList}>
            <li>
              <a href="#" className={styles.link}>
                Bảo mật
              </a>
            </li>
            <li>
              <a href="#" className={styles.link}>
                Điều khoản
              </a>
            </li>
            <li>
              <a href="#" className={styles.link}>
                Liên hệ
              </a>
            </li>
          </ul>
        </div>
      </div>
      <hr className={styles.divider} />
      <p className={styles.bottom}>© 2024 EnglishFlow AI. Bảo lưu mọi quyền.</p>
    </footer>
  );
}

export default Footer;
