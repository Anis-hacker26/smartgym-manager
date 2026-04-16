import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment';
import Membership from '../models/Membership';
import Member from '../models/Member';
import MembershipPlan from '../models/MembershipPlan';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

// Create Razorpay order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order', error });
  }
};

// Verify payment
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      membershipId,
      memberId,
      planId,
      amount
    } = req.body;
    
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: 'SUCCESS',
        paymentDate: new Date()
      },
      { new: true }
    );
    
    // Update membership status if needed (memberships are created as ACTIVE, not PENDING)
    if (payment) {
      const membership = await Membership.findById(payment.membershipId);
      // Memberships are already ACTIVE when created, no need to update status
      // Just log the successful payment
      console.log(`✅ Payment verified for membership: ${membershipId}`);
    }
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying payment', error });
  }
};

// Record cash payment (Admin only)
export const recordCashPayment = async (req: Request, res: Response) => {
  try {
    const { membershipId, memberId, amount } = req.body;
    
    const payment = await Payment.create({
      membershipId,
      memberId,
      amount,
      paymentMethod: 'CASH',
      paymentStatus: 'SUCCESS',
      paymentDate: new Date()
    });
    
    res.json({
      success: true,
      message: 'Cash payment recorded successfully',
      data: payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error recording payment', error });
  }
};

// Get payment history for a member
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    
    const payments = await Payment.find({ memberId })
      .sort({ paymentDate: -1 })
      .populate('membershipId');
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching payment history', error });
  }
};

// Get all payments (Admin only)
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find()
      .sort({ paymentDate: -1 })
      .populate('memberId', 'name memberId mobileNumber')
      .limit(100);
    
    const totalAmount = await Payment.aggregate([
      {
        $match: { paymentStatus: 'SUCCESS' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: payments,
      totalRevenue: totalAmount.length > 0 ? totalAmount[0].total : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching payments', error });
  }
};