// src/constants/topicConstants.js

export const TOPIC_DISPLAY = {
  FAMILY: "Gia đình",
  WORK: "Công việc",
  TRAVEL: "Du lịch",
  SHOPPING: "Mua sắm",
  FOOD: "Đồ ăn",
  HEALTH: "Sức khỏe",
  EDUCATION: "Giáo dục",
  TECHNOLOGY: "Công nghệ",
  HOBBIES: "Sở thích",
  DAILY_ROUTINE: "Thói quen hàng ngày",
  DAILY_CONVERSATION: "Hội thoại hàng ngày",
  RESTAURANT: "Nhà hàng",
  SCHOOL: "Trường học",
  FRIENDS: "Bạn bè",
};

export const TOPIC_ICON = {
  FAMILY: "👨‍👩‍👧‍👦",
  WORK: "💼",
  TRAVEL: "✈️",
  SHOPPING: "🛒",
  FOOD: "🍔",
  HEALTH: "🏥",
  EDUCATION: "🎓",
  TECHNOLOGY: "💻",
  HOBBIES: "🎨",
  DAILY_ROUTINE: "⏰",
  DAILY_CONVERSATION: "💬",
  RESTAURANT: "🍽️",
  SCHOOL: "🏫",
  FRIENDS: "🤝",
};

export function getTopicDisplayName(topic) {
  if (!topic) return "Luyện tập";
  return TOPIC_DISPLAY[topic.toUpperCase()] || topic;
}

export function getTopicIcon(topic) {
  if (!topic) return "📚";
  return TOPIC_ICON[topic.toUpperCase()] || "📚";
}

export default {
  TOPIC_DISPLAY,
  TOPIC_ICON,
  getTopicDisplayName,
  getTopicIcon,
};
