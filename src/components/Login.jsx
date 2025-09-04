import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {   // ✅ accept setUser as prop
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      // ✅ login successful, now check session
      const sessionRes = await fetch("/api/check-session", {
        credentials: "include",
      });
      const sessionData = await sessionRes.json();

      if (sessionData.loggedIn) {
        setError("");
        setUser({ loggedIn: true, ...sessionData.user }); // ✅ update App state
        navigate("/");
      } else {
        setError("Session not established.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await fetch("/api/check-session", {
          credentials: "include",
        });
        const sessionData = await sessionRes.json();
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };

    checkSession();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl">
        <div className="flex flex-col items-center justify-center w-full">
          <img
            src="https://livelopez.gov.ph/wp-content/uploads/2025/09/lpmts-scaled.png"
            className="w-2/3"
            alt="Logo"
          />
          
        </div>
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Sign In
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="juan delacruz"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
