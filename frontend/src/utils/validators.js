// Kiểm tra định dạng Email cơ bản
export const isValidEmail = (email) => {
  if (!email || email.trim() === "") return "Vui lòng nhập email";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "Email không hợp lệ";
  return "";
};

// Kiểm tra Họ tên
export const isValidFullName = (fullName) => {
  if (!fullName || fullName.trim() === "") return "Vui lòng nhập họ và tên";
  if (fullName.trim().length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
  return "";
};

// Kiểm tra Mật khẩu
export const isValidPassword = (password) => {
  if (!password) return "Vui lòng nhập mật khẩu";
  if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
  return "";
};

// Kiểm tra Giới tính
export const isValidGender = (gender) => {
  if (!gender || gender === "") return "Vui lòng chọn giới tính";
  return "";
};

// Kiểm tra Ngày sinh & Độ tuổi tối thiểu
export const isValidBirthday = (birthday, minAge = 6) => {
  if (!birthday) return "Vui lòng chọn ngày sinh";
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  if (age < minAge) {
    return `Bạn phải từ ${minAge} tuổi trở lên`;
  }
  return "";
};
