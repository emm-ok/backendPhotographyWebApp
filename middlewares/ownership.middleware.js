import { ROLES } from "../constants/roles.js";

export const checkOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // Admin global access
      if (req.user.role === ROLES.ADMIN) return next();

      const resourceUserId = await getResourceUserId(req);

      if (!resourceUserId) {
        return res.status(404).json({ message: "Resource not found" });
      }

      if (resourceUserId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
