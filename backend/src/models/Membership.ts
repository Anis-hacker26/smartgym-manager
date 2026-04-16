import mongoose, { Schema, Document } from 'mongoose';

export interface IMembership extends Document {
  memberId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  gracePeriodEnd?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'GRACE_PERIOD' | 'CANCELLED';
  paymentAmount: number;
  paymentMethod?: 'ONLINE' | 'CASH';
  paymentId?: string;
  paymentDate: Date;
  invoiceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'MembershipPlan',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  gracePeriodEnd: Date,
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'GRACE_PERIOD', 'CANCELLED'],
    default: 'ACTIVE'
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['ONLINE', 'CASH']
  },
  paymentId: String,
  paymentDate: {
    type: Date,
    default: Date.now
  },
  invoiceNumber: String
}, { timestamps: true });

export default mongoose.model<IMembership>('Membership', MembershipSchema);