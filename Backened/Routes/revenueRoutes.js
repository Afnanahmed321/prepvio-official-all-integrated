import express from "express";
import { getOverview, getAnalytics, getInvoices, getActiveSubscriptions } from "../Controllers/revenueController.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

// Middleware to ensure admin access can be added here
// For now, using verifyToken. Ideally, verifyAdmin should also be used.

router.get("/overview", verifyToken, getOverview);
router.get("/analytics", verifyToken, getAnalytics);
router.get("/invoices", verifyToken, getInvoices);
router.get("/active-subscriptions", verifyToken, getActiveSubscriptions);

export default router;