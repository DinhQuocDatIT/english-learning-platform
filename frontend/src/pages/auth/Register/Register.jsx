import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Register.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    birthday: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
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
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.group}>
            <label>Họ và tên</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className={styles.group}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.group}>
            <label>Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Chọn giới tính</option>
              <option>Nam</option>
              <option>Nữ</option>
            </select>
          </div>

          <div className={styles.group}>
            <label>Ngày sinh</label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
            />
          </div>

          <div className={styles.group}>
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className={styles.group}>
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button className={styles.btn}>
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
