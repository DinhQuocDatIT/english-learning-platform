import { Routes, Route } from "react-router-dom";
import LandingPage from "../layouts/LandingPage/LandingPage";
import Login from "../pages/auth/Login/Login";
import Register from "../pages/auth/Register/Register";

function AppRoutes() {
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="*" element={<NotFound />} /> */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default AppRoutes;
