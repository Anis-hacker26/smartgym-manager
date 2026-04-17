import { Request, Response } from 'express';
import Booking from '../models/Booking';
import WellnessService from '../models/WellnessService';
import Member from '../models/Member';
import User from '../models/User';
import notificationService from '../services/notificationService';

// Business rules constants
const OPERATING_HOURS = {
  start: 5, // 5:00 AM
  end: 22, // 10:00 PM
  lunchBreakStart: 13, // 1:00 PM
  lunchBreakEnd: 14 // 2:00 PM
};

const ALLOWED_DAYS = [5, 6]; // Friday (5) and Saturday (6)
const PREPARATION_MINUTES = 10; // 10 minutes preparation time between bookings

// Helper: Check if date is allowed (Friday or Saturday)
const isAllowedDay = (date: Date): boolean => {
  const day = date.getDay();
  return ALLOWED_DAYS.includes(day);
};

// Helper: Check if time slot is within operating hours
const isValidTimeSlot = (startTime: Date): boolean => {
  const hour = startTime.getHours();
  const minute = startTime.getMinutes();
  
  if (hour < OPERATING_HOURS.start || hour >= OPERATING_HOURS.end) {
    return false;
  }
  
  if (hour === OPERATING_HOURS.lunchBreakStart && minute >= 0) {
    return false;
  }
  if (hour === OPERATING_HOURS.lunchBreakEnd - 1 && minute > 0) {
    return false;
  }
  if (hour >= OPERATING_HOURS.lunchBreakStart && hour < OPERATING_HOURS.lunchBreakEnd) {
    return false;
  }
  
  return true;
};

// Helper: Generate available time slots for a service on a given date
const generateTimeSlots = async (serviceId: string, date: Date): Promise<any[]> => {
  const service = await WellnessService.findById(serviceId);
  if (!service) return [];

  const slots: any[] = [];
  const startHour = OPERATING_HOURS.start;
  const endHour = OPERATING_HOURS.end;
  const serviceDuration = service.duration;
  const totalSlotDuration = serviceDuration + PREPARATION_MINUTES; // 15 min service + 10 min prep = 25 min total
  
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);
  
  // Generate slots from start hour to end hour
  let currentTime = new Date(baseDate);
  currentTime.setHours(startHour, 0, 0);
  
  const endTime = new Date(baseDate);
  endTime.setHours(endHour, 0, 0);
  
  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);
    
    // Check if slot end exceeds operating hours
    if (slotEnd.getHours() >= endHour && slotEnd.getMinutes() > 0) {
      break;
    }
    
    // Skip lunch break
    const slotHour = currentTime.getHours();
    if (slotHour >= OPERATING_HOURS.lunchBreakStart && slotHour < OPERATING_HOURS.lunchBreakEnd) {
      currentTime = new Date(baseDate);
      currentTime.setHours(OPERATING_HOURS.lunchBreakEnd, 0, 0);
      continue;
    }
    
    if (isValidTimeSlot(currentTime)) {
      // Check existing bookings for this time slot
      const existingBookings = await Booking.find({
        serviceId,
        startTime: {
          $gte: new Date(currentTime),
          $lt: new Date(slotEnd)
        },
        status: { $in: ['CONFIRMED', 'PENDING'] }
      });
      
      const bookedCount = existingBookings.length;
      const isAvailable = bookedCount < service.capacity;
      
      // Check preparation buffer time (no bookings within PREPARATION_MINUTES before this slot)
      const bufferStart = new Date(currentTime);
      bufferStart.setMinutes(bufferStart.getMinutes() - PREPARATION_MINUTES);
      
      const bufferBookings = await Booking.find({
        serviceId,
        startTime: { 
          $gte: bufferStart, 
          $lt: currentTime 
        },
        status: { $in: ['CONFIRMED', 'PENDING'] }
      });
      
      const hasBufferConflict = bufferBookings.length > 0;
      
      slots.push({
        time: currentTime.toISOString(),
        displayTime: currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        endTime: slotEnd.toISOString(),
        displayEndTime: slotEnd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        available: isAvailable && !hasBufferConflict,
        bookedCount,
        capacity: service.capacity,
        remainingSlots: service.capacity - bookedCount
      });
    }
    
    // Move to next slot (service duration + preparation time)
    currentTime = new Date(currentTime);
    currentTime.setMinutes(currentTime.getMinutes() + totalSlotDuration);
  }
  
  return slots;
};

// Get all wellness services
export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await WellnessService.find({ isActive: true });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
};

// Get real-time available slots
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { serviceId, date } = req.query;
    
    if (!serviceId || !date) {
      return res.status(400).json({ message: 'Service ID and date are required' });
    }
    
    const bookingDate = new Date(date as string);
    
    if (!isAllowedDay(bookingDate)) {
      return res.json({ 
        success: true, 
        data: [], 
        message: 'Wellness services are only available on Fridays and Saturdays' 
      });
    }
    
    const slots = await generateTimeSlots(serviceId as string, bookingDate);
    
    res.json({ 
      success: true, 
      data: slots,
      operatingHours: OPERATING_HOURS,
      preparationMinutes: PREPARATION_MINUTES
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching available slots', error });
  }
};

