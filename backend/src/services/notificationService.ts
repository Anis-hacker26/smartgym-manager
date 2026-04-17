import { IBooking } from '../models/Booking';
import Member from '../models/Member';
import WellnessService from '../models/WellnessService';

interface NotificationData {
  to: string; // phone number
  type: 'BOOKING_CONFIRMATION' | 'DAY_BEFORE_REMINDER' | 'TWO_HOUR_REMINDER' | 'CANCELLATION_CONFIRMATION';
  data: {
    bookingId: string;
    serviceName: string;
    date: string;
    time: string;
    duration: number;
    amount?: number;
    cancellationCharge?: number;
  };
}

class NotificationService {
  
  // Main function to send WhatsApp message (structure ready for API integration)
  private async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // TODO: Integrate actual WhatsApp API here
      // Options: Twilio, WhatsApp Business API, Gupshup, etc.
      
      console.log(`📱 WhatsApp Message to ${phoneNumber}:`);
      console.log(`   ${message}`);
      console.log('---');
      
      // Simulate API call
      return true;
      
      /* Actual integration example:
      const response = await fetch('https://graph.facebook.com/v17.0/WHATSAPP_PHONE_NUMBER_ID/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: { name: 'booking_confirmation', language: { code: 'en' } }
        })
      });
      return response.ok;
      */
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  // Format phone number for WhatsApp
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    // Add country code if not present (assuming India +91)
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }
    return cleaned;
  }

  // Get member/customer phone number
  private async getPhoneNumber(booking: IBooking): Promise<string | null> {
    if (booking.memberId) {
      const member = await Member.findById(booking.memberId);
      return member?.mobileNumber || null;
    }
    return booking.guestPhone || null;
  }

  // Send booking confirmation
  async sendBookingConfirmation(booking: IBooking): Promise<boolean> {
    const phoneNumber = await this.getPhoneNumber(booking);
    if (!phoneNumber) return false;

    const service = await WellnessService.findById(booking.serviceId);
    if (!service) return false;

    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const startTime = new Date(booking.startTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `✅ *Booking Confirmation - Perfect Fitness Club*

*Service:* ${service.name}
*Date:* ${bookingDate}
*Time:* ${startTime}
*Duration:* ${service.duration} minutes
*Amount:* ₹${booking.amount}

Thank you for choosing Perfect Fitness Club!

📌 Please arrive 10 minutes before your appointment.
⚠️ Cancellation Policy: Free cancellation 10+ hours before appointment.

Reply HELP for support or visit our app to manage bookings.`;

    const sent = await this.sendWhatsAppMessage(this.formatPhoneNumber(phoneNumber), message);
    
    if (sent) {
      booking.notificationSent.bookingConfirmation = true;
      await booking.save();
    }
    
    return sent;
  }

  // Send day before reminder
  async sendDayBeforeReminder(booking: IBooking): Promise<boolean> {
    const phoneNumber = await this.getPhoneNumber(booking);
    if (!phoneNumber) return false;

    const service = await WellnessService.findById(booking.serviceId);
    if (!service) return false;

    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const startTime = new Date(booking.startTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `🔔 *Reminder: Your Wellness Session Tomorrow*

*Service:* ${service.name}
*Date:* ${bookingDate}
*Time:* ${startTime}
*Duration:* ${service.duration} minutes

📍 Perfect Fitness Club

Need to reschedule? Please cancel at least 10 hours before to avoid charges.

Reply HELP for support.`;

    const sent = await this.sendWhatsAppMessage(this.formatPhoneNumber(phoneNumber), message);
    
    if (sent) {
      booking.notificationSent.dayBeforeReminder = true;
      await booking.save();
    }
    
    return sent;
  }

  // Send 2 hours before reminder
  async sendTwoHourReminder(booking: IBooking): Promise<boolean> {
    const phoneNumber = await this.getPhoneNumber(booking);
    if (!phoneNumber) return false;

    const service = await WellnessService.findById(booking.serviceId);
    if (!service) return false;

    const startTime = new Date(booking.startTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `⏰ *Reminder: Your Wellness Session in 2 Hours*

*Service:* ${service.name}
*Time:* ${startTime}
*Duration:* ${service.duration} minutes

📍 Perfect Fitness Club
Please arrive on time.

Reply HELP for support.`;

    const sent = await this.sendWhatsAppMessage(this.formatPhoneNumber(phoneNumber), message);
    
    if (sent) {
      booking.notificationSent.twoHourReminder = true;
      await booking.save();
    }
    
    return sent;
  }

  // Send cancellation confirmation
  async sendCancellationConfirmation(booking: IBooking, cancellationCharge: number): Promise<boolean> {
    const phoneNumber = await this.getPhoneNumber(booking);
    if (!phoneNumber) return false;

    const service = await WellnessService.findById(booking.serviceId);
    if (!service) return false;

    const message = `❌ *Booking Cancelled*

*Service:* ${service.name}
*Date:* ${new Date(booking.bookingDate).toLocaleDateString('en-IN')}
*Time:* ${new Date(booking.startTime).toLocaleTimeString('en-IN')}

${cancellationCharge > 0 ? `*Cancellation Charge:* ₹${cancellationCharge}\n` : '*No cancellation fee applied.*'}

We hope to see you again soon!

Reply HELP for support.`;

    const sent = await this.sendWhatsAppMessage(this.formatPhoneNumber(phoneNumber), message);
    
    if (sent) {
      booking.notificationSent.cancellationConfirmation = true;
      await booking.save();
    }
    
    return sent;
  }

  // Schedule reminders for a booking (to be called by cron job)
  async scheduleReminders(booking: IBooking): Promise<void> {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    
    // Day before reminder (24 hours before)
    const dayBefore = new Date(startTime);
    dayBefore.setDate(dayBefore.getDate() - 1);
    
    if (now >= dayBefore && !booking.notificationSent.dayBeforeReminder) {
      await this.sendDayBeforeReminder(booking);
    }
    
    // 2 hours before reminder
    const twoHoursBefore = new Date(startTime);
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
    
    if (now >= twoHoursBefore && !booking.notificationSent.twoHourReminder) {
      await this.sendTwoHourReminder(booking);
    }
  }
}

export default new NotificationService();