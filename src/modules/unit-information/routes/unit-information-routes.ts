import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils/catch-async";

import { createUnitInformation, getUnitInformationByCustomer } from "../controller";

const router = Router();

router.use(authMiddleware);

router.get("/", catchAsync(getUnitInformationByCustomer));
router.post("/", catchAsync(createUnitInformation));

export { router as unitInformationRoutes };
