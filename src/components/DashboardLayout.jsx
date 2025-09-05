import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; // ✅ icons

function DashboardLayout({setUser}) {

  const [user, setLocalUser] = useState({ loggedIn: false }); 
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await fetch("/api/check-session", {
          credentials: "include",
        });
        const sessionData = await sessionRes.json();

        if (sessionData.loggedIn) {
          const userData = { loggedIn: true, ...sessionData.user };
          setLocalUser(userData); // Update local state
          setUser?.(userData); // Update parent state if prop exists
        } else {
          setError("Session not established.");
        }
      } catch (err) {
        setError(err.message);
        console.error("Session check failed:", err);
      }
    };

    checkSession();
  }, [setUser]);


  // ✅ Logout function
  const logout = async () => {
    try {
      const res = await fetch("/api/logout", { 
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        const loggedOutState = { loggedIn: false };
        setLocalUser(loggedOutState); 
        setUser?.(loggedOutState); 
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (

    
 
    <div className="flex flex-col h-screen bg-[#33A1E0] overflow-hidden">
       <header className="flex items-center  h-16 ">

        <div class="w-[50%] h-full flex justify-start px-4 items-center lg:hidden">
         <button
            className=" text-white "
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
         

          <div className="hidden justify-center items-center  h-full w-72 lg:flex">
            <img
                src="https://livelopez.gov.ph/wp-content/uploads/2025/09/lpmts2-scaled.png"
                alt="Logo"
                className="w-52 h-auto "
              />
          </div>

          <div class="flex flex-row justify-end w-[50%] lg:w-full p-4 bg-transparent lg:bg-[#33A1E0] text-gray-600 lg:text-white rounded-sm ">
            {/* <div class="font-bold text-lg">
              Dashboard
            </div> */}

           <div class="relative group">
              <div class="flex flex-row gap-2 items-center justify-between cursor-pointer h-full">
                <svg class="fill-white lg:fill-white" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                  <path d="M12 2C6.579 2 2 6.579 2 12s4.579 10 10 10 10-4.579 10-10S17.421 2 12 2zm0 5c1.727 0 3 1.272 3 3s-1.273 3-3 3c-1.726 0-3-1.272-3-3s1.274-3 3-3zm-5.106 9.772c.897-1.32 2.393-2.2 4.106-2.2h2c1.714 0 3.209.88 4.106 2.2C15.828 18.14 14.015 19 12 19s-3.828-.86-5.106-2.228z"></path>
                </svg>
                <p class="hidden lg:block" >Hi, <span class="font-semibold">{user.username}</span></p>
                <svg class="fill-white hidden lg:block" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
                </svg>
              </div>

              <div class="absolute right-0 w-40 bg-white text-gray-800 border rounded-md  hidden group-hover:block">
                <ul class="p-2 space-y-1">
                  <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-sm" onClick={() => {
                  navigate("/profile");
                  setIsSidebarOpen(false);
                }}>Profile</li>
                  <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-sm" onClick={() => {
                  logout();
                  setIsSidebarOpen(false);
                }}>Logout</li>
                </ul>
              </div>
            </div>

          </div>
        </header>


     
      
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex flex-row overflow-hidden  gap-2 ">

        {/* Sidebar */}
        <aside
          className={`w-80 lg:h-[calc(100vh-64px)] bg-[#33A1E0] text-white flex flex-col transform transition-transform duration-300 z-50 lg:block absolute top-0 h-screen
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:flex`}
        >
          {/* Logo */}
          <div className="flex items-center justify-start px-2 py-4 lg:hidden ">
            <img
              src="https://livelopez.gov.ph/wp-content/uploads/2025/09/lpmts2-scaled.png"
              alt="Logo"
              className="w-56 h-auto "
            />
          </div>
          

          <div class="flex flex-col gap-4 lg:mt-6 mt-2">
            {/* Sidebar Header */}
            <div className=" flex justify-between items-center  px-6">
              <p class="text-xl font-bold">Menu</p>

              {/* Close button (mobile only) */}
              <button
                className="lg:hidden text-white "
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={30} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 w-full flex ">
              <ul class="w-full flex flex-col gap-1">
                <li
                  className=" hover:bg-[#1F7AB2]  cursor-pointer flex flex-row gap-2 px-6 py-2 "
                  onClick={() => {
                    navigate("/");
                    setIsSidebarOpen(false);
                  }}
                >
                  <svg class="fill-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm-1 7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7zm1-10h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z"></path></svg>

                <span>Dashboard</span>
                </li>
                <li
                  className="hover:bg-[#1F7AB2] cursor-pointer flex flex-row gap-2 px-6 py-2"
                  onClick={() => {
                    navigate("/add-record");
                    setIsSidebarOpen(false);
                  }}
                >
                  <svg class="fill-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 22h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zm7-18 5 5h-5V4zM8 14h3v-3h2v3h3v2h-3v3h-2v-3H8v-2z"></path></svg>

                  <span>New Record</span>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

       

        {/* Outlet renders nested pages */}
       <div class="p-2  h-[calc(100vh-64px)]  w-full">
        <div class="bg-white h-full rounded-lg overflow-y-auto p-2">
         <Outlet />
        </div>
        
       </div>
      </main>
    </div>
  );
}

export default DashboardLayout;