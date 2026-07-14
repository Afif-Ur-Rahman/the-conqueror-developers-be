import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils/catch-async";

import { createUnitInformation, getUnitInformationByCustomer } from "../controller";

const router = Router();

router.use(authMiddleware);

router.get("/:customerId", catchAsync(getUnitInformationByCustomer));
router.post("/:customerId", catchAsync(createUnitInformation));

export { router as unitInformationRoutes };
