import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../Redux/store';

type ProtectedRoutesProps = {
  requiredRole: 'isAdmin' | 'isManager' | 'isUser';
  children: React.ReactNode;
};

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ requiredRole, children }) => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  if (!currentUser.isAuthenticated || !currentUser.user.userRole[requiredRole]) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoutes;
