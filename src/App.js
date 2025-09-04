import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import MainUI from "./components/MainUI";
import AddRecord from "./components/AddRecord";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import User from "./components/User";

function App() {
  const [user, setUser] = useState({ loggedIn: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/check-session", {
          credentials: "include",
        });
        const data = await res.json();

        if (data.loggedIn) {
          setUser({ loggedIn: true, ...data.user });
        } else {
          setUser({ loggedIn: false });
        }
      } catch (err) {
        console.error("Session check failed:", err);
        setUser({ loggedIn: false });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <div>Loading session...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={
            user.loggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <Login setUser={setUser} />
            )
          }
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute user={user.loggedIn} />}>
          <Route
            path="/"
            element={<DashboardLayout setUser={setUser} />}
          >
            <Route index element={<MainUI />} />
            <Route path="add-record" element={<AddRecord />} />
            <Route path="profile" element={<User />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
