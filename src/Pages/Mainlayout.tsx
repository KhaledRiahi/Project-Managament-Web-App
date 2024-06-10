import React from 'react';
import Header from "../Component/Header";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
