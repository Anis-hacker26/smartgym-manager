import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  memberId?: mongoose.Types.ObjectId;
  guestName?: string;
  guestPhone?: string;
  serviceId: mongoose.Types.ObjectId;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  amount: number;
  cancellationCharge?: number;
  cancelledAt?: Date;
  isWalkIn: boolean;
  notificationSent: {
    bookingConfirmation: boolean;
    dayBeforeReminder: boolean;
    twoHourReminder: boolean;
    cancellationConfirmation: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member'
  },
  guestName: String,
  guestPhone: String,
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'WellnessService',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
    default: 'CONFIRMED'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED'],
    default: 'PENDING'
  },
  amount: {
    type: Number,
    required: true
  },
  cancellationCharge: Number,
  cancelledAt: Date,
  isWalkIn: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    bookingConfirmation: { type: Boolean, default: false },
    dayBeforeReminder: { type: Boolean, default: false },
    twoHourReminder: { type: Boolean, default: false },
    cancellationConfirmation: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Indexes for performance
BookingSchema.index({ bookingDate: 1, startTime: 1, serviceId: 1 });
BookingSchema.index({ memberId: 1, status: 1 });
BookingSchema.index({ startTime: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);