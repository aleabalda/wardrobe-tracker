import { Router } from "express";
import authRoutes from "./auth.routes";
import clothingRoutes from "./clothing.routes";

const router = Router();
router.use("/auth", authRoutes);
router.use("/clothing", clothingRoutes);
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
