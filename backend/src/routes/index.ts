import { Router } from "express";
import authRoutes from "./auth.routes";
import clothingRoutes from "./clothing.routes";
import listingRoutes from "./listing.routes";
import userRoutes from "./user.routes";
import outfitRoutes from "./outfit.routes";

const router = Router();
router.use("/auth", authRoutes);
router.use("/clothing", clothingRoutes);
router.use("/listing", listingRoutes);
router.use("/outfit", outfitRoutes);
router.use("/user", userRoutes);
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
