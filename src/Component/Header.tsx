import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../Redux/store';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { setUser as setUserAction } from '../Redux/userSlice';
import { BE_signOut } from '../Backend/Querries';
import Spinner from './Spinner';
import ExampleWithProviders from './ClientTable'; // Import your table component
import MemberTable from './AddMember'; // Import the MemberTable component
import { userType } from '../Types';
import TableProject from "./AddProjet";
import '../Assets/custom.css'; // Import your custom styles

// Import Mazars logo
import MazarsLogo from '../Assets/MazarsLogo.png';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showClientTable, setShowClientTable] = useState(false);
  const [showMemberTable, setShowMemberTable] = useState(false);
  const [showProjectTable, setShowProjectTable] = useState(false);
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Convert Firebase User to userType
        const customUser: userType = {
          id: user.uid,
          username: user.displayName || '',
          email: user.email || '',
          isOnline: true,
          img: user.photoURL || '',
          creationTime: user.metadata.creationTime || '',
          lastSeen: new Date().toISOString(),
          bio: '',
          userRole: {
            isAdmin: false, // Default role, you can adjust this as needed
            isManager: false,
            isUser: true,
          },
        };
        dispatch(setUserAction(customUser));
      } else {
        navigate('/login'); // Redirect to login if user is not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate, dispatch]);

  const handleSignOut = async () => {
    setLogoutLoading(true);
    await BE_signOut(dispatch, navigate, setLogoutLoading);
    setLogoutLoading(false);
  };

  const handleAddClient = () => {
    setShowClientTable(true);
    setShowMemberTable(false);
    setShowProjectTable(false);
  };

  const handleAddMember = () => {
    setShowMemberTable(true);
    setShowClientTable(false);
    setShowProjectTable(false);
  };
  const handleAddtable = () => {
    setShowMemberTable(false);
    setShowClientTable(false);
    setShowProjectTable(true);
    console.log("Porject Table");
    

  };
  const currentUser = useSelector((state: RootState) => state.user.currentUser.user);

  if (!currentUser) {
    return <Spinner />; // Show a loading spinner while checking auth state
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar className="h-screen flex flex-col justify-between bg-myBlue  ">
        <div className="p-4 flex items-center">
          <img src={MazarsLogo} alt="Mazars Logo" className="w-15 h-15 mr-2" />
          
        </div>
        <Menu>
          {currentUser.userRole.isAdmin && (
            <MenuItem>Admin Dashboard</MenuItem>
          )}
          {(currentUser.userRole.isManager || currentUser.userRole.isUser) && (
            <SubMenu label="Project Management">
              <MenuItem onClick={handleAddClient}>Add Client</MenuItem>
              <MenuItem onClick={handleAddMember}>Add Members</MenuItem>
              <MenuItem onClick={handleAddtable}>Add Project</MenuItem>
            </SubMenu>
          )}
          <MenuItem>Documentation</MenuItem>
          <MenuItem>Calendar</MenuItem>
          <MenuItem onClick={handleSignOut} className="hover:text-white hover:bg-gray-600">
            {logoutLoading ? <Spinner /> : 'Sign Out'}
          </MenuItem>
        </Menu>
      </Sidebar>

      {/* Content area */}
      <div className="flex-grow p-6">
        {showClientTable && <ExampleWithProviders />} {/* Conditionally render the client table */}
        {showMemberTable && <MemberTable user={currentUser} />}
        {showProjectTable && <TableProject />} 
      </div>
    </div>
  );
};

export default Header;
