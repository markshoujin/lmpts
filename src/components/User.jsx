import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function User() {
  const [username] = useState("john_doe"); // Example username
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState({ loggedIn: false });
  const [error, setError] = useState("");
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await fetch("/api/check-session", {
          credentials: "include",
        });
        const sessionData = await sessionRes.json();

        if (sessionData.loggedIn) {
          setUser({ loggedIn: true, ...sessionData.user }); // ✅ update App state
        } else {
          setError("Session not established.");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    checkSession();
  }, []); 
  console.log(user)
  const handleSubmit = async (e) => {
  e.preventDefault();
setLoading(true)
await new Promise((resolve) => setTimeout(resolve, 2000));
  if (!currentPassword || !newPassword || !confirmPassword) {
    setMessage("Please fill out all fields.");
    setLoading(false)
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage("New passwords do not match.");
    setLoading(false)
    return;
  }
  
  try {
    const res = await fetch("/api/updateAccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username:user.username,          // this should come from logged-in user/session
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Failed to update password."); 
      setLoading(false)
           return;
    }

    setMessage(data.message || "Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false)
     await new Promise((resolve) => setTimeout(resolve, 2000));
     navigate("/");
  } catch (err) {
    console.error("Error:", err);
    setMessage("Something went wrong. Please try again.");
    setLoading(false)
  }
};

console.log(currentPassword,newPassword,confirmPassword)
  return (
<div className="min-h-screen flex items-center justify-center bg-gray-50">
  <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md border border-neutral-200/60">
    <h2 className="text-2xl font-semibold text-center mb-6">Profile</h2>

    {message && (
  <p
    className={`mb-4 text-center text-sm font-medium ${
      message === "Password updated successfully!"
        ? "text-green-500"
        : "text-red-600"
    }`}
  >
    {message}
  </p>
)}

    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Username (read-only) */}
      <div>
        <label className="block text-sm font-semibold mb-1">Username</label>
        <input
          type="text"
          value={user.username}
          readOnly
          className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
        />
      </div>

      {/* Current Password */}
      <div>
        <label className="block text-sm font-semibold mb-1">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        />
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-semibold mb-1">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold mb-1">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        />
      </div>

      {/* Update button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl text-sm font-medium shadow hover:bg-blue-500 transition"
      >
           {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  </div>
</div>

  );
}
