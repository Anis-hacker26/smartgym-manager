export interface WellnessService {
  _id: string;
  name: string;
  description: string;
  duration: number;
  priceForMember: number;
  priceForGuest: number;
  capacity: number;
  category: string;
  isActive: boolean;
}

export interface TimeSlot {
  time: string;
  displayTime: string;
  available: boolean;
  bookedCount: number;
  capacity: number;
  remainingSlots: number;
}

export interface Booking {
  _id: string;
  memberId?: string;
  guestName?: string;
  guestPhone?: string;
  serviceId: WellnessService;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  amount: number;
  cancellationCharge?: number;
  isWalkIn: boolean;
  createdAt: string;
}