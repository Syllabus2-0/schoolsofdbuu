import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SyllabusBuilder from "./pages/SyllabusBuilder";
import Approvals from "./pages/Approvals";
import Analytics from "./pages/Analytics";
import UserManagement from "./pages/UserManagement";
import RequireRole from "./components/RequireRole";
import FacultyHome from "./pages/FacultyHome";
import DeanHome from "./pages/DeanHome";
import HODHome from "./pages/HODHome";
import AdminHome from "./pages/AdminHome";

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
      { path: "approvals", Component: Approvals },
      { path: "analytics", Component: Analytics },
      { path: "users", Component: UserManagement },
      {
        path: "faculty",
        Component: () => (
          <RequireRole allowed={["Faculty"]}>
            <FacultyHome />
          </RequireRole>
        ),
      },
      {
        path: "dean",
        Component: () => (
          <RequireRole allowed={["Dean"]}>
            <DeanHome />
          </RequireRole>
        ),
      },
      {
        path: "hod",
        Component: () => (
          <RequireRole allowed={["HOD"]}>
            <HODHome />
          </RequireRole>
        ),
      },
      {
        path: "admin",
        Component: () => (
          <RequireRole allowed={["SuperAdmin"]}>
            <AdminHome />
          </RequireRole>
        ),
      },
    ],
  },
]);
