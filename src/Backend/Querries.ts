import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { auth, db, storage } from "./Firebase";
import { toastErr, toastSucc } from "../utils/toast";
import CatchErr from "../utils/catchErr";
import {
  authDataType,
  setLoadingType,
  userType,
  UserRoleType,
  Client,
  Member,
  Project,
} from "../Types";
import { NavigateFunction } from "react-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "@firebase/firestore";
import {
  defaultUser,
  setAlertProps,
  setUser,
  setUsers,
  userStorageName,
} from "../Redux/userSlice";
import { AppDispatch } from "../Redux/store";
import ConvertTime from "../utils/ConvertTime";


import { getFirestore } from "firebase/firestore";
import { toast } from "react-toastify";
import { uploadBytesResumable, getDownloadURL, ref as storageRef } from 'firebase/storage';
// collection names
const usersColl = "users";
const ClientsColl="Clients";
const MemberColl="Equipes";
const ProjectColl="Projets";

// register or signup a user
export const BE_signUp = (
  data: authDataType,
  setLoading: setLoadingType,
  reset: () => void,
  goTo: NavigateFunction,
  dispatch: AppDispatch
) => {
  const { email, password, confirmPassword } = data;

  // loading true
  setLoading(true);

  if (email && password) {
    if (password === confirmPassword) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async ({ user }) => {
          if (user?.email) { // Check if user.email exists
            const username = user.email.split("@")[0];

            const userInfo = await addUserToCollection(
              user.uid,
              user.email,
              username // Assign the username here
            );

            // Set creation time separately
            const userWithCreationTime: userType = {
              ...userInfo,
              creationTime: new Date().toISOString(), // Set creation time here
            };

            // set user in store
            dispatch(setUser(userWithCreationTime));

            setLoading(false);
            reset();
            goTo("/dashboard");
          } else {
            // Handle the case where user.email is null
            toastErr("User email not found", setLoading);
          }
        })
        .catch((err) => {
          CatchErr(err);
          setLoading(false);
        });
    } else {
      toastErr("Passwords must match!", setLoading);
    }
  } else {
    toastErr("Fields shouldn't be left empty!", setLoading);
  }
};

// sign in a user
export const BE_signIn = (
  data: authDataType,
  setLoading: setLoadingType,
  reset: () => void,
  goTo: NavigateFunction,
  dispatch: AppDispatch
) => {
  const { email, password } = data;

  // loading true
  setLoading(true);

  signInWithEmailAndPassword(auth, email, password)
    .then(async ({ user }) => {
      // update user isOnline to true
      await updateUserInfo({ id: user.uid, isOnline: true });

      // get user info
      const userInfo = await getUserInfo(user.uid);
      
      // set user in store
      dispatch(setUser(userInfo));

      setLoading(false);
      reset();
      
      goTo("/Header");
    })
    .catch((err) => {
      CatchErr(err);
      setLoading(false);
    });
};

// signout
export const BE_signOut = (
  dispatch: AppDispatch,
  goTo: NavigateFunction,
  setLoading: setLoadingType,
  deleteAcc?: boolean
) => {
  setLoading(true);
  // logout in firebase
  signOut(auth)
    .then(async () => {
      // set user offline
      if (!deleteAcc) await updateUserInfo({ isOffline: true });

      // set currentSelected user to empty user
      dispatch(setUser(defaultUser));

      // remove from local storage
      localStorage.removeItem(userStorageName);

      // route to auth page
      goTo("/");

      setLoading(false);
    })
    .catch((err) => CatchErr(err));
};

