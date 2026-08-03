import {
  faChartSimple,
  faBookOpen,
  faBook,
  faPenToSquare,
  faGear,
  faUsers,
  faGraduationCap,
  faClipboardList,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

import { ROLES } from "../constants/roles";

export const sidebarMenus = {
  [ROLES.STUDENT]: [
    {
      path: "/dashboard",
      name: "Tổng quan",
      icon: faChartSimple,
    },
    {
      path: "/dashboard/courses",
      name: "Khóa học của tôi",
      icon: faBookOpen,
    },
    {
      path: "/dashboard/vocabulary",
      name: "Từ vựng",
      icon: faBook,
    },
    {
      path: "/dashboard/practice",
      name: "Luyện tập",
      icon: faPenToSquare,
    },
    {
      path: "/dashboard/settings",
      name: "Cài đặt",
      icon: faGear,
    },
  ],

  [ROLES.TEACHER]: [
    {
      path: "/teacher/dashboard",
      name: "Tổng quan",
      icon: faChartSimple,
    },
    {
      path: "/teacher/courses",
      name: "Quản lý khóa học",
      icon: faBookOpen,
    },
    {
      path: "/teacher/students",
      name: "Học viên",
      icon: faUsers,
    },
    {
      path: "/teacher/assignments",
      name: "Bài tập",
      icon: faClipboardList,
    },
    {
      path: "/teacher/settings",
      name: "Cài đặt",
      icon: faGear,
    },
  ],

  [ROLES.ADMIN]: [
    {
      path: "/admin/dashboard",
      name: "Dashboard",
      icon: faChartSimple,
    },
    {
      path: "/admin/users",
      name: "Quản lý người dùng",
      icon: faUsers,
    },
    {
      path: "/admin/courses",
      name: "Quản lý khóa học",
      icon: faGraduationCap,
    },
    {
      path: "/admin/teachers",
      name: "Giảng viên",
      icon: faUserShield,
    },
    {
      path: "/admin/settings",
      name: "Cài đặt",
      icon: faGear,
    },
  ],
};
