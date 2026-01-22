import express, { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { getUserDashboard } from "./user.dashboard.controller.js";
import { getAdminDashboard } from "./admin.dashboard.controller.js";
import { ROLES } from "../../constants/roles.js";

const dashboardRouter = Router();

dashboardRouter.get("/user", protect, getUserDashboard);
dashboardRouter.get(
  "/admin",
  protect,
  allowRoles(ROLES.ADMIN),
  getAdminDashboard
);

export default dashboardRouter;
