import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth-middleware";
import { catchAsync } from "@/utils";

import { createEmployee, deleteEmployee, getAllEmployees } from "../controller";

const router = Router();

router.use(authMiddleware);

router.get("/", catchAsync(getAllEmployees));
router.post("/", catchAsync(createEmployee));
router.delete("/:id", catchAsync(deleteEmployee));

export { router as employeeRoutes };
