import { useEffect, useState, useRef } from "react";
import { getCurrentTimestamp } from "./Timestamp.jsx";
function AddRecord() {


    const [showOthers, setShowOthers] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [section,setSection] = useState([]);

    const [sectionViolations, setSectionViolations] = useState({}); 
    const [selectionViolation, setSelectionViolation] = useState({}); 
    const [violation,setViolation] = useState([]);
    const [violationList,setViolationList] = useState([]);

    const [selectedSection, setSelectedSection] = useState(null);
    // const items = ["Option 1", "Option 2", "Option 3", "Option 4"];
    const [formData, setFormData] = useState({
      name: "",
      address: "",
      license_no: "",
      issued_at: "",
      birthdate: "",
      timestamp:"",
      // disregarding_traffic_lights_signs: "",
      // emitting_excessive_smoke: "",
      // refusal_to_convey_passenger: "",
      // smoking_inside_the_vehicle: "",
      // reckless_driving: "",
      // driving_without_or_invalid_license:"",
      // loading_or_unloading_in_prohibited_zone: "",
      // riding_or_alighting_at_prohibited_zone: "",
      // Driving_in_prohibited_street: "",
      // Obstructing_traffic: "",
      // Illegal_parking: "",
      // stalled_vehicle:"",
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


     const [loading, setLoading] = useState(true);
    
    const [selectedViolations, setSelectedViolations] = useState([]);
    const [sections, setSections] = useState([]);
    const [violations, setViolations] = useState([]);


    // Fetching data from Backend/API
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
    // ------------------------- //
    
    useEffect(() => {
        fetchSection().then((data) => setSection(data || []));
    }, []);
  
    useEffect(()=>{
      if(selectedSection!==null)
      {
         fetchViolation().then((data) => setViolation(data || []));
         fetchViolation().then((data) => setViolationList(data || []));
        //  setSelectedViolations([]); // <-- reset selected violations
      }
    },[selectedSection])
   
  
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

   const handleNewValues = (violationId) => {
  setSelectionViolation((prev) => {
    // Convert previous state to array of values
    const prevArray = prev ? Object.values(prev) : [];

    // Toggle violationId
    const newArray = prevArray.includes(violationId)
      ? prevArray.filter((v) => v !== violationId) // remove if exists
      : [...prevArray, violationId]; // add if not exists

    // Convert back to object keyed by index
    const newObj = {};
    newArray.forEach((v, i) => {
      newObj[i] = v;
    });

    return newObj;
  });
};

    useEffect(() => {}, [sectionViolations]);

    // For All Field
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      
    };
    // ------------------------- //

    //  Onsubmit Funciton
    const handleSubmit = async (e) => {
      e.preventDefault(); // prevent page reload

      const requiredFields = [
        'name', 'address','license_no',
        'issued_at', 'birthdate', 'place',
        'date', 'time', 'type_of_vehicle', 'plate_no',
        'registration_no', 'vehicle_owner', 'record_address',
        'record_ticket_no'
      ]; 


      // Check missing fields
      const missingFields = requiredFields.filter(field => 
        !formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')
      );

      if (missingFields.length > 0) {
        alert(`Please fill in the required fields`);
        return;
      }

      const timestamp = getCurrentTimestamp();
      const dataWithTimestamp = { ...formData, timestamp };

      try {
        // Save record
        const recordResponse = await fetch("/api/addRecords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataWithTimestamp),
        });

        if (!recordResponse.ok) {
          throw new Error("Failed to add record");
        }

        // Save client
        const clientResponse = await fetch("/api/addClient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataWithTimestamp),
        });

        const clientData = await clientResponse.json();

        // Save violation list
        await fetch("/api/addViolationList", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientData.client_idNo,
            violation_code: sectionViolations,
            timestamp: getCurrentTimestamp(),
          }),
        });

        alert("Record and client added successfully!");
        window.location.reload();
        setFormData({});
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };
    // ------------------------- //



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




    // Close Dropdown Box when click out side
    const dropdownRef = useRef(null);
    useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  // ------------------------- //



  

  return (
    <div className="bg-white p-2 ">
      <h2 className="text-xl font-semibold  p-2">Violators Details</h2>
      <form className="flex flex-col">

        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2  space-y-2 p-2">

            <input type="text" name="record_ticket_no" placeholder="Ticket No" autoComplete="off" required value={formData.record_ticket_no} 
              onChange={handleChange} 
              className="border p-2 w-full rounded"/>
            
            <input type="text" name="name" placeholder="Name" autoComplete="off" required value={formData.name}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <input type="text" name="address" autoComplete="off" placeholder="Address" required value={formData.address}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <input type="text" name="license_no" autoComplete="off" placeholder="License No." required value={formData.license_no}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <input type="text" placeholder="Issued at" name="issued_at" autoComplete="off" value={formData.issued_at}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <div className="space-y-1">
              <label htmlFor="birthdate" className="text-gray-600">Birthdate</label>
              <input type="date" placeholder="Birthdate" name="birthdate" autoComplete="off" value={formData.birthdate}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>
            </div>

            
            <input type="text" placeholder="Place" name="place" autoComplete="off" value={formData.place}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <div className="space-y-1">
              <label htmlFor="birthdate" className="text-gray-600">Date</label>
              <input type="date" placeholder="Date" name="date" autoComplete="off" required value={formData.date}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>
            </div>
            
            <input type="text" placeholder="Time" name="time" autoComplete="off" value={formData.time}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <input type="text" placeholder="Type of Vehicle" name="type_of_vehicle" autoComplete="off" value={formData.type_of_vehicle}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <input type="text" placeholder="Plate No." name="plate_no" autoComplete="off" value={formData.plate_no}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <input type="text" placeholder="Registration No." name="registration_no" autoComplete="off" value={formData.registration_no}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <input type="text" placeholder="Vehicle Owner" name="vehicle_owner" autoComplete="off" value={formData.vehicle_owner}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>

            <input type="text" placeholder="Address" name="record_address" autoComplete="off" value={formData.record_address}
              onChange={handleChange}
              className="border p-2 w-full rounded"/>
              
          </div>

          <div className="w-full lg:w-1/2  space-y-2 p-2 ">

            <p className=" w-full text-start p-2 text-lg font-semibold rounded-sm ">Violations</p>

            <div className="p-2">
                <div className="relative text-left w-full" ref={dropdownRef}>

                  <button type="button" onClick={() => setIsOpen(!isOpen)} className="inline-flex justify-between w-full rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none bg-gray-100">
                    {selectedSection !== null ? section[selectedSection].section: "Select Violations"}
                        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                        </svg>
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 mt-2 w-full rounded-md h-96 overflow-y-auto shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border">
                      <div className="py-1">
                        {section?.map((sec, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            onClick={() => {
                              setSelectedSection(index); // save index
                              setIsOpen(false); // close dropdown
                            }}
                          >
                            {sec.section}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            </div>

            <div className="px-2">
              <div className="flex flex-col space-y-2 border p-2 rounded-md h-64 overflow-y-auto">
                {selectedSection === null ? (
                  <div className="flex items-center justify-center h-full text-gray-500 italic">
                    Please select a section first
                  </div>
                ) : (
                  violation?.map((violationItem) => (
                    <label
                      key={violationItem.violation_idNo}
                      className="inline-flex items-center p-2 text-gray-700 hover:bg-blue-200 rounded-md"
                    >
                      <div className="w-[8%] h-full flex justify-center items-center">
                        <input
                          type="checkbox"
                          checked={(sectionViolations[selectedSection] || []).includes(
                            violationItem.violation_idNo
                          )}
                          onChange={() =>
                            {handleChangeViolation(violationItem.violation_idNo)
                            handleNewValues(violationItem.violation_desc)}
                          }
                          
                          className="form-checkbox h-4 w-4 text-blue-600 border"
                        />
                      </div>
                      <span className="w-[92%]">{violationItem.violation_desc}</span>
                    </label>
                  ))
                )}
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
            </div>

            <div className="p-2 flex flex-col gap-2">
              
              <div className="flex flex-col lg:flex-row justify-between lg:items-center ">
                <p className="py-2 font-semibold">List of Violations</p>
                <p className="py-2 text-gray-500 text-sm">
                  Number of Violations:
                  <span className="px-2 font-semibold">
                     {selectionViolation !== null
                    ? Object.keys(selectionViolation || {}).length
                    : 0}
                  </span>
                </p>
              </div>
              <div className=" p-2 rounded-md h-60 overflow-y-auto border">
                {console.log(Object.keys(selectionViolation || {}).length)}
                 {selectedSection === null ? (
                    <div className="text-gray-500 italic w-full h-full justify-center items-center flex">No section selected</div>
                  ) : Object.keys(selectionViolation || {}).length === 0 ? (
                    <div className="text-gray-500 italic w-full h-full justify-center items-center flex">No violations selected</div>
                  ) : (
                    <ul className="list-decimal pl-5 space-y-1">
                      <ul>
                        {console.log(selectionViolation)}
                        {Object.entries(selectionViolation || {}).map(([key, v]) => (
                          <li key={key} className="text-gray-700">
                           
                            {v || "Unknown violation"}
                          </li>
                        ))}
                      </ul>
                    </ul>
                  )}
              </div>

            </div>

                    


            <button type="submit" onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 w-full">
              Submit
            </button>

            

          </div>
        </div>

  
      </form>
    </div>
  );
}

export default AddRecord;
