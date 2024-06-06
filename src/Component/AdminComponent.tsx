import React, { useEffect, useState } from "react";
import { getAllUsers } from "../Backend/Querries"; 
import { userType } from "../Types";

const AdminComponent = () => {
  const [users, setUsers] = useState<userType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await getAllUsers();
      setUsers(usersList);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  const renderUserRole = (role: { isAdmin: boolean; isManager: boolean; isUser: boolean }) => {
    if (role.isAdmin) return "Admin";
    if (role.isManager) return "Manager";
    if (role.isUser) return "User";
    return "Unknown";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Username</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2">{user.id}</td>
              <td className="py-2">{user.username}</td>
              <td className="py-2">{user.email}</td>
              <td className="py-2">{renderUserRole(user.userRole)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminComponent;
