import express from "express";
import { login, logout, checkSession, getUser, addRecord, addClient, getClients, getPending, getExpired, addPayment, getOffense, getViolation, getSection, addViolationList, getViolationList, getViolationOffense, getPenaltyValue, getViolationId, updateAccount } from "../controllers/controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/check-session", checkSession);
router.get("/getUsers", getUser);
router.post("/addRecords", addRecord);
router.post("/addClient",addClient)
router.post("/addPayment",addPayment)
router.post("/addViolationList",addViolationList)
router.post("/getViolationOffense",getViolationOffense)
router.post("/getViolationId",getViolationId)
router.post("/getPenaltyValue",getPenaltyValue)
router.post("/updateAccount",updateAccount)

router.get("/getClient",getClients)
router.get("/getPending",getPending)
router.get("/getExpired",getExpired)
router.get("/getViolation",getViolation)
router.get("/getSection",getSection)
router.get("/getSection",getSection)

router.post("/getViolationList",getViolationList)

router.post("/getOffense",getOffense)
export default router;
