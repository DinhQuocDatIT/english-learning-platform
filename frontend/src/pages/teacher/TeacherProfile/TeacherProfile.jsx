import React, { useEffect, useState } from "react";
import styles from "./TeacherProfile.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import UserService from "../../../services/UserService";
import { useLoading } from "../../../contexts/LoadingContext";
import { ROLE_LABELS } from "../../../constants/roles";
import {
  isValidBirthday,
  isValidGender,
  isValidEmail,
  isValidFullName,
  isValidPassword,
} from "../../../utils/validators";
function TeacherProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    role: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    gender: "",
    dateOfBirth: "",
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    gender: false,
    dateOfBirth: false,
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        showLoading();
        const response = await UserService.getProfile();
        const userData = response.data.data;

        if (userData) {
          setFormData({
            fullName: userData.fullName || userData.name || "",
            email: userData.email || "",
            gender: userData.gender || "",
            dateOfBirth: userData.dateOfBirth || "",
            role: userData.role || "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin cá nhân:", error);
      } finally {
        hideLoading();
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa lỗi ngay khi người dùng gõ/chọn lại
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (fieldName) => {
    const value = formData[fieldName];
    let error = "";

    switch (fieldName) {
      case "fullName":
        error = isValidFullName(value);
        break;
      case "email":
        error = isValidEmail(value);
        break;
      case "gender":
        error = isValidGender(value);
        break;
      case "dateOfBirth":
        error = isValidBirthday(value, 0);
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error === "";
  };

  // Hàm xử lý thay đổi input đổi mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Đánh dấu tất cả là đã chạm để hiện lỗi nếu để trống
    setTouched({
      fullName: true,
      email: true,
      gender: true,
      dateOfBirth: true,
    });

    const nameErr = isValidFullName(formData.fullName);
    const emailErr = isValidEmail(formData.email);
    const genderErr = isValidGender(formData.gender);
    const dobErr = isValidBirthday(formData.dateOfBirth, 0);

    setErrors({
      fullName: nameErr,
      email: emailErr,
      gender: genderErr,
      dateOfBirth: dobErr,
    });

    if (nameErr || emailErr || genderErr || dobErr) {
      return;
    }

    try {
      showLoading();
      await UserService.updateProfile(formData);
      alert("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert(
        error.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại.",
      );
    } finally {
      hideLoading();
    }
  };

  // Hàm xử lý gửi yêu cầu đổi mật khẩu
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    const oldPassErr = !passwordData.oldPassword
      ? "Vui lòng nhập mật khẩu hiện tại"
      : "";
    const newPassErr = isValidPassword(passwordData.newPassword);
    let confirmPassErr = "";

    if (!passwordData.confirmPassword) {
      confirmPassErr = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      confirmPassErr = "Mật khẩu xác nhận không khớp";
    }

    setPasswordErrors({
      oldPassword: oldPassErr,
      newPassword: newPassErr,
      confirmPassword: confirmPassErr,
    });

    if (oldPassErr || newPassErr || confirmPassErr) {
      return;
    }

    try {
      showLoading();
      await UserService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      alert("Đổi mật khẩu thành công!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      alert(
        error.response?.data?.message ||
          "Đổi mật khẩu thất bại, vui lòng kiểm tra lại mật khẩu cũ.",
      );
    } finally {
      hideLoading();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Thông tin Cá nhân</h1>
        <p className={styles.subtitle}>
          Quản lý hồ sơ và bảo mật tài khoản của bạn.
        </p>
      </div>

      <div className={styles.container}>
        {/* Cột trái: Thông tin cá nhân */}
        <div className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarContainer}>
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.fullName || "DuyDat"}`}
                alt="Avatar"
                className={styles.avatar}
              />
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.name}>{formData.fullName}</h2>
              <span className={styles.badge}>{ROLE_LABELS[formData.role]}</span>
            </div>
            {!isEditing && (
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                <FontAwesomeIcon icon={faEdit} />
                Chỉnh sửa
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className={styles.gridInfo}>
              <div className={styles.infoGroup}>
                <span className={styles.label}>HỌ VÀ TÊN</span>
                <span className={styles.value}>{formData.fullName}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>EMAIL</span>
                <span className={styles.value}>{formData.email}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>GIỚI TÍNH</span>
                <span className={styles.value}>{formData.gender}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>NGÀY SINH</span>
                <span className={styles.value}>{formData.dateOfBirth}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className={styles.editForm} noValidate>
              <div className={styles.gridInfo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    className={`${styles.formInput} ${
                      touched.fullName && errors.fullName
                        ? styles.errorInput
                        : ""
                    }`}
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.fullName && errors.fullName && (
                    <span className={styles.errorMessage}>
                      {errors.fullName}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    name="email"
                    className={`${styles.formInput} ${
                      touched.email && errors.email ? styles.errorInput : ""
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.email && errors.email && (
                    <span className={styles.errorMessage}>{errors.email}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Giới tính</label>
                  <select
                    name="gender"
                    className={`${styles.formInput} ${
                      touched.gender && errors.gender ? styles.errorInput : ""
                    }`}
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                  {touched.gender && errors.gender && (
                    <span className={styles.errorMessage}>{errors.gender}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className={`${styles.formInput} ${
                      touched.dateOfBirth && errors.dateOfBirth
                        ? styles.errorInput
                        : ""
                    }`}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.dateOfBirth && errors.dateOfBirth && (
                    <span className={styles.errorMessage}>
                      {errors.dateOfBirth}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </button>
                <button type="submit" className={styles.submitButton}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Cột phải: Đổi mật khẩu */}
        <div className={styles.card}>
          <form onSubmit={handleChangePasswordSubmit} noValidate>
            <div className={styles.securityHeader}>
              <svg
                className={styles.lockIcon}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h2 className={styles.cardTitle}>Đổi mật khẩu</h2>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mật khẩu hiện tại</label>
              <input
                type="password"
                name="oldPassword"
                className={`${styles.formInput} ${
                  passwordErrors.oldPassword ? styles.errorInput : ""
                }`}
                placeholder="••••••••"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
              />
              {passwordErrors.oldPassword && (
                <span className={styles.errorMessage}>
                  {passwordErrors.oldPassword}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                className={`${styles.formInput} ${
                  passwordErrors.newPassword ? styles.errorInput : ""
                }`}
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              {passwordErrors.newPassword && (
                <span className={styles.errorMessage}>
                  {passwordErrors.newPassword}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                className={`${styles.formInput} ${
                  passwordErrors.confirmPassword ? styles.errorInput : ""
                }`}
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
              {passwordErrors.confirmPassword && (
                <span className={styles.errorMessage}>
                  {passwordErrors.confirmPassword}
                </span>
              )}
            </div>

            <button type="submit" className={styles.submitButton}>
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default TeacherProfile;
