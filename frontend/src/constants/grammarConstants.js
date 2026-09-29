// =====================================================
// SECTION TYPE (loại section trong lý thuyết)
// =====================================================
export const SECTION_TYPE = {
  TEXT: "TEXT",
  TABLE: "TABLE",
  LIST: "LIST",
  NOTE: "NOTE",
};

export const SECTION_TYPE_OPTIONS = [
  {
    value: "TEXT",
    label: "Đoạn văn (Text)",
    description: "Nội dung dạng đoạn văn",
  },
  {
    value: "TABLE",
    label: "Bảng (Table)",
    description: "Bảng công thức 3 cột",
  },
  {
    value: "LIST",
    label: "Danh sách (List)",
    description: "Danh sách gạch đầu dòng",
  },
  {
    value: "NOTE",
    label: "Ghi chú (Note)",
    description: "Hộp ghi chú nổi bật",
  },
];

export const getSectionTypeLabel = (type) => {
  switch (type) {
    case "TEXT":
      return "Đoạn văn";
    case "TABLE":
      return "Bảng";
    case "LIST":
      return "Danh sách";
    case "NOTE":
      return "Ghi chú";
    default:
      return type;
  }
};

export const getSectionTypeColor = (type) => {
  switch (type) {
    case "TEXT":
      return "#0ea792"; // xanh chính
    case "TABLE":
      return "#7c3aed"; // tím
    case "LIST":
      return "#f59e0b"; // vàng
    case "NOTE":
      return "#dc2626"; // đỏ
    default:
      return "#64748b";
  }
};

// =====================================================
// STATUS (trạng thái topic/theory)
// =====================================================
export const GRAMMAR_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  HIDDEN: "HIDDEN",
};

export const getStatusLabel = (status) => {
  switch (status) {
    case "DRAFT":
      return "Nháp";
    case "PENDING":
      return "Chờ duyệt";
    case "PUBLISHED":
      return "Đã publish";
    case "REJECTED":
      return "Từ chối";
    case "HIDDEN":
      return "Đã ẩn";
    default:
      return status;
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
    case "PENDING":
      return { bg: "#fef3c7", color: "#d97706", border: "#fde68a" };
    case "PUBLISHED":
      return { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" };
    case "REJECTED":
      return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
    case "HIDDEN":
      return { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
    default:
      return { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
  }
};

// =====================================================
// HELPERS
// =====================================================
export const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};
