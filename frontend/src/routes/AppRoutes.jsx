import { Routes, Route } from "react-router-dom";
import LandingPage from "../layouts/LandingPage/LandingPage";
import Login from "../pages/auth/Login/Login";
import Register from "../pages/auth/Register/Register";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Profile from "../pages/student/Profile/Profile";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import { ROLES } from "../constants/roles";
import AuthStorage from "../services/AuthStorage";
import PublicRoute from "./PublicRoute";
import AdminProfile from "../pages/admin/AdminProfile/AdminProfile";

function AppRoutes() {
  const isAuthenticated = AuthStorage.isAuthenticated();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<MainLayout />}>
          <Route
            path="student"
            element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}
          >
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route
            path="teacher"
            element={<RoleRoute allowedRoles={[ROLES.TEACHER]}></RoleRoute>}
          ></Route>
          <Route
            path="admin"
            element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}
          >
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
