export const CONVERSATION_LEVELS = [
  {
    value: "BEGINNER",
    label: "Beginner",
    labelVi: "Cơ bản",
    color: "#22c55e",
    description: "Giao tiếp đơn giản, câu ngắn, từ vựng cơ bản",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    labelVi: "Trung cấp",
    color: "#eab308",
    description: "Câu dài hơn, mệnh đề phụ, collocations thông dụng",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
    labelVi: "Nâng cao",
    color: "#ef4444",
    description: "Câu phức, thành ngữ, từ vựng học thuật",
  },
];

export const getLevelDisplay = (level) => {
  const found = CONVERSATION_LEVELS.find((l) => l.value === level);
  return found ? `${found.label} (${found.labelVi})` : level;
};