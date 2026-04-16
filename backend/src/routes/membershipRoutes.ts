import express from 'express';
import { authenticate, requireAdmin, requireMember } from '../middleware/auth';
import {
  addMember,
  getAllMembers,
  getMemberById,
  renewMembership,
  getMemberDashboard,
  getMembershipPlans,
  getAdminStats
} from '../controllers/membershipController';

const router = express.Router();

// Public routes (with authentication)
router.get('/plans', authenticate, getMembershipPlans);

// Admin only routes
router.post('/members', authenticate, requireAdmin, addMember);
router.get('/members', authenticate, requireAdmin, getAllMembers);
router.get('/members/:id', authenticate, requireAdmin, getMemberById);
router.post('/renew', authenticate, requireAdmin, renewMembership);
router.get('/admin/stats', authenticate, requireAdmin, getAdminStats);

// Member only routes
router.get('/my-dashboard', authenticate, requireMember, getMemberDashboard);

export default router;