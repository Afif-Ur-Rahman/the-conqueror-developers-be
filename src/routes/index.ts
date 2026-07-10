import { Router } from "express";

import { rateLimiter } from "@/middlewares/security-middleware";
import { userRoutes, profileRoutes } from "@/modules";
import { authRoutes } from "@/modules/auth/routes";
import { leadsRoutes } from "@/modules/leads";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the restaurant API" });
});

router.use("/api/auth", rateLimiter, authRoutes);
router.use("/api/users", userRoutes);

router.use("/api/profile", profileRoutes);

router.use("/api/leads", leadsRoutes);

export { router as routes };
