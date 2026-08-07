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
  faCircleUser,
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
    {
      path: "/dashboard/teacher/profile",
      name: "Thông tin cá nhân",
      icon: faCircleUser,
    },
  ],

  [ROLES.ADMIN]: [
    {
      path: "/dashboard/admin/dashboard",
      name: "Dashboard",
      icon: faChartSimple,
    },
    {
      path: "/dashboard/admin/users",
      name: "Quản lý người dùng",
      icon: faUsers,
    },
    {
      path: "/dashboard/admin/vocabulary",
      name: "Quản lý từ vựng",
      icon: faUsers,
    },
    {
      path: "/dashboard/admin/courses",
      name: "Quản lý khóa học",
      icon: faGraduationCap,
    },
    {
      path: "/dashboard/admin/teachers",
      name: "Giảng viên",
      icon: faUserShield,
    },
    {
      path: "/dashboard/admin/settings",
      name: "Cài đặt",
      icon: faGear,
    },
    {
      path: "/dashboard/admin/profile",
      name: "Thông tin cá nhân",
      icon: faCircleUser,
    },
  ],
};
