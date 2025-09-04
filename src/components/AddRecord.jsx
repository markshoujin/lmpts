import React, { useEffect, useState } from "react";
import { getCurrentTimestamp } from "./Timestamp.jsx";
function AddRecord() {
  
    const [showOthers, setShowOthers] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [section,setSection] = useState([]);
  const [sectionViolations, setSectionViolations] = useState({}); 
  const [violation,setViolation] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const items = ["Option 1", "Option 2", "Option 3", "Option 4"];
     const [formData, setFormData] = useState({
    name: "",
    address: "",
    license_no: "",
    issued_at: "",
    birthdate: "",
    timestamp:"",
    disregarding_traffic_lights_signs: "",
    emitting_excessive_smoke: "",
    refusal_to_convey_passenger: "",
    smoking_inside_the_vehicle: "",
    reckless_driving: "",
    driving_without_or_invalid_license:"",
       loading_or_unloading_in_prohibited_zone: "",
    riding_or_alighting_at_prohibited_zone: "",
    Driving_in_prohibited_street: "",
    Obstructing_traffic: "",
    Illegal_parking: "",
    stalled_vehicle:"",
       others: "",
    place: "",
    date: "",
    time: "",
    type_of_vehicle: "",
    plate_no:"",
       registration_no: "",
    vehicle_owner: "",
    record_address: "",
    record_ticket_no:"",
  });
  
  
   useEffect(() => {
      fetchSection().then((data) => setSection(data || []));
    }, []);

    useEffect(()=>{
    if(selectedSection!==null)
    {
       fetchViolation().then((data) => setViolation(data || []));
       setSelectedViolations([]); // <-- reset selected violations
    }
    },[selectedSection])
 
  const [selectedViolations, setSelectedViolations] = useState([]);

  const handleChangeViolation = (violationId) => {
  setSectionViolations((prev) => {
    const currentSection = selectedSection;
    const prevSelected = prev[currentSection] || [];

    const newSelected = prevSelected.includes(violationId)
      ? prevSelected.filter((v) => v !== violationId)
      : [...prevSelected, violationId];

    return { ...prev, [currentSection]: newSelected };
  });
};
useEffect(() => {
}, [sectionViolations]);
    const fetchSection = async(e)=>{
      try {
      const response = await fetch("/api/getSection");
      if (!response.ok) throw new Error("Failed to fetch expired");
      return await response.json();
    } catch (err) {
      console.error(err.message);
    }
    }
    const fetchViolation = async(e)=>{
     
        try {
          const response = await fetch(`/api/getViolation?section_id=${selectedSection+1}`);
          if (!response.ok) throw new Error("Failed to fetch violations");
          const data = await response.json();
          return data;
        } catch (err) {
          console.error(err.message);
        }
    }
const getCurrentTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
  };
 const handleSubmit = async (e) => {
  e.preventDefault(); // prevent page reload
const timestamp = getCurrentTimestamp();

  // build a new object with timestamp included
  const dataWithTimestamp = { ...formData, timestamp };



  try {
    // Send record data
    const recordResponse = await fetch("/api/addRecords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataWithTimestamp), // object containing record fields
    });

    if (!recordResponse.ok) {
      throw new Error("Failed to add record");
    }

    
    const clientResponse = await fetch("/api/addAssistance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataWithTimestamp),
    });

    const clientData = await clientResponse.json();
    const clientId = clientData.client_idNo; // newly created client ID
    // Then send violation list
    await fetch("/api/addViolationList", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientData.client_idNo,
        violation_code: sectionViolations,
        timestamp: getCurrentTimestamp(),
      }),
    });

    // Success
    alert("Record and client added successfully!");
    window.location.reload();
    // Optionally, reset form
    setFormData({
      record: {}, 
      client: {}
    });

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold">Add New Record</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          type="text"
          name="record_ticket_no"
          placeholder="Ticket No"
          autoComplete="off"
          required
          value={formData.record_ticket_no}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          autoComplete="off"
          required
          value={formData.name}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
           name="address"
           autoComplete="off"
          placeholder="Address"
          required
          value={formData.address}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
           name="license_no"
           autoComplete="off"
          placeholder="License No."
          required
          value={formData.license_no}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Issued at"
           name="issued_at"
           autoComplete="off"
          value={formData.issued_at}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="date"
          placeholder="Birthdate"
           name="birthdate"
           autoComplete="off"
          value={formData.birthdate}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <div className="flex items-center space-x-2">
            <h2 className="text-3xl font-bold text-center text-blue-700 m-6">
          Violation
        </h2>
        </div>
        

        <div className="relative inline-block text-left">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-between w-56 rounded-md border px-4 py-2 bg-white text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        {/* Display selected section or placeholder */}
        {selectedSection !== null
          ? section[selectedSection].section
          : "Select an option"}

        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown items */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {section?.map((section, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => {
                  setSelectedSection(index); // save index
                  setIsOpen(false);           // close dropdown
                }}
              >
                {section.section}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    <div className="flex flex-col space-y-2">
          {violation?.map((violationItem) => (
            <label key={violationItem.violation_idNo} className="inline-flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                checked={(sectionViolations[selectedSection] || []).includes(violationItem.violation_idNo)}
                onChange={() => handleChangeViolation(violationItem.violation_idNo)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>{violationItem.violation_desc}</span>
            </label>
          ))}
        </div>
      {showOthers && (
        <input
          type="text"
           name="others"
           autoComplete="off"
          value={formData.others}
        onChange={handleChange}
          placeholder="Specify"
          className="border p-2 w-full rounded mt-2"
        />
      )}
        <input
          type="text"
          placeholder="Place"
           name="place"
           autoComplete="off"
          value={formData.place}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        
        <input
          type="date"
          placeholder="Date"
           name="date"
           autoComplete="off"
           required
          value={formData.date}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Time"
           name="time"
           autoComplete="off"
          value={formData.time}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Type of Vehicle"
           name="type_of_vehicle"
           autoComplete="off"
          value={formData.type_of_vehicle}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Plate No."
           name="plate_no"
           autoComplete="off"
          value={formData.plate_no}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Registration No."
           name="registration_no"
           autoComplete="off"
          value={formData.registration_no}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Vehicle Owner"
           name="vehicle_owner"
           autoComplete="off"
          value={formData.vehicle_owner}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Address"
           name="record_address"
           autoComplete="off"
          value={formData.record_address}
        onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default AddRecord;
