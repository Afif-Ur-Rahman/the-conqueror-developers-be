import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils/catch-async";

import { createPayment, getPaymentsByUnit } from "../controller";

const router = Router();

router.use(authMiddleware);

router.get("/:id", catchAsync(getPaymentsByUnit));
router.post("/:id", catchAsync(createPayment));

export { router as paymentRoutes };
