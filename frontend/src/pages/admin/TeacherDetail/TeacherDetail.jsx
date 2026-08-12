import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./TeacherDetail.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faSave,
  faTimes,
  faEnvelope,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import teacherService from "../../../services/teacherService";

import {
  isValidEmail,
  isValidFullName,
  isValidGender,
  isValidBirthday,
} from "../../../utils/validators";

function TeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    server: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    gender: false,
    dateOfBirth: false,
  });

  // =========================
  // LẤY THÔNG TIN GIÁO VIÊN
  // GET /api/v1/admins/teachers/{id}
  // =========================

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);

        const response = await teacherService.getTeacherById(id);

        const teacher = response?.data?.data || response?.data;

        if (!teacher) {
          setErrors((prev) => ({
            ...prev,
            server: "Không tìm thấy thông tin giáo viên.",
          }));
          return;
        }

        setFormData({
          fullName: teacher.fullName || teacher.name || "",
          email: teacher.email || "",
          gender: teacher.gender || "",
          dateOfBirth: teacher.dateOfBirth || "",
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin giáo viên:", error);

        setErrors((prev) => ({
          ...prev,
          server:
            error.response?.data?.message ||
            "Không thể tải thông tin giáo viên.",
        }));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeacher();
    }
  }, [id]);

  // =========================
  // NGÀY SINH
  // Giáo viên >= 18 tuổi
  // =========================

  const getMaxBirthDate = () => {
    const today = new Date();

    today.setFullYear(today.getFullYear() - 18);

    return today.toISOString().split("T")[0];
  };

  // =========================
  // AVATAR
  // =========================

  const getInitials = (name) => {
    if (!name) return "GV";

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  // =========================
  // PROFILE FORM
  // =========================

  const handleProfileChange = (e) => {
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
  };

  const validateProfileField = (fieldName) => {
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
        error = isValidBirthday(value, 18);
        break;

      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    return error;
  };

  const handleProfileBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    validateProfileField(name);
  };

  const validateProfileForm = () => {
    const newErrors = {};

    const fullNameError = isValidFullName(formData.fullName);
    const emailError = isValidEmail(formData.email);
    const genderError = isValidGender(formData.gender);
    const birthdayError = isValidBirthday(formData.dateOfBirth, 18);

    if (fullNameError) {
      newErrors.fullName = fullNameError;
    }

    if (emailError) {
      newErrors.email = emailError;
    }

    if (genderError) {
      newErrors.gender = genderError;
    }

    if (birthdayError) {
      newErrors.dateOfBirth = birthdayError;
    }

    setErrors((prev) => ({
      ...prev,
      fullName: newErrors.fullName || "",
      email: newErrors.email || "",
      gender: newErrors.gender || "",
      dateOfBirth: newErrors.dateOfBirth || "",
    }));

    setTouched({
      fullName: true,
      email: true,
      gender: true,
      dateOfBirth: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // BẮT ĐẦU EDIT
  // =========================

  const handleEdit = () => {
    setIsEditing(true);

    setErrors({
      fullName: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      server: "",
    });

    setTouched({
      fullName: false,
      email: false,
      gender: false,
      dateOfBirth: false,
    });
  };

  // =========================
  // HỦY EDIT
  // =========================

  const handleCancelEdit = async () => {
    setIsEditing(false);

    setErrors({
      fullName: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      server: "",
    });

    setTouched({
      fullName: false,
      email: false,
      gender: false,
      dateOfBirth: false,
    });

    try {
      const response = await teacherService.getTeacherById(id);

      const teacher = response?.data?.data || response?.data;

      if (teacher) {
        setFormData({
          fullName: teacher.fullName || teacher.name || "",
          email: teacher.email || "",
          gender: teacher.gender || "",
          dateOfBirth: teacher.dateOfBirth || "",
        });
      }
    } catch (error) {
      console.error("Không thể load lại thông tin giáo viên:", error);
    }
  };

  // =========================
  // SAVE PROFILE
  // PUT /api/v1/admins/teachers/{id}
  // =========================

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    try {
      setSavingProfile(true);

      // ĐÚNG với UpdateUserProfileRequest bên Backend
      const requestData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      };

      await teacherService.updateTeacher(id, requestData);

      setIsEditing(false);

      setErrors({
        fullName: "",
        email: "",
        gender: "",
        dateOfBirth: "",
        server: "",
      });

      alert("Cập nhật thông tin giáo viên thành công!");

      // Load lại dữ liệu sau khi update
      const response = await teacherService.getTeacherById(id);
      const teacher = response?.data?.data || response?.data;

      if (teacher) {
        setFormData({
          fullName: teacher.fullName || teacher.name || "",
          email: teacher.email || "",
          gender: teacher.gender || "",
          dateOfBirth: teacher.dateOfBirth || "",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật giáo viên:", error);

      setErrors((prev) => ({
        ...prev,
        server:
          error.response?.data?.message ||
          "Cập nhật thông tin giáo viên thất bại.",
      }));
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>Đang tải thông tin giáo viên...</div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}

      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/dashboard/admin/teachers")}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Quay lại
        </button>

        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Thông tin giáo viên</h1>

            <p className={styles.subtitle}>
              Xem và quản lý thông tin tài khoản giáo viên.
            </p>
          </div>
        </div>
      </div>

      {/* SERVER ERROR */}

      {errors.server && <div className={styles.errorBox}>{errors.server}</div>}

      {/* CONTAINER */}

      <div className={styles.container}>
        {/* ==================================
            THÔNG TIN GIÁO VIÊN
        ================================== */}

        <div className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarCircle}>
              {getInitials(formData.fullName)}
            </div>

            <div className={styles.profileInfo}>
              <h2 className={styles.name}>
                {formData.fullName || "Chưa có tên"}
              </h2>

              <span className={styles.roleBadge}>Giáo viên</span>
            </div>

            {!isEditing && (
              <button
                type="button"
                className={styles.editButton}
                onClick={handleEdit}
              >
                <FontAwesomeIcon icon={faEdit} />
                Chỉnh sửa
              </button>
            )}
          </div>

          <form onSubmit={handleProfileSubmit} noValidate>
            <div className={styles.formGrid}>
              {/* HỌ TÊN */}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Họ và tên
                  <span className={styles.required}>*</span>
                </label>

                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    disabled={!isEditing}
                    onChange={handleProfileChange}
                    onBlur={handleProfileBlur}
                    className={`${styles.input} ${
                      touched.fullName && errors.fullName
                        ? styles.inputError
                        : ""
                    }`}
                  />
                </div>

                {touched.fullName && errors.fullName && (
                  <span className={styles.errorText}>{errors.fullName}</span>
                )}
              </div>

              {/* EMAIL */}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email
                  <span className={styles.required}>*</span>
                </label>

                <div className={styles.inputWrapper}>
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className={styles.inputIcon}
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={!isEditing}
                    onChange={handleProfileChange}
                    onBlur={handleProfileBlur}
                    className={`${styles.input} ${
                      touched.email && errors.email ? styles.inputError : ""
                    }`}
                  />
                </div>

                {touched.email && errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>

              {/* NGÀY SINH */}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Ngày sinh
                  <span className={styles.required}>*</span>
                </label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  max={getMaxBirthDate()}
                  disabled={!isEditing}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  className={`${styles.input} ${
                    touched.dateOfBirth && errors.dateOfBirth
                      ? styles.inputError
                      : ""
                  }`}
                />

                {touched.dateOfBirth && errors.dateOfBirth && (
                  <span className={styles.errorText}>{errors.dateOfBirth}</span>
                )}
              </div>

              {/* GIỚI TÍNH */}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Giới tính
                  <span className={styles.required}>*</span>
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  disabled={!isEditing}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  className={`${styles.input} ${
                    touched.gender && errors.gender ? styles.inputError : ""
                  }`}
                >
                  <option value="">Chọn giới tính</option>

                  <option value="Nam">Nam</option>

                  <option value="Nữ">Nữ</option>
                </select>

                {touched.gender && errors.gender && (
                  <span className={styles.errorText}>{errors.gender}</span>
                )}
              </div>
            </div>

            {/* BUTTON PROFILE */}

            {isEditing && (
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancelEdit}
                  disabled={savingProfile}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Hủy
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={savingProfile}
                >
                  <FontAwesomeIcon icon={faSave} />

                  {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherDetail;
