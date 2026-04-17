import express from 'express';
import { authenticate, requireAdmin, requireMember } from '../middleware/auth';
import {
  getServices,
  getAvailableSlots,
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  seedServices
} from '../controllers/bookingController';

const router = express.Router();

// Public routes (with authentication)
router.get('/services', authenticate, getServices);
router.get('/availability', authenticate, getAvailableSlots);

// Member routes
router.post('/bookings', authenticate, createBooking);
router.get('/my-bookings', authenticate, requireMember, getMyBookings);
router.put('/bookings/:id/cancel', authenticate, cancelBooking);

// Admin routes
router.get('/bookings', authenticate, requireAdmin, getAllBookings);
router.post('/seed-services', authenticate, requireAdmin, seedServices);

export default router;