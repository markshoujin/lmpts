import React from 'react'
import { useNavigate } from 'react-router-dom';

function LogoutButton({ setUser }) {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setUser?.(null);
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <li
      className="px-6 py-3 hover:bg-blue-700 cursor-pointer"
      onClick={logout}
    >
      Logout
    </li>
  );
}


export default LogoutButton
