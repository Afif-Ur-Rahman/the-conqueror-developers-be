import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils/catch-async";

import { createReceipt, deleteReceipt, getReceiptsByPayment, updateReceipt } from "../controller";

const router = Router();

router.use(authMiddleware);

router.get("/:paymentId", catchAsync(getReceiptsByPayment));
router.post("/:paymentId", catchAsync(createReceipt));
router.patch("/:receiptId", catchAsync(updateReceipt));
router.delete("/:receiptId", catchAsync(deleteReceipt));

export { router as receiptRoutes };
