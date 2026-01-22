import { Router } from 'express';

import {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings,
    getBookingDate,
    deleteBooking,
    updateBookingStatus,
} from './booking.controller.js'

import { protect } from '../../middlewares/auth.middleware.js'
import { allowRoles } from "../../middlewares/role.middleware.js"
import { ROLES } from '../../constants/roles.js';
import { checkOwnership } from '../../middlewares/ownership.middleware.js';
import Booking from './booking.model.js'

const bookingRouter = Router();

// Client
bookingRouter.post('/', protect, allowRoles(ROLES.CLIENT), createBooking);

// GET BOOKING DATES
bookingRouter.get(
    '/dates', 
    protect, 
    allowRoles(ROLES.CLIENT), 
    getBookingDate
)

bookingRouter.get('/me', protect, allowRoles(ROLES.CLIENT), getMyBookings);


// View booking
bookingRouter.get(
    '/:id', 
    protect, 
    checkOwnership(async (req) => {
        const booking = await Booking.findById(req.params.id);
        return booking?.user;
    }),
    getBookingById
);

bookingRouter.delete(
    '/:id', 
    protect, 
    checkOwnership(async (req) => {
        const booking = await Booking.findById(req.params.id);
        return booking?.user;
    }),
    deleteBooking
);

// Cancel Booking (client only, own booking)
bookingRouter.patch(
    '/:id/cancel', 
    protect, 
    allowRoles(ROLES.CLIENT, ROLES.ADMIN), 
    checkOwnership(async (req) => {
        const booking = await Booking.findById(req.params.id);
        return booking?.user;
    }),
    cancelBooking
);
bookingRouter.put(
    '/status/:id', 
    protect, 
    allowRoles(ROLES.ADMIN), 
    checkOwnership(async (req) => {
        const booking = await Booking.findById(req.params.id);
        return booking?.user;
    }),
    updateBookingStatus
);


// Admin
bookingRouter.get('/', protect, allowRoles(ROLES.ADMIN), getAllBookings);


export default bookingRouter;