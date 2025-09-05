import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {   // ✅ accept setUser as prop
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  

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
    document.title = "LMPTS | Login";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div>
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center w-full ">
            <img
              src="https://livelopez.gov.ph/wp-content/uploads/2025/09/lpmts-scaled.png"
              className="w-2/3 h-auto"
              alt="Logo"
            />

            <h2 className="text-3xl font-bold text-center text-[#33A1E0] w-full">
              Sign In
            </h2>

            
          </div>
        
          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg border-l-4 border-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Username
              </label>
              <input
                type="text"
                className="w-full mt-1 px-4 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="juan delacruz"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full mt-1 px-4 py-2 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    // Eye Off Icon
                  <svg class="w-6 h-6 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                  </svg>

                  ) : (
                    // Eye Icon
                    <svg class="w-6 h-6 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-width="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
                      <path stroke="currentColor" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>

                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#33A1E0] text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-[#1F7AB2] transition-colors" 
            >
              Login
            </button>
          </form>
        </div>
        <div>
          <p className="text-center text-sm text-gray-500 mt-4">
            &copy; {new Date().getFullYear()} Livelopez Municipal Police
            Traffic System. All rights reserved | v1.0.0
          </p>  
        </div>
      </div>
    </div>
  );
}

export default Login;