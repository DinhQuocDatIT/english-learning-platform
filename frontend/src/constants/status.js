

// Map trạng thái từ tiếng Anh sang tiếng Việt
export const STATUS_MAP = {
  DRAFT: "Nháp",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  PUBLISHED: "Đã phát hành",
};

// Map màu sắc cho từng trạng thái (nền, text, border)
export const STATUS_COLOR_MAP = {
  DRAFT: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  PENDING: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  APPROVED: { bg: "#ede9fe", text: "#5b21b6", border: "#8b5cf6" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" },
  PUBLISHED: { bg: "#d1fae5", text: "#065f46", border: "#22c55e" },
};

// Map màu sắc đơn giản (chỉ background)
export const STATUS_BG_COLOR_MAP = {
  DRAFT: "#fbbf24",
  PENDING: "#60a5fa",
  APPROVED: "#a78bfa",
  REJECTED: "#f87171",
  PUBLISHED: "#34d399",
};

// Map màu xanh chủ đạo
export const STATUS_GREEN_COLOR_MAP = {
  DRAFT: { bg: "#d4f3ef", text: "#0ea792", border: "#0ea792" },
  PENDING: { bg: "#b7e6e0", text: "#0d8a7a", border: "#0d8a7a" },
  APPROVED: { bg: "#9ad9d1", text: "#0a7568", border: "#0a7568" },
  REJECTED: { bg: "#fdd5d5", text: "#dc2626", border: "#dc2626" },
  PUBLISHED: { bg: "#b8f0d0", text: "#16a34a", border: "#16a34a" },
};

// Các trạng thái cho phép chỉnh sửa
export const EDITABLE_STATUSES = ["DRAFT", "REJECTED"];

// Lấy tên trạng thái tiếng Việt
export const getStatusLabel = (status) => {
  return STATUS_MAP[status] || status;
};

// Lấy màu trạng thái
export const getStatusColor = (status) => {
  return STATUS_BG_COLOR_MAP[status] || "#64748b";
};

// Lấy màu trạng thái đầy đủ (nền, text, border)
export const getStatusFullColor = (status) => {
  return (
    STATUS_COLOR_MAP[status] || {
      bg: "#f1f5f9",
      text: "#475569",
      border: "#94a3b8",
    }
  );
};

// Lấy màu xanh chủ đạo
export const getStatusGreenColor = (status) => {
  return (
    STATUS_GREEN_COLOR_MAP[status] || {
      bg: "#f1f5f9",
      text: "#475569",
      border: "#94a3b8",
    }
  );
};

// Kiểm tra có thể chỉnh sửa không
export const canEditStatus = (status) => {
  return EDITABLE_STATUSES.includes(status);
};
