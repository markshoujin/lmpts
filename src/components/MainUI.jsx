import  { useEffect, useMemo, useState, useRef  } from "react";
import html2pdf from "html2pdf.js";
import { IoIosWarning } from "react-icons/io";
import { FaUsers } from "react-icons/fa";
import { MdPaid } from "react-icons/md";
function MainUI() {
  const [records, setRecords] = useState([]);
  const [pending, setPending] = useState([]);
  const [expired, setExpired] = useState([]);
  const [violationCounts, setViolationCounts] = useState({});
  const [violationOffense,setviolationOffense] = useState([])
  const [search, setSearch] = useState("");
  const [tableView, setTableView] = useState("all"); // "all", "pending", "expired"
 const [selectedClient, setSelectedClient] = useState(null);
  const [isViewViolationOpen, setIsViewViolationOpen] = useState(false);
  const [violations, setViolations] = useState([]);
  const [penaltyValue, setPenaltyValue] = useState(null);
  const [error, setError] = useState(null);
 const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
const [offenseCounts, setOffenseCounts] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
const [orNumber, setOrNumber] = useState("");

const [currentPage, setCurrentPage] = useState({
  all: 1,
  pending: 1,
  expired: 1,
});

const recordsPerPage = 10;

  function toOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
const handleTableViewChange = (view) => {
  setTableView(view);
  setCurrentPage((prev) => ({ ...prev, [view]: 1 }));
};

// fetch offenses when pending changes
useEffect(() => {
  document.title = "LMPTS | Dashboard";
  const fetchAllOffenses = async () => {
    const counts = {};
    for (let client of pending) {
      const res = await fetch("/api/getOffense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: client.name ? client.name : "" }),
      });
      const data = await res.json();
      counts[client.name] = data.length;
    }
    setOffenseCounts(counts);
  };

  if (pending.length > 0) {
    fetchAllOffenses();
  }
}, [pending]);

// confirm payment
const confirmPay = async () => {
  setLoading(true);
  try {
    const response = await fetch("/api/addPayment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...selectedClient,
        paymentDate,
        orNumber,
      }),
    });

    if (!response.ok) throw new Error("Payment failed");

    alert("Payment successful!");
    setShowConfirm(false);
    handleCloseModal();
    window.location.reload();
  } catch (error) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};

const handleViewClick = async (client) => {
  setSelectedClient(client); 
  setIsViewViolationOpen(true);
  setLoading(true);
  setError(null);
  try {
    const response = await fetch("/api/getViolationOffense", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: client.name }),
  });

    if (!response.ok) throw new Error("Failed to fetch offenses");

    const offenseData = await response.json();
    console.log(offenseData)
    console.log("Client",client)
    // ✅ Filter only where idNo matches the client
    const clientOffenses = offenseData.filter(
      (offense) => offense.idNo === client.idNo
    );

    setViolations(clientOffenses); // ✅ save to state
  
    // Fetch penalty value
    const penaltyResponse = await fetch("/api/getPenaltyValue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_idNo: client.idNo }),
    });

    if (!penaltyResponse.ok) throw new Error("Failed to fetch penalty");
    const penaltyData = await penaltyResponse.json();

    setPenaltyValue(penaltyData? penaltyData : null);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  
// modal openers
const handlePay = async () => {
  setShowConfirm(true);
};

const handleViewClient = (client) => {
  setSelectedClient(client);
  setShowConfirm(true)
};

