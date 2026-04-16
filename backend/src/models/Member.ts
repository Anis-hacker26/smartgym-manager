import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  userId: mongoose.Types.ObjectId;
  memberId: string;
  name: string;
  email: string;
  mobileNumber: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  emergencyContact?: string;
  emergencyPhone?: string;
  joinDate: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  profileImage?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  memberId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  address: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER']
  },
  emergencyContact: String,
  emergencyPhone: String,
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  profileImage: String,
  qrCode: String
}, { timestamps: true });

// Generate member ID before saving
MemberSchema.pre('save', async function(next) {
  if (!this.memberId) {
    const MemberModel = mongoose.model('Member');
    const count = await MemberModel.countDocuments();
    this.memberId = `PERFIT${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IMember>('Member', MemberSchema);