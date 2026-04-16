import express from 'express';
import { authenticate, requireAdmin, requireMember } from '../middleware/auth';
import {
  createOrder,
  verifyPayment,
  recordCashPayment,
  getPaymentHistory,
  getAllPayments
} from '../controllers/paymentController';

const router = express.Router();

// Payment routes
router.post('/create-order', authenticate, createOrder);
router.post('/verify-payment', authenticate, verifyPayment);
router.post('/cash-payment', authenticate, requireAdmin, recordCashPayment);
router.get('/history/:memberId', authenticate, requireMember, getPaymentHistory);
router.get('/all', authenticate, requireAdmin, getAllPayments);

export default router;