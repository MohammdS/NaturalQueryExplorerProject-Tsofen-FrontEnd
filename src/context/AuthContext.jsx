import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { meFetch, signinFetch, signupFetch } from "../fetchers/authFetch";
import { getToken, saveToken, clearToken } from "../fetchers/apiFetch";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const u = await meFetch();
      setUser(u);
    } catch (e) {
      // token invalid
      setUser(null);
      clearToken();
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function signin(credentials) {
    setError(null);
    const data = await signinFetch(credentials);
    if (data?.token) {
      saveToken(data.token);
      setToken(data.token);
      loadUser();
    }
    return data;
  }

  async function signup(payload) {
    setError(null);
    const data = await signupFetch(payload);
    // signup returns message only (verification expected) - token handled on verify
    return data;
  }

  function setVerifiedToken(newToken) {
    saveToken(newToken);
    setToken(newToken);
    loadUser();
  }

  function signout() {
    clearToken();
    setToken(null);
    setUser(null);
  }

  const value = {
    token,
    user,
    loading,
    error,
    signin,
    signup,
    setVerifiedToken,
    signout,
    reloadUser: loadUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
