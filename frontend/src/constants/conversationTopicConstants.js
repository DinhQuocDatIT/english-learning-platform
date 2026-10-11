import {
  faComments,
  faUtensils,
  faBriefcase,
  faPlane,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";

export const CONVERSATION_TOPICS = [
  {
    value: "DAILY_CONVERSATION",
    label: "Daily Conversation",
    labelVi: "Giao tiếp hàng ngày",
    icon: faComments,
    description: "Chào hỏi, giới thiệu, hỏi thăm, cảm ơn, xin lỗi, tạm biệt",
    emoji: "💬",
  },
  {
    value: "RESTAURANT",
    label: "At a Restaurant",
    labelVi: "Gọi món tại nhà hàng",
    icon: faUtensils,
    description: "Menu, order, bill, waiter, reservation",
    emoji: "🍽️",
  },
  {
    value: "JOB_INTERVIEW",
    label: "Job Interview",
    labelVi: "Phỏng vấn xin việc",
    icon: faBriefcase,
    description: "Giới thiệu bản thân, kinh nghiệm, kỹ năng, mục tiêu",
    emoji: "💼",
  },
  {
    value: "TRAVEL",
    label: "Travel",
    labelVi: "Du lịch",
    icon: faPlane,
    description: "Đặt phòng, hỏi đường, mua vé, hành lý",
    emoji: "✈️",
  },
  {
    value: "MAKING_FRIENDS",
    label: "Making Friends",
    labelVi: "Làm quen & kết bạn",
    icon: faUserFriends,
    description: "Sở thích, gia đình, bạn bè, hoạt động giải trí",
    emoji: "🤝",
  },
];

export const getTopicDisplay = (topicValue) => {
  const found = CONVERSATION_TOPICS.find((t) => t.value === topicValue);
  return found ? found.labelVi : topicValue;
};

export const getTopicIcon = (topicValue) => {
  const found = CONVERSATION_TOPICS.find((t) => t.value === topicValue);
  return found ? found.icon : faComments;
};
