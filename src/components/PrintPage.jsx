import React from 'react'

function PrintPage() {
  return (
    <div style={{ width: "210mm", height: "297mm", border: "2px solid #000" ,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
  <div style={{ fontFamily: "Arial, sans-serif", paddingTop:"50px" }}>
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingY: "10px",
        gap:"20px",
        backgroundColor: "cyan",
        boxSizing: "border-box",
      }}
    >
        <div>
            <img src='https://livelopez.gov.ph/wp-content/uploads/2025/08/fa62637c-569d-4239-8e21-4abdfad619c4-removebg-preview.png' style={{width:"150px",backgroundColor:"#FFF",borderRadius:"50%"}}></img>
        </div>
        <div>
      <p style={{ fontSize: "12px" }}>Republic of the Philippines</p>
      <p style={{ fontSize: "12px" }}>Province of Quezon</p>
      <p style={{ fontSize: "12px" }}>Municipality of Lopez</p>
      <h2 style={{ fontSize: "16px" }}><strong>MUNICIPAL TREASURER'S OFFICE</strong></h2>
      <p style={{ fontSize: "12px" }}>Contact No. 09300753517</p>
      <p style={{ fontSize: "8px" }}>
        Address: Maharlika Hi-way Brgy. Talolong G/F Municipal Building Lopez,
        Quezon 4
      </p>
        </div>
      
    </div>

    <h2
  style={{
    color: "#333",
    textAlign: "center",
    fontSize: "42px",
    fontFamily: "'EB Garamond', serif",
    fontWeight: 400, 
    fontStyle: "normal",
    fontOpticalSizing: "auto",
    padding: "50px",
    letterSpacing: "10px", 
    wordSpacing: "4px",   
    lineHeight: "1.3",    
  }}
>
      CERTIFICATION
    </h2>
    <div  style={{paddingLeft:"50px",paddingRight:"50px"}}>

    
    <p style={{ paddingTop: "20px" }}>
      <strong>To Whom It May Concern:</strong>
    </p>

    <p
      style={{
        textAlign: "justify",
        paddingTop: "50px",
        textIndent: "30px",
      }}
    >
      This is to certify that, based on the official records of in this office,
      Mr./ms. <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>NAME</span>{" "}
      a resident of <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>ADDRESS</span>{" "}, was cited for violating the Municipal Traffic
      Ordinance No. 005-2017 "Municipal Traffic Code of Lopez, Quezon", specifically <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>No Franchise</span>{" "} under Citation Ticket No. <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>00000</span>{" "} issued on <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>Sample Data</span>{" "}
      This citation represents the <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>1st Offense</span>{" "} committed by Mr./Ms. <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>NAME</span>{" "} under
      the same ordinance.
    </p>

    <p
      style={{
        textAlign: "justify",
        paddingTop: "50px",
        textIndent: "30px",
      }}
    >
      As of this date, the penalty for the said violation, amounting to <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>P 0,000.00</span>{" "},
      remains unpaid and unsettled before this office, despite sufficient time
      for compliance. This non-payment constitutes non-compliance with
      municipal traffic regulations, which is subject to legal action.
    </p>

    <p
      style={{
        textAlign: "justify",
        paddingTop: "50px",
        textIndent: "30px",
      }}
    >
      In view of this, this certification is being issued and forwarded to the
      Lopez Municipal Police Station for the filing of an appropriate case
      against the violator in accordance with existing laws and ordinances.
    </p>

    <p
      style={{
        textAlign: "justify",
        paddingTop: "50px",
        textIndent: "30px",
      }}
    >
      Issued this <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>00th</span>{" "} day of <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>Month</span>{" "}, <span style={{ fontWeight: "bold", color: "#000", textDecoration: "underline" }}>YEAR</span>{" "} at the Office of the Municipal
      Treasurer, Municipality of Lopez, Quezon, upon the request of the
      concerned authorities for legal purposes.
    </p>
</div>
    <p style={{ textAlign: "center", paddingTop: "100px" }}>
      <strong>HERMES A. ARGANTE</strong>
    </p>
    <p style={{ textAlign: "center" }}>
      Municipal Treasurer
    </p>
  </div>
</div>
  )
}

export default PrintPage
