import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";

import DashboardPage from "./pages/dashboard/DashboardPage";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
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