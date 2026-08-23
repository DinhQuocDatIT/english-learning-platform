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
import TeacherProfile from "../pages/teacher/TeacherProfile/TeacherProfile";
import VocabularyManagement from "../pages/vocabulary/VocabularyManagement/VocabularyManagement";
import CreateVocabulary from "../pages/vocabulary/CreateVocabulary/CreateVocabulary";
import ImportVocabulary from "../pages/vocabulary/ImportVocabulary/ImportVocabulary";
import UpdateVocabulary from "../pages/vocabulary/UpdateVocabulary/UpdateVocabulary";
import TeacherManagement from "../pages/admin/TeacherManagement/TeacherManagement";
import CreateTeacher from "../pages/admin/CreateTeacher/CreateTeacher";
import TeacherDetail from "../pages/admin/TeacherDetail/TeacherDetail";
import StudentManagement from "../pages/shared/student/StudentManagement/StudentManagement";
import CreateStudent from "../pages/shared/student/CreateStudent/CreateStudent";
import StudentDetail from "../pages/shared/student/StudentDetail/StudentDetail";
import MyVocabulary from "../pages/student/MyVocabulary/MyVocabulary";
import CreateStudySession from "../pages/student/CreateStudySession/CreateStudySession";
import StudyFlashcard from "../pages/student/StudyFlashcard/StudyFlashcard";
import MembershipPackageManage from "../pages/admin/membershipPackage/MembershipPackageManage/MembershipPackageManage";
import MembershipPackageAdd from "../pages/admin/membershipPackage/MembershipPackageAdd/MembershipPackageAdd";
import MembershipPackageDetail from "../pages/admin/membershipPackage/MembershipPackageDetail/MembershipPackageDetail";
import MembershipPackageEdit from "../pages/admin/membershipPackage/MembershipPackageEdit/MembershipPackageEdit";
import StudentMembership from "../pages/student/Membership/StudentMembership";
import LevelManage from "../pages/admin/Level/LevelManage/LevelManage";
import DashBoard from "../pages/admin/DashBoard/DashBoard";

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

            {/* Tự vừng của học sinh */}
            <Route path="myvocabulary" element={<MyVocabulary />} />
            <Route
              path="create-study-session"
              element={<CreateStudySession />}
            />
            <Route path="study-flash-card" element={<StudyFlashcard />} />

            {/* gói thành viên */}
            <Route path="student-membership" element={<StudentMembership />} />
          </Route>

          <Route
            path="teacher"
            element={<RoleRoute allowedRoles={[ROLES.TEACHER]} />}
          >
            <Route path="profile" element={<TeacherProfile />} />
            {/*   quản lý từ vựng */}
            <Route path="vocabulary" element={<VocabularyManagement />} />
            <Route path="create-vocabulary" element={<CreateVocabulary />} />
            <Route path="import-vocabulary" element={<ImportVocabulary />} />
            <Route
              path="update-vocabulary/:id"
              element={<UpdateVocabulary />}
            />
            {/* quản lý học sinh */}
            <Route path="students" element={<StudentManagement />} />
            <Route path="create-student" element={<CreateStudent />} />
            <Route path="student-detail/:id" element={<StudentDetail />} />
          </Route>

          <Route
            path="admin"
            element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}
          >
            <Route path="profile" element={<AdminProfile />} />
            <Route path="index" element={<DashBoard />} />

            {/*   quản lý từ vựng */}
            <Route path="vocabulary" element={<VocabularyManagement />} />
            <Route path="create-vocabulary" element={<CreateVocabulary />} />
            <Route path="import-vocabulary" element={<ImportVocabulary />} />
            <Route
              path="update-vocabulary/:id"
              element={<UpdateVocabulary />}
            />
            {/* Quản lý giáo viên */}

            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="create-teacher" element={<CreateTeacher />} />
            <Route path="teacher-detail/:id" element={<TeacherDetail />} />

            {/* quản lý học sinh */}
            <Route path="students" element={<StudentManagement />} />
            <Route path="create-student" element={<CreateStudent />} />
            <Route path="student-detail/:id" element={<StudentDetail />} />

            {/* quản lý gói thành viên */}
            <Route
              path="membership-package"
              element={<MembershipPackageManage />}
            />
            <Route
              path="add-membership-package"
              element={<MembershipPackageAdd />}
            />
            <Route
              path="membership-package/:id"
              element={<MembershipPackageDetail />}
            />
            <Route
              path="membership-package/:id/edit"
              element={<MembershipPackageEdit />}
            />
            {/* quản lý cấp độ */}

            <Route path="level" element={<LevelManage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
