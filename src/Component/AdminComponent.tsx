import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllUsers, addUserWithAuth, updateUserRole, deleteUser1 } from "../Backend/Querries";
import { BE_signOut } from "../Backend/Querries";
import { setUser as setUserAction } from "../Redux/userSlice";
import { userType, UserRoleType } from "../Types";
import Spinner from "./Spinner"; // Assuming you have a Spinner component
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Backend/Firebase"; // Import your Firestore instance

const AdminComponent = () => {
  const [users, setUsers] = useState<userType[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [newUser, setNewUser] = useState<Omit<userType, "id" | "email">>({
    username: '',
    isOnline: false,
    img: '',
    userRole: {
      isAdmin: false,
      isManager: false,
      isUser: true,
    },
  });
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState<UserRoleType | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await getAllUsers();
      setUsers(usersList);
      setLoading(false);
    };

    const checkAdmin = async (userId: string) => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists() && userDoc.data().userRole.isAdmin) {
        fetchUsers();
      } else {
        navigate('/'); // Redirect to home if not an admin
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdmin(user.uid);
      } else {
        setLoading(false);
        navigate('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleSignOut = async () => {
    setLogoutLoading(true);
    await BE_signOut(dispatch, navigate, setLogoutLoading);
    setLogoutLoading(false);
  };

  const handleAddUser = async () => {
    try {
      await addUserWithAuth(newUserEmail, newUserPassword, newUser);
      const updatedUsers = await getAllUsers(); // Refresh the user list
      setUsers(updatedUsers);
      setNewUser({
        username: '',
        isOnline: false,
        img: '',
        userRole: {
          isAdmin: false,
          isManager: false,
          isUser: true,
        },
      });
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const handleUpdateUserRole = async () => {
    if (selectedUserId && selectedUserRole) {
      try {
        await updateUserRole(selectedUserId, selectedUserRole);
        const updatedUsers = users.map(user => user.id === selectedUserId ? { ...user, userRole: selectedUserRole } : user);
        setUsers(updatedUsers);
        setSelectedUserId(null);
        setSelectedUserRole(null);
      } catch (error) {
        console.error("Error updating user role: ", error);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser1(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  const renderUserRole = (role: { isAdmin: boolean; isManager: boolean; isUser: boolean }) => {
    if (role.isAdmin) return "Admin";
    if (role.isManager) return "Manager";
    if (role.isUser) return "User";
    return "Unknown";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          {logoutLoading ? <Spinner /> : "Sign Out"}
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-bold">Add New User</h3>
        <label htmlFor="newUserEmail">Email</label>
        <input
          id="newUserEmail"
          type="email"
          placeholder="Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
        />
        <label htmlFor="newUserPassword">Password</label>
        <input
          id="newUserPassword"
          type="password"
          placeholder="Password"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
        />
        <label htmlFor="newUsername">Username</label>
        <input
          id="newUsername"
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <button onClick={handleAddUser} className="bg-green-500 text-white px-4 py-2 rounded">
          Add User
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-bold">Update User Role</h3>
        <label htmlFor="userSelect">Select User</label>
        <select id="userSelect" onChange={(e) => setSelectedUserId(e.target.value)} value={selectedUserId || ''}>
          <option value="" disabled>Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <label htmlFor="roleSelect">Select Role</label>
        <select id="roleSelect" onChange={(e) => setSelectedUserRole(JSON.parse(e.target.value))} value={JSON.stringify(selectedUserRole) || ''}>
          <option value="" disabled>Select Role</option>
          <option value='{"isAdmin":true,"isManager":false,"isUser":true}'>Admin</option>
          <option value='{"isAdmin":false,"isManager":true,"isUser":true}'>Manager</option>
          <option value='{"isAdmin":false,"isManager":false,"isUser":true}'>User</option>
        </select>
        <button onClick={handleUpdateUserRole} className="bg-blue-500 text-white px-4 py-2 rounded">
          Update Role
        </button>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Username</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2">{user.id}</td>
              <td className="py-2">{user.username}</td>
              <td className="py-2">{user.email}</td>
              <td className="py-2">{renderUserRole(user.userRole)}</td>
              <td className="py-2">
                <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white px-4 py-2 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminComponent;
