import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Register.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import authService from "../../../services/authService";
import { useLoading } from "../../../contexts/LoadingContext";

function Register() {
  const { showLoading, hideLoading } = useLoading();
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    birthday: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    gender: "",
    birthday: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    gender: false,
    birthday: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
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
    const value = formData[fieldName];
    let error = "";

    switch (fieldName) {
      case "fullName":
        if (!value || value.trim() === "") {
          error = "Vui lòng nhập họ và tên";
        } else if (value.trim().length < 2) {
          error = "Họ và tên phải có ít nhất 2 ký tự";
        }
        break;
      case "email":
        if (!value || value.trim() === "") {
          error = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Email không hợp lệ";
        }
        break;
      case "gender":
        if (!value || value === "") {
          error = "Vui lòng chọn giới tính";
        }
        break;
      case "birthday":
        if (!value) {
          error = "Vui lòng chọn ngày sinh";
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          if (age < 6) {
            error = "Bạn phải từ 6 tuổi trở lên để đăng ký";
          }
        }
        break;
      case "password":
        if (!value) {
          error = "Vui lòng nhập mật khẩu";
        } else if (value.length < 6) {
          error = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Vui lòng xác nhận mật khẩu";
        } else if (value !== formData.password) {
          error = "Mật khẩu xác nhận không khớp";
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
    const fields = [
      "fullName",
      "email",
      "gender",
      "birthday",
      "password",
      "confirmPassword",
    ];
    let isValid = true;

    // Mark all fields as touched
    const newTouched = {};
    fields.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate all fields
    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    // Special validation for password match
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Mật khẩu xác nhận không khớp",
      }));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear general error
    setErrors((prev) => ({
      ...prev,
      general: "",
    }));

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector(
        `[name="${Object.keys(errors).find((key) => errors[key] !== "")}"]`,
      );
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    const data = {
      registerUserRequest: {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        dateOfBirth: formData.birthday,
      },
    };

    try {
      showLoading();
      const res = await authService.register(data);
      console.log(res.data);
      alert("Đăng ký thành công");
      // Reset form or redirect here
    } catch (error) {
      console.log(error.response?.data || error.message);

      // Handle backend errors
      const errorData = error.response?.data;
      if (errorData) {
        // Check if error is about email
        if (errorData.message && errorData.message.includes("Email")) {
          setErrors((prev) => ({
            ...prev,
            email: errorData.message,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general: errorData.message || "Đã có lỗi xảy ra, vui lòng thử lại",
          }));
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

      <h2>Bắt đầu hành trình</h2>
      <p>Học tiếng Anh thông minh cùng trợ lý AI của bạn.</p>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* General Error */}
          {errors.general && (
            <div className={styles.errorGeneral}>{errors.general}</div>
          )}

          <div className={styles.group}>
            <label>Họ và tên</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.fullName && errors.fullName ? styles.errorInput : ""
              }
            />
            {touched.fullName && errors.fullName && (
              <span className={styles.errorMessage}>{errors.fullName}</span>
            )}
          </div>

          <div className={styles.group}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && errors.email ? styles.errorInput : ""}
            />
            {touched.email && errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          <div className={styles.group}>
            <label>Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.gender && errors.gender ? styles.errorInput : ""
              }
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            {touched.gender && errors.gender && (
              <span className={styles.errorMessage}>{errors.gender}</span>
            )}
          </div>

          <div className={styles.group}>
            <label>Ngày sinh</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.birthday && errors.birthday ? styles.errorInput : ""
              }
            />
            {touched.birthday && errors.birthday && (
              <span className={styles.errorMessage}>{errors.birthday}</span>
            )}
          </div>

          <div className={styles.group}>
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
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

          <div className={styles.group}>
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.confirmPassword && errors.confirmPassword
                  ? styles.errorInput
                  : ""
              }
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <span className={styles.errorMessage}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button className={styles.btn} type="submit">
            Tạo tài khoản
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>

        <div className={styles.policy}>
          Bằng việc tham gia, bạn đồng ý với
          <span> Điều khoản </span>&<span> Chính sách</span> <br />
          của chúng tôi.
        </div>
        <div className={styles.login}>
          Đã có tài khoản?
          <a href="/login"> Đăng nhập</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
