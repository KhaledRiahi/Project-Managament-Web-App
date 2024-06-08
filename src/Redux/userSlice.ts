import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { userType } from '../Types';

export const userStorageName = 'Portail Mazars';

export const defaultUser: userType = {
  id: '',
  username: '',
  email: '',
  isOnline: false,
  img: '',
  creationTime: '',
  lastSeen: '',
  bio: '',
  userRole: {
    isAdmin: false,
    isManager: false,
    isUser: true,
  },
};

type userStateType = {
  users: userType[];
  currentUser: {
    user: userType;
    isAuthenticated: boolean;
  };
  alertProps: {
    open: boolean;
    recieverId: string;
    recieverName: string;
  };
};

const initialState: userStateType = {
  users: [],
  currentUser: { user: { ...defaultUser }, isAuthenticated: false },
  alertProps: {
    open: false,
    recieverId: '',
    recieverName: '',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<userType>) => {
      const user = action.payload;
      localStorage.setItem(userStorageName, JSON.stringify(user));
      state.currentUser = { user, isAuthenticated: true };
    },
    setUsers: (state, action: PayloadAction<userType[]>) => {
      state.users = action.payload;
    },
    setAlertProps: (state, action: PayloadAction<{ open: boolean; recieverId?: string; recieverName?: string }>) => {
      const { open, recieverId = '', recieverName = '' } = action.payload;
      state.alertProps = {
        open,
        recieverId,
        recieverName,
      };
    },
  },
});

export const { setUser, setUsers, setAlertProps } = userSlice.actions;

export default userSlice.reducer;
