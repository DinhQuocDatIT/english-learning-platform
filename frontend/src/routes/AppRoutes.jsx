import { Routes, Route } from "react-router-dom";
import LandingPage from "../layouts/LandingPage/LandingPage";
import Login from "../pages/auth/Login/Login";
import Register from "../pages/auth/Register/Register";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Profile from "../pages/student/Profile/Profile";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import { ROLES } from "../constants/roles";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
            element={<RoleRoute allowedRoles={[ROLES.ADMIN]}></RoleRoute>}
          ></Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
