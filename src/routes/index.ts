import { Router } from "express";
import { AuthRoutes } from "../app/modules/auth/auth.routes.js";
import { AIRoutes } from "../app/modules/ai/ai.routes.js";


 // ✅ ইমপোর্ট করুন

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/ai",AIRoutes)

export const IndexRoutes = router;