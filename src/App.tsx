import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../src/Pages/LoginPage";
import AdminPage from "../src/Pages/AdminPage";
import UnauthorizedPage from "../src/Pages/UnauthorizedPage";
import ProtectedRoute from "./Component/ProtectedRoutes";
import MainLayout from "./Pages/Mainlayout";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Header" element={<MainLayout children={undefined}/>}></Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="isAdmin">
              
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </Router>
  );
};

export default App;
