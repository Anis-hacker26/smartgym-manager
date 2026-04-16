import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  membershipId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'ONLINE' | 'CASH';
  paymentStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionId?: string;
  invoiceNumber: string;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema({
  membershipId: {
    type: Schema.Types.ObjectId,
    ref: 'Membership',
    required: true
  },
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['ONLINE', 'CASH'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'PENDING'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  transactionId: String,
  invoiceNumber: {
    type: String,
    unique: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Generate invoice number before saving
PaymentSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Payment').countDocuments();
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);