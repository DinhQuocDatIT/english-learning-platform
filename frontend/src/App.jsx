import { ToastContainer } from "react-toastify";
import "./App.css";
import LandingPage from "./layouts/LandingPage/LandingPage";
import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register/Register";
import AppRoutes from "./routes/AppRoutes";
import { XpProvider } from "./contexts/XpContext";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <XpProvider>
        <AppRoutes />
      </XpProvider>
    </>
  );
}

export default App;
