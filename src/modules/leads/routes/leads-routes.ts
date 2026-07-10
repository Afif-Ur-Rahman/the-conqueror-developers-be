import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils/catch-async";

import { createLead, getLeads } from "../controller";

const router = Router();

router.get("/", authMiddleware, catchAsync(getLeads));
router.post("/", catchAsync(createLead));

export { router as leadsRoutes };
