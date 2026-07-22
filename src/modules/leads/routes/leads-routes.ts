import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils/catch-async";

import { createLead, getLeads, updateLead } from "../controller";

const router = Router();

router.get("/", authMiddleware, catchAsync(getLeads));
router.post("/", catchAsync(createLead));
router.put("/:id", catchAsync(updateLead));

export { router as leadsRoutes };
