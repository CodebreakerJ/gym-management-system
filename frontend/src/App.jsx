import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import MembersPage from "./pages/members/MembersPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import PlansPage from "./pages/plans/PlansPage";
import ReportsPage from "./pages/reports/ReportsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import StaffPage from "./pages/staff/StaffPage";
import SettingsPage from "./pages/settings/SettingsPage";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        element={<ProtectedRoute />}
      >
        <Route
          element={
            <DashboardLayout />
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />

          <Route
            path="/members"
            element={
              <MembersPage />
            }
          />

          <Route
            path="/attendance"
            element={
              <AttendancePage />
            }
          />

          <Route
            path="/plans"
            element={
              <PlansPage />
            }
          />

          <Route
            path="/reports"
            element={
              <ReportsPage />
            }
          />

          <Route
            path="/notifications"
            element={
              <NotificationsPage />
            }
          />

          <Route
            path="/staff"
            element={
              <StaffPage />
            }
          />

          <Route
            path="/settings"
            element={
              <SettingsPage />
            }
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;