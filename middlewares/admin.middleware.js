import { ROLES } from "../constants/roles";

export const adminOnly = (req, res, next) => {
    if(req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Admin access only"})
    }
    next();
}