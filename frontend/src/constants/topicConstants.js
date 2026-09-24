// src/constants/topicConstants.js

import {
  faUsers,
  faBriefcase,
  faPlane,
  faShoppingBag,
  faUtensils,
  faHeartPulse,
  faGraduationCap,
  faLaptopCode,
  faPalette,
  faClock,
  faComments,
  faUtensils as faRestaurant,
  faSchool,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

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

// ✅ Icon FontAwesome cho từng topic
export const TOPIC_FA_ICON = {
  FAMILY: faUsers,
  WORK: faBriefcase,
  TRAVEL: faPlane,
  SHOPPING: faShoppingBag,
  FOOD: faUtensils,
  HEALTH: faHeartPulse,
  EDUCATION: faGraduationCap,
  TECHNOLOGY: faLaptopCode,
  HOBBIES: faPalette,
  DAILY_ROUTINE: faClock,
  DAILY_CONVERSATION: faComments,
  RESTAURANT: faRestaurant,
  SCHOOL: faSchool,
  FRIENDS: faUserGroup,
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

// ✅ Helper: lấy icon FA theo topic
export function getTopicFaIcon(topic) {
  if (!topic) return faBookOpen;
  return TOPIC_FA_ICON[topic.toUpperCase()] || faBookOpen;
}

// ✅ Helper: lấy label đầy đủ cho trang list (VD: "Du lịch & Khám phá")
export const TOPIC_FULL_LABEL = {
  DAILY_CONVERSATION: "Hội thoại hàng ngày",
  SHOPPING: "Mua sắm",
  RESTAURANT: "Nhà hàng & Ẩm thực",
  TRAVEL: "Du lịch & Khám phá",
  WORK: "Công việc & Sự nghiệp",
  SCHOOL: "Trường học & Giáo dục",
  FAMILY: "Gia đình",
  FRIENDS: "Bạn bè & Xã hội",
  FOOD: "Đồ ăn & Ẩm thực",
  HEALTH: "Sức khỏe & Thể chất",
  EDUCATION: "Giáo dục & Học tập",
  TECHNOLOGY: "Công nghệ & Kỹ thuật",
  HOBBIES: "Sở thích & Giải trí",
  DAILY_ROUTINE: "Thói quen hàng ngày",
};

export function getTopicFullLabel(topic) {
  if (!topic) return "Chủ đề tổng hợp";
  return TOPIC_FULL_LABEL[topic.toUpperCase()] || getTopicDisplayName(topic);
}

export default {
  TOPIC_DISPLAY,
  TOPIC_ICON,
  TOPIC_FA_ICON,
  TOPIC_FULL_LABEL,
  getTopicDisplayName,
  getTopicIcon,
  getTopicFaIcon,
  getTopicFullLabel,
};
