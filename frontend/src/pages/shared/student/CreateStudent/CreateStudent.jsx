import { useState } from "react";
import styles from "./CreateStudent.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUserPlus,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

import { Link, useNavigate } from "react-router-dom";
import studentService from "../../../../services/studentService";

import {
  isValidEmail,
  isValidFullName,
  isValidPassword,
  isValidGender,
  isValidBirthday,
} from "../../../../utils/validators";

import { toast } from "react-toastify";

function CreateStudent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "Nam",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      server: "",
    }));

    if (name === "password" && formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== formData.confirmPassword
            ? "Mật khẩu xác nhận không khớp"
            : "",
      }));
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== formData.password ? "Mật khẩu xác nhận không khớp" : "",
      }));
    }
  };

  const handleGenderChange = (gender) => {
    setFormData((prev) => ({
      ...prev,
      gender,
    }));

    setErrors((prev) => ({
      ...prev,
      gender: "",
    }));
  };

  const getInitials = (name) => {
    if (!name) return "HS";

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  const getMaxBirthDate = () => {
    const today = new Date();

    // Học sinh tối thiểu 6 tuổi
    today.setFullYear(today.getFullYear() - 6);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const validateForm = () => {
    const newErrors = {};

    const fullNameError = isValidFullName(formData.fullName);
    const emailError = isValidEmail(formData.email);
    const passwordError = isValidPassword(formData.password);
    const genderError = isValidGender(formData.gender);

    // Nếu học sinh yêu cầu độ tuổi tối thiểu 6
    const birthdayError = isValidBirthday(formData.dateOfBirth, 6);

    if (fullNameError) {
      newErrors.fullName = fullNameError;
    }

    if (emailError) {
      newErrors.email = emailError;
    }

    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (genderError) {
      newErrors.gender = genderError;
    }

    if (birthdayError) {
      newErrors.dateOfBirth = birthdayError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        registerUserRequest: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
        },
      };

      console.log("Dữ liệu tạo học sinh:", requestData);

      const response = await studentService.createStudent(requestData);

      console.log("Tạo học sinh thành công:", response);

      toast.success("Thêm học sinh thành công!");

      navigate("/dashboard/admin/students");
    } catch (error) {
      console.error("Lỗi khi thêm học sinh:", error);

      if (error.response) {
        const message = error.response.data?.message;

        setErrors({
          server: message || "Thêm học sinh thất bại!",
        });
      } else {
        setErrors({
          server: "Không thể kết nối đến server!",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/dashboard/admin/students" className={styles.breadcrumbLink}>
          Quản lý Học sinh
        </Link>

        <span className={styles.breadcrumbSeparator}>›</span>

        <span className={styles.breadcrumbCurrent}>Thêm mới</span>
      </div>

      {/* Title */}
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Thêm học sinh mới</h1>

        <p className={styles.subtitle}>
          Điền thông tin chi tiết bên dưới để tạo tài khoản học sinh mới trong
          hệ thống.
        </p>
      </div>

      {/* Form */}
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarCircle}>
              {getInitials(formData.fullName)}
            </div>

            <div className={styles.avatarInfo}>
              <h3 className={styles.avatarTitle}>Ảnh đại diện</h3>

              <p className={styles.avatarDesc}>
                Ảnh đại diện sẽ được tạo tự động dựa trên tên học sinh.
              </p>
            </div>
          </div>

          {/* Server Error */}
          {errors.server && (
            <div className={styles.errorBox}>{errors.server}</div>
          )}

          {/* Họ và tên */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Họ và tên <span className={styles.required}>*</span>
            </label>

            <input
              type="text"
              name="fullName"
              placeholder="Nhập họ và tên đầy đủ"
              value={formData.fullName}
              onChange={handleChange}
              className={`${styles.inputControl} ${
                errors.fullName ? styles.inputError : ""
              }`}
            />

            {errors.fullName && (
              <p className={styles.errorText}>{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>

            <div className={styles.inputIconWrapper}>
              <input
                type="email"
                name="email"
                placeholder="example@englishflow.ai"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.inputControlWithIcon} ${
                  errors.email ? styles.inputError : ""
                }`}
              />

              <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
            </div>

            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Mật khẩu <span className={styles.required}>*</span>
            </label>

            <div className={styles.inputIconWrapper}>
              <input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.inputControlWithIcon} ${
                  errors.password ? styles.inputError : ""
                }`}
              />

              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
            </div>

            {errors.password && (
              <p className={styles.errorText}>{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Xác nhận mật khẩu <span className={styles.required}>*</span>
            </label>

            <div className={styles.inputIconWrapper}>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${styles.inputControlWithIcon} ${
                  errors.confirmPassword ? styles.inputError : ""
                }`}
              />

              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
            </div>

            {errors.confirmPassword && (
              <p className={styles.errorText}>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Ngày sinh + giới tính */}
          <div className={styles.rowGroup}>
            {/* Ngày sinh */}
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>
                Ngày sinh <span className={styles.required}>*</span>
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={getMaxBirthDate()}
                className={`${styles.inputControl} ${
                  errors.dateOfBirth ? styles.inputError : ""
                }`}
              />

              {errors.dateOfBirth && (
                <p className={styles.errorText}>{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Giới tính */}
            <div className={styles.formGroupHalf}>
              <label className={styles.label}>
                Giới tính <span className={styles.required}>*</span>
              </label>

              <div className={styles.radioGroup}>
                {["Nam", "Nữ"].map((item) => (
                  <label
                    key={item}
                    className={styles.radioLabel}
                    onClick={() => handleGenderChange(item)}
                  >
                    <span
                      className={`${styles.radioCustom} ${
                        formData.gender === item ? styles.radioChecked : ""
                      }`}
                    >
                      {formData.gender === item && (
                        <span className={styles.radioInnerDot} />
                      )}
                    </span>

                    {item}
                  </label>
                ))}
              </div>

              {errors.gender && (
                <p className={styles.errorText}>{errors.gender}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.formActions}>
            <Link to="/dashboard/students" className={styles.cancelBtn}>
              Hủy
            </Link>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faUserPlus} />

              {loading ? "Đang xử lý..." : "Thêm học sinh"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStudent;
