import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { UserRoleType } from "../Types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: keyof UserRoleType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  if (!currentUser.isAuthenticated || !currentUser.user.userRole[requiredRole]) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;