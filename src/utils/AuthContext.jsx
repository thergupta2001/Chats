import { createContext, useState, useEffect, useContext } from "react";
import { account } from "../appwriteConfig";
import { Navigate, useNavigate } from "react-router-dom";
import { ID } from "appwrite";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserOnLoad();
  }, []);

  const getUserOnLoad = async () => {
    try {
      const accountDetails = await account.get();
      setUser(accountDetails);
      console.log(accountDetails);
    } catch (error) {
      console.info(error);
    }

    setLoading(false);
  };

  const handleUserLogin = async (e, credentials) => {
    e.preventDefault();

    try {
      const response = await account.createEmailSession(
        credentials.email,
        credentials.password
      );
      console.log("LOGGED:", response);
      const accountDetails = await account.get();
      setUser(accountDetails);

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserLogout = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  const handleUserRegister = async (e, credentials) => {
    e.preventDefault();

    if (credentials.password1 !== credentials.password2) {
      alert("Passwords do not match!");
    }

    if (credentials.password1.length < 8) {
      alert("Password size should be of at least 8 characters!");
    }

    try {
      let response = await account.create(
        ID.unique(),
        credentials.email,
        credentials.password1,
        credentials.name
      );

      await account.createEmailSession(credentials.email, credentials.password1)
      const accountDetails = await account.get()
      console.log('Account Details: ', accountDetails)
      setUser(accountDetails)
      navigate('/')

      console.log("registered", response);
    } catch (error) {
      console.error(error);
    }
  };

  const contextData = {
    user,
    handleUserLogin,
    handleUserLogout,
    handleUserRegister,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
