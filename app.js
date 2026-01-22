import express from 'express'

import cors from 'cors'
import morgan from 'morgan'
import { env } from './config/env.js'
import { connectToDatabase } from './config/db.js'
import cookieParser from 'cookie-parser';
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/users/user.routes.js';
import packageRouter from './modules/packages/package.routes.js';
import bookingRouter from './modules/bookings/booking.routes.js';
import paymentRouter from './modules/payments/payment.routes.js';
import mediaRouter from './modules/media/media.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import {authLimiter} from './middlewares/rateLimit.middleware.js'
import passport from 'passport'
import "./config/passport.js"
import dashboardRouter from './modules/dashboard/dashboard.routes.js'

const app = express();

app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
}));
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(authLimiter)
app.use(passport.initialize());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/packages', packageRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/media', mediaRouter);
app.use('/api/dashboard', dashboardRouter);

app.use(errorMiddleware);

app.get("/test-cookie", (req, res) => {
  res.cookie("testCookie", "123", {
    httpOnly: true,
    secure: false,
    sameSite: "None",
    path: "/",
  });

  res.json({ ok: true });
});


app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
    })
});

await connectToDatabase();

app.listen(env.PORT, () => {
    console.log(`Photography web app API is running on http://localhost:${env.PORT}`)
})