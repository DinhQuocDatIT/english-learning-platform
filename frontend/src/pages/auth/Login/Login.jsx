import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.back}>
        <Link to={"/"}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Quay lại trang chủ
        </Link>
      </div>

      <div className={styles.card}>
        <h2>Chào mừng trở lại</h2>

        <p>
          Tiếp tục hành trình chinh phục tiếng Anh
          <br />
          cùng AI
        </p>

        <form>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.row}>
              <label>Mật khẩu</label>

              <a href="/">Quên mật khẩu?</a>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.remember}>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Ghi nhớ đăng nhập</label>
          </div>

          <button type="submit" className={styles.loginBtn}>
            Đăng nhập  <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>

        <div className={styles.register}>
          Chưa có tài khoản?
          <a href="/register"> Đăng ký</a>
        </div>
      </div>

      <div className={styles.footer}></div>
    </div>
  );
}

export default Login;
