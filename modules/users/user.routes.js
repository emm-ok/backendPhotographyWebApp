import { Router } from "express";
import { getUserById, getAllUsers, getCurrentUser, updateUserById } from './user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js'

import { allowRoles } from '../../middlewares/role.middleware.js'
import { ROLES } from '../../constants/roles.js'

const userRouter = Router();

// Logged-in User routes
userRouter.get('/me', protect, getCurrentUser);
userRouter.patch('/:id', protect, updateUserById);

// Admin routes
userRouter.get('/', protect, allowRoles(ROLES.ADMIN),  getAllUsers);
userRouter.get('/:id', protect, allowRoles(ROLES.ADMIN),  getUserById);


export default userRouter;
// userRouter.patch('/:id/role', protect, allowRoles(ROLES.ADMIN), updateUserRole);