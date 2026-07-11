import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils/catch-async";

import { createCustomer, getCustomers, updateCustomer } from "../controller";

const router = Router();

router.use(authMiddleware);

router.get("/", catchAsync(getCustomers));
router.post("/", catchAsync(createCustomer));
router.put("/:id", catchAsync(updateCustomer));

export { router as customerRoutes };
