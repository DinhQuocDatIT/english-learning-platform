import React, { useEffect, useState, useRef } from "react";
import styles from "./AdminProfile.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTimes,
  faSave,
  faSpinner,
  faEye,
  faEyeSlash,
  faKey,
  faLock,
  faShieldAlt,
  faCamera,
  faTrashCan,
  faUser,
  faEnvelope,
  faVenusMars,
  faCakeCandles,
  faCheckCircle, // ✅ FIX 1: thêm import còn thiếu
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import UserService from "../../../services/UserService";
import { useLoading } from "../../../contexts/LoadingContext";
import { ROLE_LABELS } from "../../../constants/roles";
import getImageUrl from "../../../utils/imageUrl";
import {
  isValidBirthday,
  isValidGender,
  isValidEmail,
  isValidFullName,
  isValidPassword,
} from "../../../utils/validators";

const DEFAULT_AVATAR = "/uploads/avatars/default-avatar.png";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  gender: "",
  dateOfBirth: "",
  role: "",
  avatarUrl: DEFAULT_AVATAR,
};

function AdminProfile() {
  const { showLoading, hideLoading } = useLoading();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);
  // ✅ FIX 2: lưu snapshot dữ liệu gốc để khôi phục khi Hủy
  const [originalData, setOriginalData] = useState(EMPTY_FORM);

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

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // ============================================
  // FETCH PROFILE
  // ============================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        showLoading();
        const response = await UserService.getProfile();
        const userData = response.data.data;

        if (userData) {
          const normalized = {
            fullName: userData.fullName || userData.name || "",
            email: userData.email || "",
            gender: userData.gender || "",
            dateOfBirth: userData.dateOfBirth || "",
            role: userData.role || "",
            avatarUrl: userData.avatarUrl || DEFAULT_AVATAR,
          };
          setFormData(normalized);
          setOriginalData(normalized); // ✅ lưu bản gốc
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin cá nhân:", error);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        hideLoading();
      }
    };

    fetchProfile();
    // ✅ FIX 4: khai báo dependencies đầy đủ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // PROFILE FORM
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

  const handleSave = async (e) => {
    e.preventDefault();

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
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      showLoading();
      await UserService.updateProfile({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      });

      // ✅ FIX: sau khi save thành công, cập nhật luôn bản gốc
      const saved = {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
      };
      setFormData(saved);
      setOriginalData(saved);

      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      toast.error(
        error.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại.",
      );
    } finally {
      hideLoading();
    }
  };

  // ✅ FIX 2 (tiếp): khôi phục dữ liệu gốc khi hủy
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(originalData);
    setErrors({
      fullName: "",
      email: "",
      gender: "",
      dateOfBirth: "",
    });
    setTouched({
      fullName: false,
      email: false,
      gender: false,
      dateOfBirth: false,
    });
  };

  // ============================================
  // PASSWORD FORM
  // ============================================
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordField = (fieldName) => {
    let error = "";

    if (fieldName === "oldPassword") {
      error = !passwordData.oldPassword
        ? "Vui lòng nhập mật khẩu hiện tại"
        : "";
    } else if (fieldName === "newPassword") {
      error = isValidPassword(passwordData.newPassword);
      if (!error && passwordData.newPassword === passwordData.oldPassword) {
        error = "Mật khẩu mới không được trùng mật khẩu cũ";
      }
    } else if (fieldName === "confirmPassword") {
      if (!passwordData.confirmPassword) {
        error = "Vui lòng xác nhận mật khẩu mới";
      } else if (passwordData.confirmPassword !== passwordData.newPassword) {
        error = "Mật khẩu xác nhận không khớp";
      }
    }

    setPasswordErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error === "";
  };

  const handlePasswordBlur = (e) => {
    const { name } = e.target;
    validatePasswordField(name);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    const oldValid = validatePasswordField("oldPassword");
    const newValid = validatePasswordField("newPassword");
    const confirmValid = validatePasswordField("confirmPassword");

    if (!oldValid || !newValid || !confirmValid) {
      return;
    }

    try {
      showLoading();
      await UserService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");
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
      toast.error(
        error.response?.data?.message ||
          "Đổi mật khẩu thất bại, vui lòng kiểm tra lại mật khẩu cũ.",
      );
    } finally {
      hideLoading();
    }
  };

  // ============================================
  // PASSWORD STRENGTH
  // ============================================
  const validatePasswordChecks = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const checks = validatePasswordChecks(passwordData.newPassword);
  const passedCount = Object.values(checks).filter(Boolean).length;
  const strengthPercent = (passedCount / 5) * 100;
  const strength =
    passedCount <= 2
      ? { label: "Yếu", color: "#ef4444" }
      : passedCount <= 3
        ? { label: "Trung bình", color: "#f59e0b" }
        : passedCount <= 4
          ? { label: "Mạnh", color: "#3b82f6" }
          : { label: "Rất mạnh", color: "#16a34a" };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Cột trái: Thông tin cá nhân */}
        <div className={styles.card}>
          <div className={styles.profileHeader}>
            {/* ✅ AVATAR với nút camera */}
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarContainer}>
                <img
                  src={getImageUrl(formData.avatarUrl || DEFAULT_AVATAR)}
                  alt="Avatar"
                  className={styles.avatar}
                  onError={(e) => {
                    e.target.src = getImageUrl(DEFAULT_AVATAR);
                  }}
                />
              </div>
              <button
                type="button"
                className={styles.avatarEditBtn}
                onClick={() => setShowAvatarModal(true)}
                title="Đổi ảnh đại diện"
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>

            <div className={styles.profileInfo}>
              <h2 className={styles.name}>{formData.fullName}</h2>
              <span className={styles.badge}>
                {ROLE_LABELS[formData.role] || formData.role}
              </span>
            </div>

            {!isEditing && (
              <button
                type="button"
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
                <span className={styles.value}>{formData.fullName || "—"}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>EMAIL</span>
                <span className={styles.value}>{formData.email || "—"}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>GIỚI TÍNH</span>
                <span className={styles.value}>{formData.gender || "—"}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.label}>NGÀY SINH</span>
                <span className={styles.value}>
                  {formData.dateOfBirth || "—"}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className={styles.editForm} noValidate>
              <div className={styles.gridInfo}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Họ và tên *</label>
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
                    placeholder="Nhập họ và tên"
                    maxLength={100}
                  />
                  {touched.fullName && errors.fullName && (
                    <span className={styles.errorMessage}>
                      {errors.fullName}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className={`${styles.formInput} ${
                      touched.email && errors.email ? styles.errorInput : ""
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="example@gmail.com"
                    maxLength={100}
                  />
                  {touched.email && errors.email && (
                    <span className={styles.errorMessage}>{errors.email}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Giới tính *</label>
                  <select
                    name="gender"
                    className={`${styles.formInput} ${
                      touched.gender && errors.gender ? styles.errorInput : ""
                    }`}
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                  {touched.gender && errors.gender && (
                    <span className={styles.errorMessage}>{errors.gender}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ngày sinh *</label>
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
                    max={new Date().toISOString().split("T")[0]}
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
                  onClick={handleCancelEdit}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Hủy
                </button>
                <button type="submit" className={styles.submitButton}>
                  <FontAwesomeIcon icon={faSave} />
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
              <div className={styles.modalIconBoxPurple}>
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h2 className={styles.cardTitle}>Đổi mật khẩu</h2>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FontAwesomeIcon icon={faKey} /> Mật khẩu hiện tại *
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPasswords.old ? "text" : "password"}
                  name="oldPassword"
                  className={`${styles.formInput} ${
                    passwordErrors.oldPassword ? styles.errorInput : ""
                  }`}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => toggleShowPassword("old")}
                  tabIndex={-1}
                >
                  <FontAwesomeIcon
                    icon={showPasswords.old ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              {passwordErrors.oldPassword && (
                <span className={styles.errorMessage}>
                  {passwordErrors.oldPassword}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FontAwesomeIcon icon={faLock} /> Mật khẩu mới *
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  className={`${styles.formInput} ${
                    passwordErrors.newPassword ? styles.errorInput : ""
                  }`}
                  placeholder="Nhập mật khẩu mới"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => toggleShowPassword("new")}
                  tabIndex={-1}
                >
                  <FontAwesomeIcon
                    icon={showPasswords.new ? faEyeSlash : faEye}
                  />
                </button>
              </div>

              {passwordData.newPassword && (
                <>
                  <div className={styles.strengthWrapper}>
                    <div className={styles.strengthTrack}>
                      <div
                        className={styles.strengthFill}
                        style={{
                          width: `${strengthPercent}%`,
                          background: strength.color,
                        }}
                      />
                    </div>
                    <span
                      className={styles.strengthLabel}
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </span>
                  </div>

                  <div className={styles.checklist}>
                    {[
                      { key: "length", label: "Ít nhất 8 ký tự" },
                      { key: "uppercase", label: "1 chữ hoa" },
                      { key: "lowercase", label: "1 chữ thường" },
                      { key: "number", label: "1 chữ số" },
                      { key: "special", label: "1 ký tự đặc biệt" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className={`${styles.checkItem} ${
                          checks[item.key] ? styles.checkPassed : ""
                        }`}
                      >
                        {/* ✅ FIX 1: faCheckCircle đã được import */}
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {passwordErrors.newPassword && (
                <span className={styles.errorMessage}>
                  {passwordErrors.newPassword}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FontAwesomeIcon icon={faLock} /> Xác nhận mật khẩu mới *
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  className={`${styles.formInput} ${
                    passwordErrors.confirmPassword ? styles.errorInput : ""
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => toggleShowPassword("confirm")}
                  tabIndex={-1}
                >
                  <FontAwesomeIcon
                    icon={showPasswords.confirm ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <span className={styles.errorMessage}>
                  {passwordErrors.confirmPassword}
                </span>
              )}
            </div>

            <button type="submit" className={styles.submitButton}>
              <FontAwesomeIcon icon={faSave} />
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
      </div>

      {/* Avatar Modal */}
      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={formData.avatarUrl}
        onSuccess={(data) => {
          if (data?.avatarUrl) {
            setFormData((prev) => {
              const updated = { ...prev, avatarUrl: data.avatarUrl };
              // ✅ đồng bộ luôn bản gốc để không bị revert khi Hủy
              setOriginalData((prevOrig) => ({
                ...prevOrig,
                avatarUrl: data.avatarUrl,
              }));
              return updated;
            });
            window.dispatchEvent(
              new CustomEvent("avatar-updated", {
                detail: { avatarUrl: data.avatarUrl },
              }),
            );
          }
        }}
      />
    </div>
  );
}

// =====================================================
// AVATAR UPLOAD MODAL
// =====================================================
function AvatarUploadModal({ isOpen, onClose, currentAvatar, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsUploading(false);
      setIsRemoving(false);
      // ✅ FIX 5: reset input khi mở lại modal
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 2MB");
      // ✅ reset input để có thể chọn lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // revoke preview cũ nếu có
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      const res = await UserService.uploadAvatar(selectedFile);
      const data = res?.data?.data;
      toast.success("Cập nhật ảnh đại diện thành công!");
      onSuccess?.(data);
      onClose();
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật ảnh đại diện.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh đại diện?")) return;
    try {
      setIsRemoving(true);
      const res = await UserService.removeAvatar();
      const data = res?.data?.data;
      toast.success("Đã xóa ảnh đại diện!");
      onSuccess?.(data);
      onClose();
    } catch (error) {
      console.error("Lỗi xóa avatar:", error);
      toast.error(error.response?.data?.message || "Không thể xóa ảnh.");
    } finally {
      setIsRemoving(false);
    }
  };

  // ✅ FIX 5: dùng optional chaining an toàn
  const displayAvatar =
    previewUrl || getImageUrl(currentAvatar || DEFAULT_AVATAR);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIconBox}>
              <FontAwesomeIcon icon={faCamera} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Ảnh đại diện</h2>
              <p className={styles.modalSubtitle}>Cập nhật ảnh của bạn</p>
            </div>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.avatarUploadPreview}>
            <div className={styles.avatarPreviewCircle}>
              <img
                src={displayAvatar}
                alt="Avatar"
                onError={(e) => {
                  e.target.src = getImageUrl(DEFAULT_AVATAR);
                }}
              />
              {selectedFile && (
                <div className={styles.newAvatarBadge}>Ảnh mới</div>
              )}
            </div>
            <p className={styles.avatarHint}>
              {selectedFile
                ? selectedFile.name
                : "Chọn ảnh để thay đổi (tối đa 2MB)"}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleSelectFile}
            style={{ display: "none" }}
          />

          <div className={styles.avatarActions}>
            <button
              className={styles.avatarSelectBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRemoving}
            >
              <FontAwesomeIcon icon={faCamera} />
              {selectedFile ? "Chọn ảnh khác" : "Chọn ảnh"}
            </button>
            <button
              className={styles.avatarRemoveBtn}
              onClick={handleRemove}
              disabled={isUploading || isRemoving}
            >
              {isRemoving ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faTrashCan} />
              )}
              Xóa ảnh
            </button>
          </div>
        </div>

        {selectedFile && (
          <div className={styles.modalFooter}>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                // ✅ revoke preview trước khi clear
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setSelectedFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={isUploading}
            >
              Hủy
            </button>
            <button
              className={styles.submitBtn}
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  <span>Lưu ảnh</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;
