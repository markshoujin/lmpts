import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // ✅ icons

function DashboardLayout({ setUser }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Logout
  const logout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setUser?.({ loggedIn: false });
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ✅ Session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        await fetch("/api/check-session", {
          credentials: "include",
        });
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };

    checkSession();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 h-screen bg-blue-800 text-white flex flex-col transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex`}
      >
        {/* Logo */}
        <div className="flex justify-center items-center pt-4">
          <img
            src="https://livelopez.gov.ph/wp-content/uploads/2025/09/lpmts2-scaled.png"
            alt="Logo"
            className="w-32"
          />
        </div>

        {/* Sidebar Header */}
        <div className="p-6 text-2xl font-bold flex justify-between items-center">
          Menu
          {/* Close button (mobile only) */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul>
            <li
              className="px-6 py-3 hover:bg-blue-700 cursor-pointer"
              onClick={() => {
                navigate("/");
                setIsSidebarOpen(false);
              }}
            >
              Home
            </li>
            <li
              className="px-6 py-3 hover:bg-blue-700 cursor-pointer"
              onClick={() => {
                navigate("/add-record");
                setIsSidebarOpen(false);
              }}
            >
              Add Record
            </li>
            <li
              className="px-6 py-3 hover:bg-blue-700 cursor-pointer"
              onClick={() => {
                navigate("/profile");
                setIsSidebarOpen(false);
              }}
            >
              Profile
            </li>
            <li
              className="px-6 py-3 hover:bg-blue-700 cursor-pointer"
              onClick={() => {
                logout();
                setIsSidebarOpen(false);
              }}
            >
              Logout
            </li>
          </ul>
        </nav>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex items-center mb-6">
          {/* Burger button (mobile only) */}
          <button
            className="md:hidden text-blue-800 mr-4"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={28} />
          </button>

          {/* Logo (mobile only) */}
          <img
            src="https://livelopez.gov.ph/wp-content/uploads/2025/09/lpmts-scaled.png"
            alt="Mobile Logo"
            className="w-32 md:hidden"
          />
        </header>

        {/* Outlet renders nested pages */}
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
