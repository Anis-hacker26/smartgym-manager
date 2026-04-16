import { Request, Response } from 'express';
import Member from '../models/Member';
import Membership from '../models/Membership';
import MembershipPlan from '../models/MembershipPlan';
import Payment from '../models/Payment';
import User from '../models/User';
import QRCode from 'qrcode';

// Get all membership plans
export const getMembershipPlans = async (req: Request, res: Response) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error });
  }
};

// Add new member
export const addMember = async (req: Request, res: Response) => {
  try {
    const { name, email, mobileNumber, address, dateOfBirth, gender, emergencyContact, emergencyPhone } = req.body;

    // Check if user exists
    let user = await User.findOne({ mobileNumber });
    
    if (!user) {
      user = await User.create({ mobileNumber, role: 'MEMBER' });
    }

    // Check if member already exists
    const existingMember = await Member.findOne({ userId: user._id });
    if (existingMember) {
      return res.status(400).json({ message: 'Member already exists' });
    }

    // Create member
    const member = await Member.create({
      userId: user._id,
      name,
      email,
      mobileNumber,
      address,
      dateOfBirth,
      gender,
      emergencyContact,
      emergencyPhone,
      joinDate: new Date()
    });

    // Generate QR code
    const qrData = JSON.stringify({
      memberId: member.memberId,
      name: member.name,
      mobile: member.mobileNumber
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    member.qrCode = qrCode;
    await member.save();

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding member', error });
  }
};

// Get all members
export const getAllMembers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
          { memberId: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const members = await Member.find(query).populate('userId', 'mobileNumber');
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error });
  }
};

// Get single member
export const getMemberById = async (req: Request, res: Response) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('userId', 'mobileNumber');
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Get current membership
    const currentMembership = await Membership.findOne({
      memberId: member._id,
      status: { $in: ['ACTIVE', 'GRACE_PERIOD'] }
    }).populate('planId');
    
    // Get membership history
    const membershipHistory = await Membership.find({
      memberId: member._id
    }).populate('planId').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: member,
      currentMembership,
      membershipHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching member', error });
  }
};

// Renew membership
export const renewMembership = async (req: Request, res: Response) => {
  try {
    const { memberId, planId, paymentMethod } = req.body;
    
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Get current membership
    const currentMembership = await Membership.findOne({
      memberId: member._id,
      status: { $in: ['ACTIVE', 'GRACE_PERIOD'] }
    });
    
    let startDate = new Date();
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationInDays);
    
    // If renewing before expiry, start from end of current membership
    if (currentMembership && currentMembership.status === 'ACTIVE') {
      startDate = currentMembership.endDate;
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationInDays);
    }
    
    // Calculate grace period (2 days after expiry)
    const gracePeriodEnd = new Date(endDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 2);
    
    // Create new membership
    const membership = await Membership.create({
      memberId: member._id,
      planId,
      startDate,
      endDate,
      gracePeriodEnd,
      status: 'ACTIVE',
      paymentAmount: plan.price,
      paymentMethod,
      paymentDate: new Date()
    });
    
    // Create payment record
    const payment = await Payment.create({
      membershipId: membership._id,
      memberId: member._id,
      amount: plan.price,
      paymentMethod,
      paymentStatus: paymentMethod === 'CASH' ? 'SUCCESS' : 'PENDING',
      paymentDate: new Date()
    });
    
    res.json({
      success: true,
      data: { membership, payment },
      message: 'Membership renewed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error renewing membership', error });
  }
};

// Get member dashboard data
export const getMemberDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const member = await Member.findOne({ userId: user._id });
    if (!member) {
      return res.status(404).json({ message: 'Member profile not found' });
    }
    
    // Get current membership
    let currentMembership = await Membership.findOne({
      memberId: member._id,
      status: { $in: ['ACTIVE', 'GRACE_PERIOD'] }
    }).populate('planId');
    
    // Calculate days remaining and status
    let daysRemaining = 0;
    let status = 'No Active Membership';
    
    if (currentMembership) {
      const today = new Date();
      const endDate = new Date(currentMembership.endDate);
      const gracePeriodEnd = currentMembership.gracePeriodEnd ? new Date(currentMembership.gracePeriodEnd) : null;
      
      // Check if membership is expired or in grace period
      if (today > endDate) {
        if (gracePeriodEnd && today <= gracePeriodEnd) {
          status = 'Grace Period';
          daysRemaining = Math.ceil((gracePeriodEnd.getTime() - today.getTime()) / (1000 * 3600 * 24));
          // Update status in database
          currentMembership.status = 'GRACE_PERIOD';
          await currentMembership.save();
        } else {
          status = 'Expired';
          daysRemaining = 0;
          currentMembership.status = 'EXPIRED';
          await currentMembership.save();
        }
      } else {
        status = 'Active';
        daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        currentMembership.status = 'ACTIVE';
        await currentMembership.save();
      }
    }
    
    // Get recent payments
    const recentPayments = await Payment.find({ memberId: member._id })
      .sort({ paymentDate: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        member,
        currentMembership,
        daysRemaining,
        status,
        recentPayments
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard data', error });
  }
};

// Get admin statistics
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalMembers = await Member.countDocuments();
    const activeMemberships = await Membership.countDocuments({ status: 'ACTIVE' });
    
    // Calculate monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfMonth },
          paymentStatus: 'SUCCESS'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const monthlyRevenue = monthlyPayments.length > 0 ? monthlyPayments[0].total : 0;
    const todayBookings = 0; // Will be implemented in Phase 3
    
    res.json({
      success: true,
      data: {
        totalMembers,
        activeMemberships,
        monthlyRevenue,
        todayBookings
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};