import { Router } from "express";

import {
  uploadMedia,
  getGalleryByBooking,
  deleteMedia,
} from "./media.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { ROLES } from "../../constants/roles.js";
import Booking from '../bookings/booking.model.js'
import { checkOwnership } from "../../middlewares/ownership.middleware.js";

const mediaRouter = Router();

// Upload photos (Admin)
mediaRouter.post("/", protect, allowRoles(ROLES.ADMIN), uploadMedia);

// Client Gallery access
mediaRouter.get(
  "/gallery/:bookingId",
  protect,
  checkOwnership(async (req) => {
    const booking = await Booking.finById(req.params.bookingId);
    return booking?.user;
  }),
  getGalleryByBooking
);

mediaRouter.delete("/:id", protect, allowRoles(ROLES.ADMIN), deleteMedia);

export default mediaRouter;