// get user from local storage
export const getStorageUser = () => {
  const usr = localStorage.getItem(userStorageName);

  try {
    if (usr) {
      const user = JSON.parse(usr);
      return user;
    } else {
      return null; // Or your preferred default user object
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    toastErr("An error occurred while retrieving user data.");
    return null; // Or your preferred default user object
  }
};

// get user role
export const getUserRole = (user: userType) => {
  if (!user) {
    return defaultUser.userRole; // Return default user role if no user info
  }

  return user.userRole; // Access and return the userRole object
};

// save user profile
export const BE_saveProfile = async (
  dispatch: AppDispatch,
  data: { email?: string; username?: string; password?: string; img?: string | File },
  setLoading: setLoadingType
) => {
  setLoading(true);

  const { email, username, password, img } = data;
  const id = getStorageUser().id;

  if (id) {
    // Update email if present
    if (email && auth.currentUser) {
      updateEmail(auth.currentUser, email)
        .then(() => {
          toastSucc("Email updated successfully!");
        })
        .catch((err) => toastErr("Error updating email: " + err));
    }

    // Update password if present
    if (password && auth.currentUser) {
      updatePassword(auth.currentUser, password)
        .then(() => {
          toastSucc("Password updated successfully!");
        })
        .catch((err) => toastErr("Error updating password: " + err));
    }

    // Update user collection only if username or img is present
    if (username || img) {
      let updatedData: { [key: string]: string } = {}; // Define the type of updatedData
      if (username) updatedData["username"] = username;
    
      // If img is a File, convert it to a data URL
      if (img instanceof File) {
        updatedData["img"] = await convertFileToDataUrl(img);
      } else if (typeof img === "string") {
        updatedData["img"] = img;
      }
    
      await updateUserInfo(updatedData);
      toastSucc("Profile updated successfully!");
    }

    // Get user latest info
    const userInfo = await getUserInfo(id);

    // Update user in state or store
    dispatch(setUser(userInfo));
    setLoading(false);
  } else {
    toastErr("Error: User ID not found");
  }
};

const updateUserInfo = async ({
  id,
  username,
  img,
  isOnline,
  isOffline,
}: {
  id?: string;
  username?: string;
  img?: string;
  isOnline?: boolean;
  isOffline?: boolean;
}) => {
  if (!id) {
    id = getStorageUser().id;
  }

  if (id) {
    await updateDoc(doc(db, usersColl, id), {
      ...(username && { username }),
      ...(isOnline && { isOnline }),
      ...(isOffline && { isOnline: false }),
      ...(img && { img }), // img:"someimage"
      lastSeen: serverTimestamp(),
    });
  }
};

const addUserToCollection = async (
  id: string,
  email: string,
  username: string,
  
) => {
  // create user with userId
  await setDoc(doc(db, usersColl, id), {
    isOnline: true,
    username,
    email,
    creationTime: serverTimestamp(),
    lastSeen: serverTimestamp(),
    bio: `${username},`,
    userRole:{ 
      isAdmin: false,
      isManager: true,
      isUser: true,
      
    }
  });

  return getUserInfo(id);
};




export const getUserInfo = async (id: string, setLoading?: setLoadingType): Promise<userType> => {
  if (setLoading) setLoading(true);
  const userRef = doc(db, usersColl, id);
  const user = await getDoc(userRef);

  if (user.exists()) {
    const { img, isOnline, username, email, bio, creationTime, lastSeen, userRole } = user.data();

    if (setLoading) setLoading(false);

    return {
      id: user.id,
      img,
      isOnline,
      username,
      email,
      bio,
      creationTime: creationTime ? ConvertTime(creationTime.toDate()) : "no date yet: userinfo",
      lastSeen: lastSeen ? ConvertTime(lastSeen.toDate()) : "no date yet: userinfo",
      userRole,
    };
  } else {
    if (setLoading) setLoading(false);
    toastErr("getUserInfo: user not found");
    return defaultUser;
  }
};

export const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getAllUsers = async (): Promise<userType[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, usersColl));
    const users: userType[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as userType;
      users.push({ ...userData, id: doc.id });
    });
    return users;
  } catch (error) {
    toastErr("Failed to fetch users");
    return [];
  }
};





///////////////////  CLIENT TABLE CRUD ///////////////




export const addClient = async (clientData: Client): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'ClientsColl'), {
      ...clientData,
      creationTime: serverTimestamp(),
    });
    toastSucc('Client added successfully');
    return docRef.id;
  } catch (error) {
    toastErr('Failed to add client');
    console.error(error);
    throw error;
  }
};

// Get all clients from the collection
export const getClients = async (): Promise<Client[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'ClientsColl'));
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() } as Client);
    });
    return clients;
  } catch (error) {
    toastErr('Failed to fetch clients');
    console.error(error);
    throw error;
  }
};

// Update a client in the collection
export const updateClient = async (id: string, updatedData: Partial<Client>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'ClientsColl', id), updatedData);
    toastSucc('Client updated successfully');
  } catch (error) {
    toastErr('Failed to update client');
    console.error(error);
    throw error;
  }
};

// Delete a client from the collection
export const deleteClient = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'ClientsColl', id));
    toastSucc('Client deleted successfully');
  } catch (error) {
    toastErr('Failed to delete client');
    console.error(error);
    throw error;
  }
};




//////////////////////////////// Add Member ////////////////////////////////////






