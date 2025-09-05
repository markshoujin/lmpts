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

const [messageType, setMessageType] = useState("");

  useEffect(() => {
    document.title = "LMPTS | User Profile";
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
  setMessageType("error");
  setLoading(false);
  return;
}

if (newPassword !== confirmPassword) {
  setMessage("New passwords do not match.");
  setMessageType("error");
  setLoading(false);
  return;
}

try {
  const res = await fetch("/api/updateAccount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: user.username,
      currentPassword,
      newPassword,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setMessage(data.message || "Failed to update password.");
    setMessageType("error");
    setLoading(false);
    return;
  }

  setMessage(data.message || "Password updated successfully!");
  setMessageType("success");
  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");
  setLoading(false);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  navigate("/");
} catch (err) {
  console.error("Error:", err);
  setMessage("Something went wrong. Please try again.");
  setMessageType("error");
  setLoading(false);
}
};

// console.log(currentPassword,newPassword,confirmPassword)


  return (
      <div className="h-auto lg:h-[calc(100ch-80px)] flex items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md border border-neutral-200/60 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center">Profile Settings</h2>

            {message && (
              <p
                className={`border py-2 rounded-md border-l-4 text-center text-sm font-medium ${
                  messageType === "success"
                    ? "text-green-700 bg-green-100 border-green-500"
                    : "text-red-700 bg-red-100 border-red-500"
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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl text-sm font-medium shadow hover:bg-blue-500 transition flex items-center justify-center"
            >
              {loading ? (
                <>
                  <span className="loaders"></span>
                </>
              ) : (
                "Update Password"
              )}
            </button>

          </form>
        </div>
      </div>

  );
}