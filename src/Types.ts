import { FieldValue } from '@firebase/firestore';

export type setLoadingType = React.Dispatch<React.SetStateAction<boolean>>;

export type authDataType = {
  email: string;
  password: string;
  confirmPassword?: string;
};

export type UserRoleType = {
  isAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
};

export type userType = {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
  img: string;
  creationTime?: string | FieldValue;
  lastSeen?: string | FieldValue;
  bio?: string;
  userRole: UserRoleType;
};

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

export interface Client {
  id?: string;
  clientName: string;
  sector: string;
  location: string;
  creationTime?: any;
}

interface Member {
  id?: string;
  name: string;
  email: string;
  cvShort?: File | string;
  cvLong?: File | string;
  [key: string]: any;
}