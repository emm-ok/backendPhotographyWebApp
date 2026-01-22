import { Router } from 'express'
import { register, login, fetchMe, logout, googleCallback, refreshToken } from './auth.controller.js'
import { protect } from '../../middlewares/auth.middleware.js'
import passport from 'passport';
import { env } from '../../config/env.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get("/refresh-token", refreshToken)

authRouter.get('/me', protect, fetchMe);

authRouter.get(
    '/google',
    passport.authenticate('google', { scope: ["profile", "email"] })
);

authRouter.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${env.CLIENT_URL}/login`
    }), 
    googleCallback
)
export default authRouter;