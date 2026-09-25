import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCloudArrowUp,
  faTrashCan,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import userService from "../../services/userService";
import getImageUrl from "../../utils/imageUrl";
import styles from "./AvatarUploadModal.module.css";

function AvatarUploadModal({ isOpen, onClose, currentAvatar, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef(null);

  // Reset state khi mở/đóng
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsUploading(false);
      setIsRemoving(false);
    }
  }, [isOpen]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 2MB");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const res = await userService.uploadAvatar(selectedFile);
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
      const res = await userService.removeAvatar();
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

  const displayAvatar = previewUrl || getImageUrl(currentAvatar);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Cập nhật ảnh đại diện</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Avatar Preview */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img
              src={displayAvatar}
              alt="Avatar"
              className={styles.avatarImage}
              onError={(e) => {
                e.target.src = getImageUrl(
                  "/uploads/avatars/default-avatar.png",
                );
              }}
            />
            {selectedFile && <div className={styles.newBadge}>Ảnh mới</div>}
          </div>

          <p className={styles.hint}>
            {selectedFile
              ? selectedFile.name
              : "Chọn ảnh mới để thay đổi ảnh đại diện"}
          </p>
        </div>

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleSelectFile}
          className={styles.hiddenInput}
        />

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.selectBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRemoving}
          >
            <FontAwesomeIcon icon={faCloudArrowUp} />
            {selectedFile ? "Chọn ảnh khác" : "Chọn ảnh"}
          </button>

          <button
            className={styles.removeBtn}
            onClick={handleRemove}
            disabled={isUploading || isRemoving}
            title="Xóa ảnh, trở về ảnh mặc định"
          >
            {isRemoving ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faTrashCan} />
            )}
            Xóa ảnh
          </button>
        </div>

        {/* Footer */}
        {selectedFile && (
          <div className={styles.footer}>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={isUploading}
            >
              Hủy
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Đang lưu...
                </>
              ) : (
                "Lưu ảnh"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AvatarUploadModal;
