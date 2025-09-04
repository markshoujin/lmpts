import React, { useEffect, useMemo, useState } from "react";
import html2pdf from "html2pdf.js";

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
return (
  <div className="space-y-6">
    {/* Search Bar */}
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Search clients..."
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


    {/* Stats Section */}
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        className="bg-white p-4 sm:p-6 rounded shadow cursor-pointer"
        onClick={() => setTableView("all")}
      >
        <h2 className="text-lg sm:text-xl font-semibold">Clients</h2>
        <p className="mt-1 text-gray-600 text-sm sm:text-base">
          Number of registered clients: {records?.length}
        </p>
      </div>
      <div
        className="bg-white p-4 sm:p-6 rounded shadow cursor-pointer"
        onClick={() => setTableView("pending")}
      >
        <h2 className="text-lg sm:text-xl font-semibold">Not Paid</h2>
        <p className="mt-1 text-gray-600 text-sm sm:text-base">
          Number of unpaid clients: {pending?.length}
        </p>
      </div>
      <div
        className="bg-white p-4 sm:p-6 rounded shadow cursor-pointer"
        onClick={() => setTableView("expired")}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-red-600">Expired</h2>
        <p className="mt-1 text-gray-600 text-sm sm:text-base">
          {expired.length} expired
        </p>
      </div>
    </section>

    {/* Table */}
    <div className="bg-white rounded shadow p-4 sm:p-6 overflow-x-auto">
      <h2
        className={`text-lg sm:text-xl font-semibold mb-4 ${
          tableView === "expired" ? "text-red-600" : "text-gray-800"
        }`}
      >
        {tableView === "all"
          ? "All Clients"
          : tableView === "pending"
          ? "Not Paid Clients"
          : "Expired Clients"}
      </h2>
      <table className="min-w-full border border-gray-200 text-sm sm:text-base">
        <thead className="hidden sm:table-header-group">
          <tr className="bg-gray-100">
            <th className="border px-2 sm:px-4 py-2 text-left">Name</th>
            <th className="border px-2 sm:px-4 py-2 text-left">Violations</th>
            <th className="border px-2 sm:px-4 py-2 text-left">
              {tableView === "pending" || tableView === "expired"
                ? "Date"
                : "Address"}
            </th>
            <th className="border px-2 sm:px-4 py-2 text-left">
              {tableView === "pending" || tableView === "expired"
                ? "Time"
                : "License No"}
            </th>
            <th className="border px-2 sm:px-4 py-2 text-left">Action</th>
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
                  className="block sm:table-row border-b sm:border-0 sm:hover:bg-gray-50"
                >
                  {/* Mobile stacked row */}
                  <td className="block sm:table-cell px-2 sm:px-4 py-2 font-medium sm:font-normal">
                    <span className="sm:hidden font-semibold">Name: </span>
                    {client.name}
                  </td>
                  <td className="block sm:table-cell px-2 sm:px-4 py-2">
                    <span className="sm:hidden font-semibold">Violations: </span>
                    {client.violation_count ?? "Loading..."}
                    <button
                      className="ml-2 rounded bg-blue-600 px-2 sm:px-3 py-1 text-white text-xs sm:text-sm font-medium shadow hover:bg-blue-700 transition"
                      onClick={() => handleViewClick(client)}
                    >
                      View
                    </button>
                  </td>
                  <td className="block sm:table-cell px-2 sm:px-4 py-2">
                    <span className="sm:hidden font-semibold">
                      {tableView === "pending" || tableView === "expired"
                        ? "Date: "
                        : "Address: "}
                    </span>
                    {tableView === "pending" || tableView === "expired"
                      ? client.date
                      : client.address}
                  </td>
                  <td className="block sm:table-cell px-2 sm:px-4 py-2">
                    <span className="sm:hidden font-semibold">
                      {tableView === "pending" || tableView === "expired"
                        ? "Time: "
                        : "License No: "}
                    </span>
                    {tableView === "pending" || tableView === "expired"
                      ? client.time
                      : client.license_no}
                  </td>
                  <td className="block sm:table-cell px-2 sm:px-4 py-2 space-x-2">
                    {/* Only show Pay if tableView is expired or pending */}
                    {(tableView === "expired" || tableView === "pending") && (
                      <button
                        className="bg-blue-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded hover:bg-blue-500"
                        onClick={() => handleViewClient(client)}
                      >
                        Pay
                      </button>
                    )}

                    <button
                      className="bg-blue-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded hover:bg-blue-500"
                      onClick={() => handlePrintClient(client)}
                    >
                      Print
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
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
      <h2 className="text-lg font-semibold mb-4">Violations</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {violations && violations.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 mb-4">
              {violations.map((vio, idx) => (
                <li key={idx}>
                  {vio.violation_desc || "No description"}{" "}
                  {vio.offense_label && (
                    <span className="text-gray-500 text-sm">
                      ({vio.offense_label})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No violations found.</p>
          )}

          {penaltyValue && (
            <p className="mt-4">
              <strong>Total Penalty:</strong> ₱ {penaltyValue[0]?.total_penalty}
            </p>
          )}
        </>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={() => setIsViewViolationOpen(false)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
{showConfirm && selectedClient && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h2 className="text-lg font-semibold mb-4">Confirm Payment</h2>
      <p className="mb-6">
        Are you sure you want to confirm payment for{" "}
        <span className="font-bold">{selectedClient.name}</span>?
      </p>

      {/* Payment Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Payment Date</label>
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* OR Number */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">OR Number</label>
        <input
          type="text"
          placeholder="Enter OR No."
          value={orNumber}
          onChange={(e) => setOrNumber(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="flex justify-end gap-2">
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
