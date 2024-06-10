import { FieldValue } from '@firebase/firestore';
//import { File } from 'react-dropzone';
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
  name: string | number | readonly string[] | undefined;
  id?: string;
  clientName: string;
  sector: string;
  location: string;
  creationTime?: any;
}

export type Member = {
  id: string;
  name: string;
  experience: number;
  position: string;
  certification: string | File;
  speciality: string;
  diploma: string;
  projects: string;
  creationTime?: Date;
  lastUpdated?: Date;
};
export type Project = {
  id: string;
  projectName: string;
  clientName: { Name: string; ClientAdress: string }[];
  mazars: { Name: string }[];
  interventionTeam: { name: string; role: string; ChefOfProject: string; technicalConsultant: string }[];
  projectDuration: string;
  completionDate: string;
  orderYear: string;
  startDate: string;
  partnerNames: string;
  serviceDescription: string;
  missionDeliverables: string;
  technicalOffer?: string;
  BDC?: string;
  PV?:string;
};