// Upload file to storage and return download URL
const uploadFile = async (file: File, path: string): Promise<string> => {
  const s = storageRef(storage, path);
  const uploadTask = uploadBytesResumable(s, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      () => {},
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

// Add a new member
export const addMember = async (memberData: Member): Promise<string> => {
  try {
    const { certification, ...rest } = memberData;

    let certificationUrl = typeof certification === "string" ? certification : "";

    if (certification instanceof File) {
      certificationUrl = await uploadFile(certification, `members/${certification.name}`);
    }

    const docRef = await addDoc(collection(db, 'Equipes'), {
      ...rest,
      certification: certificationUrl,
      creationTime: serverTimestamp(),
    });

    toastSucc('Member added successfully');
    return docRef.id;
  } catch (error) {
    toastErr('Failed to add member');
    console.error(error);
    throw error;
  }
};

// Update an existing member
export const updateMember = async (id: string, updatedData: Partial<Member>): Promise<void> => {
  try {
    const { certification, ...rest } = updatedData;

    let certificationUrl = typeof certification === "string" ? certification : "";

    if (certification instanceof File) {
      certificationUrl = await uploadFile(certification, `members/${certification.name}`);
    }

    await updateDoc(doc(db, 'Equipes', id), {
      ...rest,
      ...(certificationUrl && { certification: certificationUrl }),
      lastUpdated: serverTimestamp(),
    });

    toastSucc('Member updated successfully');
  } catch (error) {
    toastErr('Failed to update member');
    console.error(error);
    throw error;
  }
};

// Delete a member
export const deleteMember = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'Equipes', id));
    toastSucc('Member deleted successfully');
  } catch (error) {
    toastErr('Failed to delete member');
    console.error(error);
    throw error;
  }
};

// Get all members
export const getMembers = async (): Promise<Member[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Equipes'));
    const members: Member[] = [];
    querySnapshot.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() } as Member);
    });
    return members;
  } catch (error) {
    toastErr('Failed to fetch members');
    console.error(error);
    throw error;
  }
};






////////////////////////////////// PROJECT MANAGAMENT /////////////////////////////////////////









export const uploadFile1 = async (file: File, path: string): Promise<string> => {
  const ref = storageRef(storage, path);
  const uploadTask = uploadBytesResumable(ref, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null,
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

const isFile = (value: any): value is File => {
  return value instanceof File;
};
export const addProject = async (projectData: Project): Promise<string> => {
  try {
    const { technicalOffer, BDC, ...rest } = projectData;

    let technicalOfferUrl: string | undefined;
    let BDCUrl: string | undefined;

    if (isFile(technicalOffer)) {
      technicalOfferUrl = await uploadFile1(technicalOffer, `projects/${technicalOffer.name}`);
    } else {
      technicalOfferUrl = technicalOffer;
    }

    if (isFile(BDC)) {
      BDCUrl = await uploadFile1(BDC, `projects/${BDC.name}`);
    } else {
      BDCUrl = BDC;
    }

    const docRef = await addDoc(collection(db, 'Projects'), {
      ...rest,
      technicalOffer: technicalOfferUrl,
      BDC: BDCUrl,
      creationTime: serverTimestamp(),
    });

    toast.success('Project added successfully');
    return docRef.id;
  } catch (error) {
    toast.error('Failed to add project');
    console.error(error);
    throw error;
  }
};



export const updateProject = async (id: string, updatedData: Partial<Project>): Promise<void> => {
  try {
    const { technicalOffer, BDC, ...rest } = updatedData;

    let technicalOfferUrl: string | undefined;
    let BDCUrl: string | undefined;

    if (isFile(technicalOffer)) {
      technicalOfferUrl = await uploadFile1(technicalOffer, `projects/${technicalOffer.name}`);
    } else {
      technicalOfferUrl = technicalOffer;
    }

    if (isFile(BDC)) {
      BDCUrl = await uploadFile1(BDC, `projects/${BDC.name}`);
    } else {
      BDCUrl = BDC;
    }

    await updateDoc(doc(db, 'Projects', id), {
      ...rest,
      technicalOffer: technicalOfferUrl,
      BDC: BDCUrl,
      lastUpdated: serverTimestamp(),
    });

    toast.success('Project updated successfully');
  } catch (error) {
    toast.error('Failed to update project');
    console.error(error);
    throw error;
  }
};






export const deleteProject = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'Projects', id));
    toast.success('Project deleted successfully');
  } catch (error) {
    toast.error('Failed to delete project');
    console.error(error);
    throw error;
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Projects'));
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project);
    });
    return projects;
  } catch (error) {
    toast.error('Failed to fetch projects');
    console.error(error);
    throw error;
  }
};





