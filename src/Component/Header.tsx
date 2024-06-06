import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../Redux/store';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { useNavigate } from 'react-router-dom';
import { BE_signOut } from "../Backend/Querries";
import Spinner from './Spinner';
import { setUser } from '../Redux/userSlice';
import ExampleWithProviders from "./ClientTable" // Import your table component

const Header: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser.user);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showTable, setShowTable] = useState(false); // State to show/hide the table
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    BE_signOut(dispatch, goTo, setLogoutLoading);
  };
  
  const handleAddClient = () => {
    // Toggle the state to show/hide the table
    setShowTable(!showTable);
  };

  return (
    <div>
      <Sidebar>
        <Menu>
          {currentUser.userRole.isAdmin && (
            <MenuItem>Admin Dashboard</MenuItem>
          )}
          {(currentUser.userRole.isManager || currentUser.userRole.isUser) && (
            <SubMenu label="Project Management">
              <MenuItem onClick={handleAddClient}>Add Client</MenuItem> {/* Call handleAddClient on click */}
              <MenuItem>Add Members</MenuItem>
              <MenuItem>Add Project</MenuItem>
            </SubMenu>
          )}
          <MenuItem>Documentation</MenuItem>
          <MenuItem>Calendar</MenuItem>
          <MenuItem onClick={handleSignOut}>
            {logoutLoading ? <Spinner /> : 'Sign Out'}
          </MenuItem>
        </Menu>
      </Sidebar>
      {showTable && <ExampleWithProviders />} {/* Conditionally render the table */}
    </div>
  );
};

export default Header;
