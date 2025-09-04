import dotenv from "dotenv";
import bcrypt from "bcrypt";

import express from "express";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import routes from "./routes/routes.js";
import pool from "./db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// MySQL session store
const MySQLStoreModule = await import("express-mysql-session");
const MySQLStore = MySQLStoreModule.default(session);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// --- Middleware order matters ---

// CORS first
app.use(
  cors({
    origin: "http://localhost:3000", // React app URL
    credentials: true, // allow cookies/sessions
  })
);

// JSON body parser
app.use(express.json());

// Session middleware BEFORE routes
app.use(
  session({
    key: "user_sid",
    secret: process.env.SESSION_SECRET || "supersecret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
    },
  })
);

// API routes
app.use("/api", routes);

// Serve React build (adjust path if build is in client/)
app.use(express.static(path.join(__dirname, "build")));

// Catch-all for React Router (Express 5 safe)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
