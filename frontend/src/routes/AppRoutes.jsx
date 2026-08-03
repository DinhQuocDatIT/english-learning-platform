import { Routes, Route } from "react-router-dom";
import LandingPage from "../layouts/LandingPage/LandingPage";
import Login from "../pages/auth/Login/Login";
import Register from "../pages/auth/Register/Register";
import MainLayout from "../layouts/MainLayout/MainLayout";
import Profile from "../pages/student/Profile/Profile";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<MainLayout />}>
        <Route index element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
