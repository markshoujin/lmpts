import pool from "../db.js";
import bcrypt from "bcrypt";

// LOGIN
export async function login(req, res) {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Save user session
    req.session.user = { id: user.id, username: user.username };
    res.json({ message: "Login successful", user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
export async function register(req, res) {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const [rows] = await pool.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // saltRounds = 10

    // Insert new user
    const [result] = await pool.query(
      "INSERT INTO user (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    // Save session (optional)
    req.session.user = { id: result.insertId, username };

    res.status(201).json({ 
      message: "User created successfully", 
      user: req.session.user 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
// ✅ LOGOUT
export function logout(req, res) {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("user_sid");
    res.json({ message: "Logged out successfully" });
  });
}

// ✅ CHECK SESSION
export function checkSession(req, res) {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
}

// ✅ GET ALL USERS
export async function getUser(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM user");
    res.json(rows);
    

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}
// ✅ Add a new record
export async function addRecord(req, res) {
  const {
    idNo,
    name,
    place,
    date,
    time,
    type_of_vehicle,
    plate_no,
    registration_no,
    vehicle_owner,
    record_address,
    record_ticket_no,
    timestamp,
  } = req.body;
  const record_status = "pending"
  try {
    const [result] = await pool.query(
      `INSERT INTO record 
      (idNo, name,  place, date, time, type_of_vehicle, plate_no, registration_no, vehicle_owner, record_address,record_ticket_no,record_status,timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        null,
        name,
        place,
        date,
        time,
        type_of_vehicle,
        plate_no,
        registration_no,
        vehicle_owner,
        record_address,
        record_ticket_no,
        record_status,
        timestamp,
      ]
    );
    res.json({ message: "Record added successfully", insertId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add record" });
  }
}

export async function getRecords(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM record ORDER BY idNo DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
}

export async function getPending(req, res) {
  try {
    const [rows] = await pool.query("SELECT client.*, record.*, COUNT(violation_list.violation_list_idNo) AS violation_count FROM client INNER JOIN record ON client.idNo = record.idNo LEFT JOIN payment ON client.idNo = payment.client_idNo LEFT JOIN violation_list ON violation_list.client_id = client.idNo WHERE payment.client_idNo IS NULL GROUP BY client.idNo;");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
}

export async function getExpired(req, res) {
  try {
    const [rows] = await pool.query("SELECT client.*, record.*, COUNT(violation_list.violation_list_idNo) AS violation_count FROM record INNER JOIN client ON client.idNo = record.idNo LEFT JOIN payment ON record.name = payment.name LEFT JOIN violation_list ON violation_list.client_id = client.idNo WHERE record.date < DATE_SUB(NOW(), INTERVAL 3 DAY) AND payment.name IS NULL GROUP BY client.idNo;");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
}

export async function getOffense(req, res) {
  try {
    const { name } = req.body; 
    if (!name) return res.status(400).json({ error: "Name is required" });

    const [rows] = await pool.query(
      "SELECT * FROM client WHERE name = ?",
      [name] 
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
}
export async function addClient(req, res) {
  const { name, address, license_no, issued_at, birthdate, timestamp } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO client 
      (idNo, name, address, license_no, issued_at, birthdate, timestamp) 
      VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
      [name, address, license_no, issued_at, birthdate, timestamp]
    );

    // Return the new client_idNo instead of insertId
    res.json({ 
      message: "Client added successfully", 
      client_idNo: result.insertId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add client" });
  }
}
export async function addViolationList(req, res) {
  const { client_id, violation_code, timestamp } = req.body;

  try {
    const queries = [];
    const values = [];

    // Flatten all violations from violation_code object
    const allViolations = Object.values(violation_code).flat();

    for (const violationId of allViolations) {
      queries.push("(NULL, ?, ?, ?)");
      values.push(client_id, violationId, timestamp);
    }

    if (queries.length === 0) {
      return res.status(400).json({ error: "No violations to insert" });
    }

    const sql = `
      INSERT INTO violation_list 
      (violation_list_idNo, client_id, violation_code, violation_list_timestamp) 
      VALUES ${queries.join(", ")}
    `;

    const [result] = await pool.query(sql, values);

    res.json({
      message: "Violations added successfully",
      affectedRows: result.affectedRows,
      client_id,
    });
  } catch (err) {
    console.error("❌ Error in addViolationList:", err);
    res.status(500).json({ error: "Failed to add violation list" });
  }
}



export async function addPayment(req, res) {
  const { name, orNumber, paymentDate,idNo } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO payment (idNo, name,or_number, date,client_idNo) VALUES (NULL, ?, ?, ?,?)`,
      [name, orNumber, paymentDate,idNo]
    );

    res.json({ message: "Payment added successfully", insertId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add Payment" });
  }
}

// ✅ Get all clients
export async function getClients(req, res) {
  try {
    const [rows] = await pool.query("SELECT client.*, record.*, COUNT(violation_list.violation_list_idNo) AS violation_count FROM client INNER JOIN record ON client.idNo = record.idNo LEFT JOIN violation_list ON violation_list.client_id = client.idNo GROUP BY client.idNo;");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
  
}
export async function getSection(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM violation_section ");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
  
}
export async function getViolation(req, res) {
  try {
    const sectionId = req.query.section_id; // get section_id from query

    if (!sectionId) {
      return res.status(400).json({ error: "section_id query param is required" });
    }

    // Parameterized query to prevent SQL injection
    const [rows] = await pool.query(
      "SELECT * FROM violation WHERE section_reference = ?",
      [sectionId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch violations" });
  }
}

export async function getViolationList(req, res) {
  try {
    const client_id = req.query.client_id; // get section_id from query

    if (!client_id) {
      return res.status(400).json({ error: "client_id query param is required" });
    }

    // Parameterized query to prevent SQL injection
    const [rows] = await pool.query(
      "SELECT * FROM violation_list WHERE client_id = ?",
      [client_id]
    );

    res.json(rows.length);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch violations" });
  }
}

export async function getViolationOffense(req, res) {
  try {
    const name = req.body.name;

    if (!name) {
      return res.status(400).json({ error: "name query param is required" });
    }

    const [rows] = await pool.query(
      `
      WITH violation_ranked AS (
    SELECT 
        r.idNo,
        r.name,
        v.violation_code,
        vio.violation_desc,
        ROW_NUMBER() OVER (
            PARTITION BY r.name, v.violation_code 
            ORDER BY v.violation_list_idNo
        ) AS offense_num,
        vio.violation_first_offense,
        vio.violation_second_offense,
        vio.violation_third_offense
    FROM record r
    INNER JOIN violation_list v 
        ON r.idNo = v.client_id
    INNER JOIN violation vio 
        ON v.violation_code = vio.violation_idNo
    WHERE r.name = ?   -- placeholder for the name
)
SELECT 
    idNo,
    name,
    violation_code,
    violation_desc,
    CONCAT(
        offense_num,
        CASE 
            WHEN offense_num % 100 IN (11, 12, 13) THEN 'th'
            WHEN offense_num % 10 = 1 THEN 'st'
            WHEN offense_num % 10 = 2 THEN 'nd'
            WHEN offense_num % 10 = 3 THEN 'rd'
            ELSE 'th'
        END,
        ' Offense'
    ) AS offense_label,
    CASE 
        WHEN offense_num = 1 THEN violation_first_offense
        WHEN offense_num = 2 THEN violation_second_offense
        WHEN offense_num >= 3 THEN violation_third_offense
    END AS penalty
FROM violation_ranked;


      `,
      [name] // ✅ parameterized to avoid SQL injection
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch violations" });
  }
}

export async function getViolationId(req, res) {
  try {
    const client_id = req.body.client_idNo;

    if (!client_id) {
      return res.status(400).json({ error: "client_id query param is required" });
    }

    const [rows] = await pool.query(
      `
      WITH violation_ranked AS (
    SELECT 
        r.idNo,
        r.name,
        v.violation_code,
        vio.violation_desc,
        ROW_NUMBER() OVER (
            PARTITION BY r.name, v.violation_code 
            ORDER BY v.violation_list_idNo
        ) AS offense_num,
        vio.violation_first_offense,
        vio.violation_second_offense,
        vio.violation_third_offense
    FROM record r
    INNER JOIN violation_list v 
        ON r.idNo = v.client_id
    INNER JOIN violation vio 
        ON v.violation_code = vio.violation_idNo
    WHERE r.idNo = ?   -- placeholder for the client_id
)
SELECT 
    idNo,
    name,
    violation_code,
    violation_desc,
    CONCAT(
        offense_num,
        CASE 
            WHEN offense_num % 100 IN (11, 12, 13) THEN 'th'
            WHEN offense_num % 10 = 1 THEN 'st'
            WHEN offense_num % 10 = 2 THEN 'nd'
            WHEN offense_num % 10 = 3 THEN 'rd'
            ELSE 'th'
        END,
        ' Offense'
    ) AS offense_label,
    CASE 
        WHEN offense_num = 1 THEN violation_first_offense
        WHEN offense_num = 2 THEN violation_second_offense
        WHEN offense_num >= 3 THEN violation_third_offense
    END AS penalty
FROM violation_ranked;


      `,
      [client_id] // ✅ parameterized to avoid SQL injection
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch violations" });
  }
}
export async function getPenaltyValue(req, res) {
  try {
    const client_idNo = req.body.client_idNo;

    if (!client_idNo) {
      return res.status(400).json({ error: "name query param is required" });
    }

    const [rows] = await pool.query(
      `
      WITH violation_ranked AS (
    SELECT 
        r.idNo,
        r.name,
        v.violation_code,
        vio.violation_desc,
        ROW_NUMBER() OVER (
            PARTITION BY r.idNo, v.violation_code 
            ORDER BY v.violation_list_idNo
        ) AS offense_num,
        vio.violation_first_offense,
        vio.violation_second_offense,
        vio.violation_third_offense
    FROM record r
    INNER JOIN violation_list v 
        ON r.idNo = v.client_id
    INNER JOIN violation vio 
        ON v.violation_code = vio.violation_idNo
    WHERE r.idNo = ?
)
SELECT 
    idNo,
    name,
    SUM(
        CASE 
            WHEN offense_num = 1 THEN CAST(violation_first_offense AS UNSIGNED)
            WHEN offense_num = 2 THEN CAST(violation_second_offense AS UNSIGNED)
            WHEN offense_num >= 3 THEN CAST(violation_third_offense AS UNSIGNED)
        END
    ) AS total_penalty
FROM violation_ranked
GROUP BY idNo, name;


      `,
      [client_idNo] // ✅ parameterized to avoid SQL injection
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch violations" });
  }
}

export async function updateAccount(req, res) {
  const { username, currentPassword, newPassword } = req.body;

  try {
    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 1️⃣ Find the user
    const [rows] = await pool.query("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = rows[0];

    // 2️⃣ Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update DB
    const values = [hashedPassword, username];
    await pool.query("UPDATE user SET password = ? WHERE username = ?", values);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error updating password:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
}
