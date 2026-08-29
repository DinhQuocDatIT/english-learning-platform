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
  faFileWord,
  faHandHoldingDollar,
  faMoneyBill,
  faLayerGroup,
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
      path: "/dashboard/student/myvocabulary",
      name: "Từ vựng",
      icon: faBook,
    },
    {
      path: "/dashboard/student/topics",
      name: "Luyện nghe",
      icon: faBookOpen,
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
      path: "/dashboard/teacher/students",
      name: "Quản lý học sinh",
      icon: faUsers,
    },

    {
      path: "/dashboard/teacher/vocabulary",
      name: "Quản lý từ vựng",
      icon: faFileWord,
    },
    {
      path: "/dashboard/teacher/topics",
      name: "Quản lý chủ đề",
      icon: faBookOpen,
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
      path: "/dashboard/admin/index",
      name: "Dashboard",
      icon: faChartSimple,
    },
    {
      path: "/dashboard/admin/students",
      name: "Quản lý học sinh",
      icon: faUsers,
    },
    {
      path: "/dashboard/admin/teachers",
      name: "Giảng viên",
      icon: faUserShield,
    },
    {
      path: "/dashboard/admin/membership-package",
      name: "Quản lý gói thành viên",
      icon: faMoneyBill,
    },
    {
      path: "/dashboard/admin/vocabulary",
      name: "Quản lý từ vựng",
      icon: faFileWord,
    },
    {
      path: "/dashboard/admin/level",
      name: "Quản lý cấp độ",
      icon: faLayerGroup,
    },
    {
      path: "/dashboard/admin/topics",
      name: "Quản lý chủ đề",
      icon: faBookOpen,
    },
    {
      path: "/dashboard/admin/profile",
      name: "Thông tin cá nhân",
      icon: faCircleUser,
    },
    {
      path: "/dashboard/admin/settings",
      name: "Cài đặt",
      icon: faGear,
    },
  ],
};
