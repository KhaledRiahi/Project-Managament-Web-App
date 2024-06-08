import React, { useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { BE_signIn, BE_signUp, getStorageUser } from "../Backend/Querries";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../Redux/store";
import { authDataType, userType } from "../Types";
import { setUser } from "../Redux/userSlice";

const Login = () => {
  const [login, setLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const usr = getStorageUser();

  useEffect(() => {
    if (usr?.id) {
      dispatch(setUser(usr));
      navigateToDashboardOrAdmin(usr);
    }
  }, []);

  const handleSignup = () => {
    const data: authDataType = { email, password, confirmPassword };
    auth(data, BE_signUp, setSignUpLoading);
  };

  const handleSignin = () => {
    const data: authDataType = { email, password };
    auth(data, BE_signIn, setSignInLoading);
  };

  const auth = (
    data: authDataType,
    func: any,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    func(data, setLoading, reset, navigateToDashboardOrAdmin, dispatch);
  };

  const navigateToDashboardOrAdmin = (user: userType) => {
    if (user.userRole?.isAdmin) {
      navigate("/admin");
    } else if (user.userRole?.isUser || user.userRole?.isManager) {
      navigate("/Header");
    }
  };

  const reset = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="w-full md:w-[450px]">
      <div className="text-center mb-4">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/base-f2884.appspot.com/o/Mazarslogo.png?alt=media&token=63fbb653-2eb5-42a8-a1dd-b7ce7a9d956c"
          alt="Mazars Logo"
          className="mx-auto h-300 w-300"
        />
      </div>
      <h1 className="text-white text-center font-bold text-4xl md:text-6xl mb-10">
        {login ? "Login" : "Register"}
      </h1>
      <div className="flex flex-col gap-3 bg-white w-full p-6 min-h-[150px] rounded-xl drop-shadow-xl">
        <Input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!login && (
          <Input
            name="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        {login ? (
          <>
            <Button
              text="Login"
              onClick={handleSignin}
              loading={signInLoading}
            />
            <Button onClick={() => setLogin(false)} text="Register" secondary />
          </>
        ) : (
          <>
            <Button
              text="Register"
              onClick={handleSignup}
              loading={signUpLoading}
            />
            <Button onClick={() => setLogin(true)} text="Login" secondary />
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
