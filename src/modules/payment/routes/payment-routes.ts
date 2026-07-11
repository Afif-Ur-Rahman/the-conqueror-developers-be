import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils/catch-async";

import {
  createPayment,
  getPaymentsByCustomer,
  getPaymentsByUnit,
  updatePayment,
} from "../controller";

const router = Router();

router.use(authMiddleware);

router.get("/", catchAsync(getPaymentsByUnit));
router.get("/", catchAsync(getPaymentsByCustomer));
router.post("/", catchAsync(createPayment));
router.put("/", catchAsync(updatePayment));

export { router as paymentRoutes };
