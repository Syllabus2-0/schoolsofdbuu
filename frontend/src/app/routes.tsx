import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SyllabusBuilder from "./pages/SyllabusBuilder";
import Approvals from "./pages/Approvals";
import Analytics from "./pages/Analytics";
import UserManagement from "./pages/UserManagement";
import SchoolManagement from "./pages/SchoolManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import TeacherAssignment from "./pages/TeacherAssignment";
import SyllabusReview from "./pages/SyllabusReview";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "syllabus/new", Component: SyllabusBuilder },
            { path: "syllabus/review/:syllabusId", Component: SyllabusReview },
      { path: "approvals", Component: Approvals },
      { path: "analytics", Component: Analytics },
      { path: "users", Component: UserManagement },
      { path: "schools", Component: SchoolManagement },
      { path: "departments", Component: DepartmentManagement },
      { path: "teacher-assignment", Component: TeacherAssignment },
      { path: "notifications", Component: Notifications },
      { path: "profile", Component: Profile },
    ],
  },
]);
