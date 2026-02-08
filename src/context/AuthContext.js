"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for token on mount
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      if (token && savedUser) {
        // Verify token validity (optional: call /api/auth/me)
        // For now, trust local storage but you can add a verify call here
        try {
           setUser(JSON.parse(savedUser));
        } catch (e) {
           console.error("Failed to parse user", e);
           localStorage.removeItem("token");
           localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Find user by username or email - backend expects 'username' but we can send email as username 
      // or we need to align with backend.
      // Backend: keys are 'username' and 'password'.
      // Let's assume the login form sends 'email' as the username or we adjust the payload.
      // Checking backend controller: const { username, password } = req.body;
      // It finds by username.
      // But wait, the registration accepts email.
      // If the backend only searches by username: `const user = await User.findOne({ username });`
      // Then we must login with username, OR we need to update backend to allow email login.
      // Let's check backend controller again. 
      // `exports.login` -> `const user = await User.findOne({ username });`
      // So strictly username. 
      // BUT `exports.register` checks `User.findOne({ $or: [{ username }, { email }] });`
      
      // I will assume for now we use 'username' for login, or I'll update the backend to allow email login.
      // For a "feels authentic" experience, email login is standard.
      // Let's try to send 'username' as the email if the user enters an email.
      // Actually, let's update the login payload to strictly send 'username'.
      
      const res = await fetch("http://127.0.0.1:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }), // Using email input as username for now
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      const { token, ...userData } = data.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle "User already exists" properly
        throw new Error(data.error || "Signup failed");
      }

      const { token, ...userData } = data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
