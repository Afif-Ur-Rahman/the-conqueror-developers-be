import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils/catch-async";

import { createPayment, getPaymentsByUnit, updatePayment } from "../controller";

const router = Router();

router.use(authMiddleware);

router.get("/:id", catchAsync(getPaymentsByUnit));
router.post("/:id", catchAsync(createPayment));
router.put("/", catchAsync(updatePayment));

export { router as paymentRoutes };
