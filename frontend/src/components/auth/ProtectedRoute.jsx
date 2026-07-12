import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { isAuthenticated } from "../../utils/authStorage";

function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;