// Create new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { serviceId, bookingDate, startTime, isWalkIn, guestName, guestPhone } = req.body;
    const userId = (req as any).userId;
    
    const service = await WellnessService.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const date = new Date(bookingDate);
    if (!isAllowedDay(date)) {
      return res.status(400).json({ message: 'Bookings are only allowed on Fridays and Saturdays' });
    }
    
    const startDateTime = new Date(startTime);
    if (!isValidTimeSlot(startDateTime)) {
      return res.status(400).json({ message: 'Invalid time slot' });
    }
    
    // Check availability
    const slots = await generateTimeSlots(serviceId, date);
    const selectedSlot = slots.find(slot => slot.time === startTime);
    
    if (!selectedSlot || !selectedSlot.available) {
      return res.status(400).json({ message: 'Selected time slot is no longer available' });
    }
    
    // Check if member has active membership
    let amount = service.priceForGuest;
    let memberId = null;
    let hasActiveMembership = false;
    
    if (!isWalkIn && userId) {
      const user = await User.findById(userId);
      if (user && user.role === 'MEMBER') {
        const member = await Member.findOne({ userId: user._id });
        if (member) {
          // Check for active membership
          const activeMembership = await Booking.db.collection('memberships').findOne({
            memberId: member._id,
            status: 'ACTIVE',
            endDate: { $gt: new Date() }
          });
          
          if (activeMembership) {
            hasActiveMembership = true;
            amount = service.priceForMember;
            memberId = member._id;
          } else {
            return res.status(400).json({ 
              message: 'Active membership required for free booking. Please renew your membership.' 
            });
          }
        }
      }
    }
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + service.duration);
    
    const booking = await Booking.create({
      memberId,
      guestName: isWalkIn ? guestName : undefined,
      guestPhone: isWalkIn ? guestPhone : undefined,
      serviceId,
      bookingDate: date,
      startTime: startDateTime,
      endTime: endDateTime,
      status: 'CONFIRMED',
      paymentStatus: amount === 0 ? 'PAID' : 'PENDING',
      amount,
      isWalkIn: isWalkIn || false
    });
    
    await notificationService.sendBookingConfirmation(booking);
    
    res.status(201).json({ 
      success: true, 
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating booking', error });
  }
};

// Get member's own bookings
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const member = await Member.findOne({ userId: user._id });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const bookings = await Booking.find({ memberId: member._id })
      .populate('serviceId')
      .sort({ startTime: -1 });
    
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let query: any = {};
    
    if (startDate && endDate) {
      query.bookingDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('serviceId')
      .populate('memberId', 'name mobileNumber memberId')
      .sort({ startTime: -1 });
    
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('serviceId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const hoursDifference = (startTime.getTime() - now.getTime()) / (1000 * 3600);
    
    let cancellationCharge = 0;
    
    if (hoursDifference >= 10) {
      cancellationCharge = 0;
      booking.paymentStatus = 'REFUNDED';
    } else if (hoursDifference < 4 && hoursDifference > 0) {
      cancellationCharge = 100;
      booking.paymentStatus = 'REFUNDED';
    } else if (hoursDifference <= 0) {
      cancellationCharge = 100;
      booking.status = 'NO_SHOW';
      booking.paymentStatus = 'PAID';
    }
    
    booking.status = 'CANCELLED';
    booking.cancellationCharge = cancellationCharge;
    booking.cancelledAt = new Date();
    
    await booking.save();
    await notificationService.sendCancellationConfirmation(booking, cancellationCharge);
    
    res.json({ 
      success: true, 
      data: booking,
      message: `Booking cancelled. ${cancellationCharge > 0 ? `Cancellation charge: ₹${cancellationCharge}` : 'No cancellation fee.'}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling booking', error });
  }
};

// Regenerate QR code for member
export const regenerateQRCode = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const QRCode = require('qrcode');
    
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const qrData = JSON.stringify({
      memberId: member.memberId,
      name: member.name,
      mobile: member.mobileNumber
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    member.qrCode = qrCode;
    await member.save();
    
    res.json({ success: true, qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code', error });
  }
};

export const seedServices = async (req: Request, res: Response) => {
  try {
    await WellnessService.deleteMany({});
    await WellnessService.insertMany([
      {
        name: 'Steam Bath',
        description: 'Relaxing steam bath therapy',
        duration: 15,
        priceForMember: 0,
        priceForGuest: 200,
        capacity: 2,
        category: 'STEAM_BATH',
        isActive: true
      },
      {
        name: 'Foot Massage',
        description: '15-minute relaxing foot massage',
        duration: 15,
        priceForMember: 0,
        priceForGuest: 300,
        capacity: 1,
        category: 'MASSAGE',
        isActive: true
      },
      {
        name: 'Full Body Massage',
        description: '15-minute full body massage',
        duration: 15,
        priceForMember: 0,
        priceForGuest: 300,
        capacity: 1,
        category: 'MASSAGE',
        isActive: true
      },
      {
        name: 'Foot Kansa Thalee',
        description: 'Traditional foot therapy with Kansa bowl',
        duration: 10,
        priceForMember: 0,
        priceForGuest: 300,
        capacity: 1,
        category: 'FOOT_THERAPY',
        isActive: true
      }
    ]);
    
    res.json({ success: true, message: 'Services seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding services', error });
  }
};