const handlePrintClient = async (client) => {
  // Create a temporary container
   const violations = getViolations(client);
  const formattedViolations = violations.length > 0 
    ? violations.join(", ") 
    : "None";

const date = new Date(); // or new Date("2025-08-20")

// Day with suffix
const dayNum = date.getDate();
const getDaySuffix = (d) => {
  if (d > 3 && d < 21) return "th";
  switch (d % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};
const day = dayNum + getDaySuffix(dayNum); 
const month = date.toLocaleString("default", { month: "long" }); 
const year = date.getFullYear(); 

 try {
    const response = await fetch("/api/getViolationOffense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: client.name }),
    });

    if (!response.ok) throw new Error("Failed to fetch offense");

     const penaltyValue = await fetch("/api/getPenaltyValue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_idNo: client.idNo }),
    });

    if (!response.ok) throw new Error("Failed to fetch offense");
    if (!penaltyValue.ok) throw new Error("Failed to fetch penalty");
    const data = await response.json();
    const penalty = await penaltyValue.json();
    setviolationOffense(prev => [
      ...prev,   
      ...data    
    ]);
      const clientName = client.name; 
      const offenseNumber = offenseCounts[clientName] || 0; 
      const element = document.createElement("div");
      element.innerHTML = `
        <div style="width:210mm; box-sizing:border-box; padding:20px; font-family: Arial, sans-serif;">
          <!-- Header Section -->
          <div style="display:flex;flex-direction:row;justify-content:center;align-items:center;padding-top:20px;padding-bottom:20px;background-color:#9BC2E6;box-sizing:border-box;gap:50px;">
            <div>  
              <img 
              src="./MTOLogo.png" 
                alt="Municipal Logo" 
                style="width:100px;background-color:#FFF;border-radius:50%;" 
              />
            </div>
            <div>
              <p style="font-size:12px;margin:0;">Republic of the Philippines</p>
              <p style="font-size:12px;margin:0;">Province of Quezon</p>
              <p style="font-size:12px;margin:0;">Municipality of Lopez</p>
              <h2 style="font-size:16px;margin:0;">MUNICIPAL TREASURER'S OFFICE</h2>
              <p style="font-size:12px;margin:0;">Contact No. 09300753517</p>
              <p style="font-size:8px;margin:0;">Address: Maharlika Hi-way Brgy. Talolong G/F Municipal Building Lopez, Quezon 4</p>
            </div>
          </div>

          <h2 style="color: #333;
        text-align: center;
        font-size: 42px;
        font-family: 'EB Garamond', serif;
        font-weight: 400;
        font-style: normal;
        font-optical-sizing: auto;
        padding: 20px;
        letter-spacing: 10px;
        word-spacing: 4px;
        line-height: 1.3;">CERTIFICATION</h2>
        <div style="padding-left:30px;padding-right:30px;">
          <p style="padding-top:20px;"><strong>To Whom It May Concern:</strong></p>
        <p style="text-align: justify;padding-top:20px;text-indent: 10px;">This is to certify that, based on the official records of in this office, Mr./Ms. <span style="font-weight:bold;color:#000;text-decoration: underline;">${client?.name.toUpperCase()}</span> a resident of <span style="font-weight:bold;color:#000;text-decoration: underline;">${client?.address.toUpperCase()}</span>, was cited for violating the Municipal Traffic Ordinance No. 005-2017 "Municipal Trafic Code of Lopez, Quezon, specifically 
        ${data
  .filter(item => item.idNo === client.idNo) // only items for this client
  .map(item => `
    <span style="font-weight:bold;color:#000;text-decoration: underline;">
      ${item.violation_desc ? item.violation_desc : "No Franchise"}
    </span>
  `)
  .join(", ")}  

under Citation Ticket No. <span style="font-weight:bold;color:#000;text-decoration: underline;">${client?.record_ticket_no}</span> issued on <span style="font-weight:bold;color:#000;text-decoration: underline;">${client?.date}</span>. This citation represents the <span style="font-weight:bold;color:#000;text-decoration: underline;">
  ${data
    .filter(item => item.idNo === client.idNo)       
    .map(item => item.offense_label || "1st Offense") 
    .join(", ")}                                    
</span>
 committed by Mr./Ms. <span style="font-weight:bold;color:#000;text-decoration: underline;">${client?.name.toUpperCase()}</span> under the same ordinance.</p> 
        <p style="text-align: justify;padding-top:20px;text-indent: 10px;">As of this date, the penalty for the said vilation, amounting to <span style="font-weight:bold;color:#000;text-decoration: underline;">₱ ${penalty[0].total_penalty}</span>, remains unpaid and unsettled before this office, despite sufficient time form complience. This non-payment constitutes non-compliance with municipal traffic regulations, which is subject to legal action.</p> 
        <p style="text-align: justify;padding-top:20px;text-indent: 10px;">In view of this, this certification is being issued and forwarded to the Lopez Municipal Police Station for the filing of an appropriate case against the violator in accordance with existing laws and ordinances.</p> 
        <p style="text-align: justify;padding-top:20px;text-indent: 10px;">Issued this <span style="font-weight:bold;color:#000;">${day}</span> day of <span style="font-weight:bold;color:#000;">${month}</span>, <span style="font-weight:bold;color:#000;">${year}</span> at the Office of the Municipal Treasurer, Municipality of Lopez, Quezon, upon the request of the concerned authorities for legal purposes.</p>
        </div> 
        <p style="text-align:center;padding-top:50px;"><strong>HERMES A. ARGANTE</strong></p>
          <p style="text-align:center;">Municipal Treasurer</p>

        </div>
      `;
        // Append temporarily to body
        document.body.appendChild(element);

        // PDF options
        const opt = {
          margin:       0,
          filename:     `client-${client.name}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate PDF
        html2pdf().set(opt).from(element).save().then(() => {
          document.body.removeChild(element); // Clean up
        });
    // Generate PDF here
  } catch (err) {
    console.error(err.message);
  }



};

const handleCloseModal = () => {
  setSelectedClient(null);
  setShowConfirm(false);
  setIsViewViolationOpen(false);
};
  
useEffect(() => {
  fetchRecords().then((data) => setRecords(data || []));
  fetchPending().then((data) => setPending(data || []));
  fetchExpired().then((data) => setExpired(data || []));
}, []);

const fetchRecords = async () => {
  try {
    const response = await fetch("/api/getClient");
    if (!response.ok) throw new Error("Failed to fetch records");
    return await response.json();
  } catch (err) {
    console.error(err.message);
  }
};

const fetchPending = async () => {
  try {
    const response = await fetch("/api/getPending");
    if (!response.ok) throw new Error("Failed to fetch pending");
    return await response.json();
    
  } catch (err) {
    console.error(err.message);
  }
};

const fetchExpired = async () => {
  try {
    const response = await fetch("/api/getExpired");
    if (!response.ok) throw new Error("Failed to fetch expired");
    return await response.json();
  } catch (err) {
    console.error(err.message);
  }
};



// input handler
const handleInputChange = (e) => {
  setSearchInput(e.target.value);
};

// button handler
const handleSearchClick = () => {
  setSearch(searchInput);
};

const formatViolation = (str) => {
  return str
    .replace(/_/g, " ")                 // replace _ with space
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
};

const getViolations = (record) =>
  Object.entries(record)
    .filter(([key, value]) => value === "1" || value === 1 || value === true)
    .map(([key]) => formatViolation(key));

  // memoize filteredRecords so its reference is stable
const filteredRecords = useMemo(() => {
  return (
    (tableView === "all"
      ? records
      : tableView === "pending"
      ? pending
      : expired
    )?.filter((r) =>
      r?.name?.toLowerCase().includes(search?.toLowerCase())
    ) || []
  );
}, [records, pending, expired, tableView, search]);

// Pagination setup
const rowsPerPage = 5; // 👈 set how many rows per page
const startIndex = (currentPage[tableView] - 1) * rowsPerPage;
const endIndex = startIndex + rowsPerPage;

const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

useEffect(() => {
  const fetchViolations = async () => {
    if (!filteredRecords || filteredRecords.length === 0) return;

    const counts = {};
    await Promise.all(
      filteredRecords
        .filter((client) => client && client.id) // ✅ skip null/undefined clients
        .map(async (client) => {
          try {
            const res = await fetch(`/api/getViolationList?client_id=${client.id}`);
            const data = await res.json();
            counts[client.id] = data; // API returns count
          } catch (err) {
            console.error("Error fetching violations:", err);
            counts[client.id] = 0; // fallback
          }
        })
    );
    setViolationCounts(counts);
  };

  fetchViolations();
}, [filteredRecords]); // now stable because of useMemo


// For Dropdown

const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close on Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);



return (
  <div className="space-y-6 p-1">

    {/* Stats Section */}
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
      <div
        className="bg-white p-4 sm:p-6 rounded dashboard-cards flex justify-between items-center "
        
      >
         {/* onClick={() => setTableView("all")} */}
         <div>
           <p className="text-lg sm:text-sm font-normal">CLIENTS</p>
        <h2 className="mt-1 text-gray-600 text-sm sm:text-3xl">
          {records?.length}
        </h2>
         </div>
       
         <div>
          <FaUsers size={50} className="text-blue-400"/>
        </div>
      </div>
      <div
        className="bg-white p-4 sm:p-6 rounded dashboard-cards flex justify-between items-center"
        
      >
        {/* onClick={() => setTableView("pending")} */}
        <div>
        <div className="flex items-center gap-5">
        <h2 className="text-lg sm:text-sm font-normal">PAID</h2>
        <p className=" text-gray-600 text-sm sm:text-xl">
           {pending?.length}
        </p>
        </div>
        <div>
          <p className=" text-gray-600 text-sm sm:text-3xl font-bold">
          ₱ 10,000.00
        </p>
        <p className=" text-gray-600 text-sm sm:text-sx italic mt-2">
          This Year, 2025
        </p>
        </div>
        </div>
        
         <div>
          <MdPaid size={50} className="text-green-500"/>
        </div>
        
      </div>
      <div
        className="bg-white p-4 sm:p-6 rounded dashboard-cards flex justify-between items-center"
        
      >
        {/* onClick={() => setTableView("pending")} */}
        <div>
        <div className="flex items-center gap-5">
        <h2 className="text-lg sm:text-sm font-normal">NOT PAID</h2>
        <p className=" text-gray-600 text-sm sm:text-xl">
           {pending?.length}
        </p>
        </div>
        <div>
          <p className=" text-gray-600 text-sm sm:text-3xl font-bold">
          ₱ 5,000.00
        </p>
        <p className=" text-gray-600 text-sm sm:text-sx italic">
          August 2025
        </p>
        </div>
        </div>
        
        <div>
          <MdPaid size={50} className="text-red-500"/>
        </div>
      </div>
      <div
        className="bg-white p-4 sm:p-6 rounded dashboard-cards flex items-center justify-between"
     
      >
           {/* onClick={() => setTableView("expired")} */}
          <div>
            <div className="flex items-center gap-5">
            <h2 className="text-lg sm:text-sm font-normal text-red-600">EXPIRED</h2>
            <p className=" text-gray-600 text-sm sm:text-xl">
              {expired.length} 
            </p>
            </div>
            <div>
              <p className=" text-gray-600 text-sm sm:text-3xl font-bold">
              ₱ 5,000.00
            </p>
            <p className=" text-gray-600 text-sm sm:text-sx italic ">
              August 2025
            </p>
            </div>
          </div>
        
        <div>
          <IoIosWarning size={50} className="text-red-600"/>
        </div>
        
      </div>
    </section>


    {/* Search Bar */}
    <div className="flex gap-2 ">
      <input
        type="text"
        placeholder="Looking for a clients…"
        value={searchInput}
        onChange={handleInputChange}
        className="border p-2 w-full rounded"
      />
      <button
        onClick={handleSearchClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Search
      </button>
    </div>


    
    {/* Table */}
    <div className="bg-white rounded p-2 lg:p-4 overflow-x-auto flex flex-col gap-4 dashboard-cards">
      {/* <h2
        className={`text-lg sm:text-xl font-semibold mb-4 ${
          tableView === "expired" ? "text-red-600" : "text-gray-800"
        }`}
      >
        {tableView === "all"
          ? "All Clients"
          : tableView === "pending"
          ? "Not Paid Clients"
          : "Expired Clients"}
      </h2> */}

          <div className="space-y-4">
      {/* Dropdown */}
      <select
        value={tableView}
        onChange={(e) => setTableView(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Clients</option>
        <option value="pending">Not Paid Clients</option>
        <option value="expired">Expired Clients</option>
      </select>
    </div>

      <table className="min-w-full border border-gray-200 text-sm sm:text-base">
        <thead className="hidden md:table-header-group">
          <tr className="bg-gray-100">
            <th class=" text-left px-3 py-2 w-[20%]">Name</th>
            <th class=" text-left px-3 py-2 w-[10%]">Violations</th>
            <th class=" text-left px-3 py-2 w-[30%]">
              {tableView === "pending" || tableView === "expired"
                ? "Date"
                : "Address"}
            </th>
            <th class=" text-left px-3 py-2 w-[20%]">
              {tableView === "pending" || tableView === "expired"
                ? "Time"
                : "License No"}
            </th>
            <th class=" text-left px-3 py-2 w-[20%]">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRecords?.length > 0 ? (
            paginatedRecords.map((client, idx) => {
              const vio = getViolations(client);
              const formattedViolations =
                vio.length > 0 ? vio.join(", ") : "None";

              return (
                <tr
                  key={idx}
                  class="block md:table-row border-b md:border-0 md:hover:bg-gray-50 border"
                >
                  {/* Mobile stacked row */}
                  <td class="block md:table-cell px-2 md:px-4 py-2 font-medium md:font-normal">
                    <span class="md:hidden font-semibold">Name: </span>
                    {client.name}
                  </td>
                  <td class="block md:table-cell px-2 md:px-4 py-2">
                    <span className="md:hidden font-semibold">Violations: </span>
                    {client.violation_count ?? "Loading..."}
                    
                  </td>
                  <td class="block md:table-cell px-2 md:px-4 py-2">
                    <span className="md:hidden font-semibold">
                      {tableView === "pending" || tableView === "expired"
                        ? "Date: "
                        : "Address: "}
                    </span>
                    {tableView === "pending" || tableView === "expired"
                      ? client.date
                      : client.address}
                  </td>
                  <td class="block md:table-cell px-2 md:px-4 py-2">
                    <span className="md:hidden font-semibold">
                      {tableView === "pending" || tableView === "expired"
                        ? "Time: "
                        : "License No: "}
                    </span>
                    {tableView === "pending" || tableView === "expired"
                      ? client.time
                      : client.license_no}
                  </td>
                  <td class="block md:table-cell px-2 md:px-4 py-2">
                    {/* Only show Pay if tableView is expired or pending */}
                    {(tableView === "expired" || tableView === "pending") && (
                      <button
                        class="bg-blue-600 text-white px-4 py-1 text-sm  rounded font-medium hover:bg-blue-500 mx-1"
                        onClick={() => handleViewClient(client)}
                      >
                        Pay
                      </button>
                    )}

                    <button
                      className="bg-blue-600 text-white px-4 py-1 text-sm  rounded font-medium hover:bg-blue-500 mx-1"
                      onClick={() => handlePrintClient(client)}
                    >
                      Print
                    </button>

                    <button
                      className="rounded bg-blue-600 px-4 py-1 text-white text-sm  font-medium shadow hover:bg-blue-700 transition mx-1"
                      onClick={() => handleViewClick(client)}
                    >
                      View Violations
                    </button>
                  </td>

                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="5"
                className="text-center py-4 text-gray-500 text-sm sm:text-base"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>


 
    

    {/* Pagination Controls */}
    {totalPages > 1 && (
      <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-4 space-y-2 sm:space-y-0">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm sm:text-base"
          onClick={() =>
            setCurrentPage((prev) => ({
              ...prev,
              [tableView]: Math.max(prev[tableView] - 1, 1),
            }))
          }
          disabled={currentPage[tableView] === 1}
        >
          Prev
        </button>

        <div className="flex space-x-1 sm:space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() =>
                setCurrentPage((prev) => ({ ...prev, [tableView]: i + 1 }))
              }
              className={`px-2 sm:px-3 py-1 text-sm sm:text-base rounded ${
                currentPage[tableView] === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm sm:text-base"
          onClick={() =>
            setCurrentPage((prev) => ({
              ...prev,
              [tableView]: Math.min(prev[tableView] + 1, totalPages),
            }))
          }
          disabled={currentPage[tableView] === totalPages}
        >
          Next
        </button>
      </div>
    )}

    {/* View Violations Modal */}
    {isViewViolationOpen && selectedClient && (
      <div className="absolute left-0  -top-6  bg-black/50 flex items-center justify-center z-50 w-full h-screen">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4 flex flex-col gap-4">
          <div class="flex flex-row justify-between items-center ">
              <h2 className="text-lg font-semibold ">Violations</h2>
              <button
              onClick={() => setIsViewViolationOpen(false)}
              className="">
             <svg class="hover:fill-gray-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <>
              {violations && violations.length > 0 ? (
                <ul className="list-none divide-y divide-gray-200 rounded-xl border bg-white border-l-4 border-blue-400">
                    {violations.map((vio, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-3  flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {vio.violation_desc || "No description"}
                          </span>
                          {vio.offense_label && (
                            <span className="text-xs text-gray-500">{vio.offense_label}</span>
                          )}
                        </div>

                        {vio.fine_amount != null && (
                          <span className="text-xs font-semibold text-red-600">
                            ₱{vio.fine_amount}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

              ) : (
                <p>No violations found.</p>
              )}

              {penaltyValue && (
               <p className="mt-4 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 text-sm flex items-center justify-between">
  <strong className="font-semibold text-gray-900">Total Penalty:</strong>
  <span className="text-red-600 font-bold">
    ₱ {penaltyValue[0]?.total_penalty ?? 0}
  </span>
</p>

              )}
            </>
          )}

         
        </div>
      </div>
    )}

    {showConfirm && selectedClient && (
      <div class="absolute left-0  -top-6  bg-black/50 flex items-center justify-center z-50 w-full h-screen">
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 flex flex-col gap-6">
          
          <div class="text-gray-600 flex  flex-col gap-2">
            <h2 class="text-lg font-bold">Confirm Payment</h2>
            <p> Record payment details for <span class="font-bold text-black">{selectedClient.name}</span></p>
          </div>

          {/* Payment Date */}
          <div class="space-y-2">
            <label className="block text-sm font-medium mb-1">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {/* OR Number */}
          <div class="space-y-2">
            <label className="block text-sm font-medium mb-1">OR Number</label>
            <input
              type="text"
              placeholder="Enter OR No."
              value={orNumber}
              onChange={(e) => setOrNumber(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div class="flex justify-end gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmPay}
              disabled={loading || !paymentDate || !orNumber}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
  
);

}

export default MainUI;