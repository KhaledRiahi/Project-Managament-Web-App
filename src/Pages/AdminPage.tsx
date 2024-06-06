import React from "react";
import AdminComponent from"../Component/AdminComponent";

const AdminPage = () => {
  return (
    <div className="h-screen flex items-center justify-center p-10">
      <div className="w-full md:w-[800px] bg-white p-6 rounded-xl drop-shadow-xl">
        <h1 className="text-center text-4xl font-bold mb-6">Admin Dashboard</h1>
        <AdminComponent />
      </div>
      <div className="h-full w-full bg-gradient-to-r from-myBlue to-myPink opacity-70 absolute top-0 -z-10" />
      <div className="h-full w-full absolute bg-pattern -z-20 top-0 bg-center bg-no-repeat " />
    </div>
  );
};

export default AdminPage;
