import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPen,
  faCheck,
  faEnvelope,
  faVenusMars,
  faCalendar,
  faShieldHalved,
  faClock,
  faUsers,
  faBook,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./StudentDetail.module.css";

import { toast } from "react-toastify";
import studentService from "../../../../services/studentService";
import { useLoading } from "../../../../contexts/LoadingContext";

import {
  isValidEmail,
  isValidFullName,
  isValidGender,
  isValidBirthday,
} from "../../../../utils/validators";

const formatLearningHours = (seconds) => {
  if (seconds === null || seconds === undefined) return "0";

  return (seconds / 3600).toFixed(1);
};

function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showLoading, hideLoading } = useLoading();

  // =====================================================
  // NGÀY SINH TỐI ĐA
  // HỌC SINH PHẢI TỪ 6 TUỔI TRỞ LÊN
  // =====================================================
  const getMaxBirthDate = () => {
    const today = new Date();

    today.setFullYear(today.getFullYear() - 6);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // LẤY STUDENT THEO USER ID
  // =====================================================
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        showLoading();

        const response = await studentService.getStudentByUserId(id);

        const data = response.data?.data ?? response.data;

        setStudent(data);
        setFormData(data);
      } catch (error) {
        console.error("Lỗi lấy thông tin học sinh:", error);

        toast.error(
          error.response?.data?.message || "Không thể lấy thông tin học sinh",
        );
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  // =====================================================
  // CHỈNH SỬA
  // =====================================================
  const handleEditClick = () => {
    setFormData({ ...student });
    setIsEditing(true);
  };

  // =====================================================
  // HỦY CHỈNH SỬA
  // =====================================================
  const handleCancelClick = () => {
    setFormData({ ...student });
    setIsEditing(false);
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================
  const validateForm = () => {
    const fullNameError = isValidFullName(formData.fullName);
    const emailError = isValidEmail(formData.email);
    const genderError = isValidGender(formData.gender);
    const birthdayError = isValidBirthday(formData.dateOfBirth, 6);

    if (fullNameError) {
      toast.error(fullNameError);
      return false;
    }

    if (emailError) {
      toast.error(emailError);
      return false;
    }

    if (genderError) {
      toast.error(genderError);
      return false;
    }

    if (birthdayError) {
      toast.error(birthdayError);
      return false;
    }

    return true;
  };

  // =====================================================
  // UPDATE STUDENT
  // =====================================================
  const handleSaveClick = async (e) => {
    e.preventDefault();

    if (!formData) {
      return;
    }

    // Validate trước khi gọi API
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSaving(true);
      showLoading();

      const requestData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      };

      const response = await studentService.updateStudentByUserId(
        id,
        requestData,
      );

      const updatedStudent = response.data?.data ?? response.data;

      setStudent(updatedStudent);
      setFormData(updatedStudent);
      setIsEditing(false);

      toast.success("Cập nhật học sinh thành công");
    } catch (error) {
      console.error("Lỗi cập nhật học sinh:", error);

      toast.error(
        error.response?.data?.message || "Cập nhật học sinh thất bại",
      );
    } finally {
      setSaving(false);
      hideLoading();
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading || !student || !formData) {
    return <div className={styles.loading}>Đang tải thông tin học sinh...</div>;
  }

  return (
    <div className={styles.container}>
      {/* =====================================================
          TOP BAR
      ===================================================== */}
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Trở về danh sách
        </button>

        <div className={styles.headerActions}>
          {!isEditing ? (
            <button className={styles.editBtn} onClick={handleEditClick}>
              <FontAwesomeIcon icon={faPen} />
              Chỉnh sửa
            </button>
          ) : (
            <div className={styles.editActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancelClick}
                disabled={saving}
              >
                Hủy
              </button>

              <button
                type="submit"
                form="student-edit-form"
                className={styles.saveBtn}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faCheck} />

                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <div className={styles.mainGrid}>
        {/* =====================================================
            LEFT PROFILE
        ===================================================== */}
        <div className={styles.leftProfileCard}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {student.fullName
                ? student.fullName.charAt(0).toUpperCase()
                : "S"}
            </div>
          </div>

          <h2 className={styles.profileName}>{student.fullName}</h2>

          <span className={styles.profileId}>ID: {student.id}</span>

          <hr className={styles.divider} />

          <div className={styles.profileMetaRow}>
            <span className={styles.metaLabel}>Trạng thái</span>

            <span className={`${styles.statusBadge} ${styles.statusActive}`}>
              <span className={styles.dot}></span>
              Đang hoạt động
            </span>
          </div>
        </div>

        {/* =====================================================
            RIGHT INFORMATION
        ===================================================== */}
        <div className={styles.rightInfoCard}>
          <h3 className={styles.infoCardTitle}>Thông tin cá nhân</h3>

          <hr className={styles.infoDivider} />

          <form
            id="student-edit-form"
            onSubmit={handleSaveClick}
            className={styles.infoGrid}
          >
            {/* =================================================
                EMAIL
            ================================================= */}
            <div className={styles.infoField}>
              <div className={styles.fieldHeader}>
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Email</span>
              </div>

              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  required
                  className={styles.editInput}
                  placeholder="example@gmail.com"
                />
              ) : (
                <div className={styles.fieldValue}>{student.email}</div>
              )}
            </div>

            {/* =================================================
                GENDER
            ================================================= */}
            <div className={styles.infoField}>
              <div className={styles.fieldHeader}>
                <FontAwesomeIcon icon={faVenusMars} />
                <span>Giới tính</span>
              </div>

              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleInputChange}
                  className={styles.editSelect}
                >
                  <option value="">-- Chọn giới tính --</option>

                  <option value="Nam">Nam</option>

                  <option value="Nữ">Nữ</option>
                </select>
              ) : (
                <div className={styles.fieldValue}>
                  {student.gender || "Chưa cập nhật"}
                </div>
              )}
            </div>

            {/* =================================================
                DATE OF BIRTH
            ================================================= */}
            <div className={styles.infoField}>
              <div className={styles.fieldHeader}>
                <FontAwesomeIcon icon={faCalendar} />
                <span>Ngày sinh</span>
              </div>

              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ""}
                  onChange={handleInputChange}
                  max={getMaxBirthDate()}
                  className={styles.editInput}
                />
              ) : (
                <div className={styles.fieldValue}>
                  {student.dateOfBirth || "Chưa cập nhật"}
                </div>
              )}

              {isEditing && (
                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "var(--color-text-muted)",
                    fontSize: "12px",
                  }}
                >
                  Học sinh phải từ 6 tuổi trở lên.
                </small>
              )}
            </div>

            {/* =================================================
                ROLE
            ================================================= */}
            <div className={styles.infoField}>
              <div className={styles.fieldHeader}>
                <FontAwesomeIcon icon={faShieldHalved} />
                <span>Vai trò</span>
              </div>

              <div className={styles.fieldValue}>{student.role}</div>
            </div>

            {/* =================================================
                CREATED AT
            ================================================= */}
            <div className={styles.infoField}>
              <div className={styles.fieldHeader}>
                <FontAwesomeIcon icon={faClock} />
                <span>Ngày tạo tài khoản</span>
              </div>

              <div className={styles.fieldValue}>
                {student.createdAt
                  ? new Date(student.createdAt).toLocaleDateString("vi-VN")
                  : "Chưa cập nhật"}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}
      <div className={styles.bottomStatsRow}>
        {/* =================================================
            LEARNING HOURS
        ================================================= */}
        <div className={styles.statBox}>
          <div className={`${styles.boxIconWrapper} ${styles.blueIcon}`}>
            <FontAwesomeIcon icon={faClock} />
          </div>

          <span className={styles.boxLabel}>Giờ học tập</span>

          <span className={styles.boxValue}>
            {formatLearningHours(student.totalLearningSeconds)}
          </span>
        </div>

        {/* =================================================
            XP
        ================================================= */}
        <div className={styles.statBox}>
          <div className={`${styles.boxIconWrapper} ${styles.greenIcon}`}>
            <FontAwesomeIcon icon={faUsers} />
          </div>

          <span className={styles.boxLabel}>Điểm XP</span>

          <span className={styles.boxValue}>
            {(student.experience || 0).toLocaleString()}
          </span>
        </div>

        {/* =================================================
            TOPICS
        ================================================= */}
        <div className={styles.statBox}>
          <div className={`${styles.boxIconWrapper} ${styles.purpleIcon}`}>
            <FontAwesomeIcon icon={faBook} />
          </div>

          <span className={styles.boxLabel}>Chủ đề đã học</span>

          <span className={styles.boxValue}>
            {student.totalCompletedTopic || 0}
          </span>
        </div>

        {/* =================================================
            COMPLETION
        ================================================= */}
        <div className={styles.statBox}>
          <div className={`${styles.boxIconWrapper} ${styles.tealIcon}`}>
            <FontAwesomeIcon icon={faThumbsUp} />
          </div>

          <span className={styles.boxLabel}>Tỷ lệ hoàn thành</span>

          <span className={styles.boxValue}>95%</span>
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
