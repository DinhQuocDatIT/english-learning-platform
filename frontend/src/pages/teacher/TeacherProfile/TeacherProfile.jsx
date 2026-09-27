import React, { useEffect, useState, useRef } from "react";
import styles from "./TeacherProfile.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTimes,
  faSave,
  faSpinner,
  faCamera,
  faTrashCan,
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

function TeacherProfile() {
  const { showLoading, hideLoading } = useLoading();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    role: "",
    avatarUrl: DEFAULT_AVATAR,
  });

  // ✅ lưu bản gốc để khôi phục khi Hủy
  const [originalData, setOriginalData] = useState(null);

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
          const normalized = {
            fullName: userData.fullName || userData.name || "",
            email: userData.email || "",
            gender: userData.gender || "",
            dateOfBirth: userData.dateOfBirth || "",
            role: userData.role || "",
            avatarUrl: userData.avatarUrl || DEFAULT_AVATAR,
          };
          setFormData(normalized);
          setOriginalData(normalized);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin cá nhân:", error);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        hideLoading();
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  // ✅ Khôi phục dữ liệu gốc khi hủy
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (originalData) setFormData(originalData);
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
                autoComplete="current-password"
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
                autoComplete="new-password"
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
                autoComplete="new-password"
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

      {/* ✅ Avatar Modal */}
      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={formData.avatarUrl}
        onSuccess={(data) => {
          if (data?.avatarUrl) {
            setFormData((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
            setOriginalData((prev) =>
              prev ? { ...prev, avatarUrl: data.avatarUrl } : prev,
            );
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
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

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

export default TeacherProfile;
