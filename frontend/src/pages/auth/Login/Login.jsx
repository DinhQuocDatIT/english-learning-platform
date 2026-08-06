import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import authService from "../../../services/authService";
import { useLoading } from "../../../contexts/LoadingContext";
import AuthStorage from "../../../services/AuthStorage";

function Login() {
  const { showLoading, hideLoading } = useLoading();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name);
  };

  const validateField = (fieldName) => {
    let error = "";

    switch (fieldName) {
      case "email":
        if (!email || email.trim() === "") {
          error = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          error = "Email không hợp lệ";
        }
        break;
      case "password":
        if (!password) {
          error = "Vui lòng nhập mật khẩu";
        } else if (password.length < 6) {
          error = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    return error === "";
  };

  const validateForm = () => {
    const fields = ["email", "password"];
    let isValid = true;

    const newTouched = {};
    fields.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({
      ...prev,
      general: "",
    }));

    if (!validateForm()) {
      const firstErrorField = document.querySelector(
        `[name="${Object.keys(errors).find((key) => errors[key] !== "")}"]`,
      );
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    try {
      showLoading();
      const res = await authService.login({
        email,
        password,
      });
      const user = res.data.data.user;
      const token = res.data.data.token;
      AuthStorage.setToken(token);
      AuthStorage.setUser(user);
      alert("Đăng nhập thành công");
      window.location.href = "/dashboard";
    } catch (error) {
      console.log(error.response?.data || error.message);

      // Handle backend errors
      const errorData = error.response?.data;
      if (errorData) {
        if (errorData.message) {
          // Check if error is about email or password
          const message = errorData.message.toLowerCase();
          if (message.includes("email")) {
            setErrors((prev) => ({
              ...prev,
              email: errorData.message,
            }));
          } else if (
            message.includes("password") ||
            message.includes("mật khẩu")
          ) {
            setErrors((prev) => ({
              ...prev,
              password: errorData.message,
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              general:
                errorData.message || "Đăng nhập thất bại, vui lòng thử lại",
            }));
          }
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Không thể kết nối đến máy chủ, vui lòng thử lại",
        }));
      }
    } finally {
      hideLoading();
    }
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

        <form onSubmit={handleSubmit} noValidate>
          {/* General Error */}
          {errors.general && (
            <div className={styles.errorGeneral}>{errors.general}</div>
          )}

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? styles.errorInput : ""}
            />
            {touched.email && errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.row}>
              <label>Mật khẩu</label>
              <a href="/forgot-password">Quên mật khẩu?</a>
            </div>
            <input
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.password && errors.password ? styles.errorInput : ""
              }
            />
            {touched.password && errors.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}
          </div>

          <div className={styles.remember}>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Ghi nhớ đăng nhập</label>
          </div>

          <button type="submit" className={styles.loginBtn}>
            Đăng nhập <FontAwesomeIcon icon={faArrowRight} />
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
