import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, DollarSign, Info, ChevronRight, AlertCircle, ArrowLeft, Sparkles, CheckCircle, CreditCard, AlertTriangle } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  priceForMember: number;
  priceForGuest: number;
  capacity: number;
  category: string;
}

interface TimeSlot {
  time: string;
  displayTime: string;
  available: boolean;
  bookedCount: number;
  capacity: number;
  remainingSlots: number;
}

interface MembershipStatus {
  hasActiveMembership: boolean;
  membershipPlan?: string;
  daysRemaining?: number;
}

export default function BookWellness() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [checkingMembership, setCheckingMembership] = useState(true);

  // Get next 4 weeks of Fridays and Saturdays
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.getDay();
      
      if (day === 5 || day === 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
        });
      }
    }
    return dates;
  };

  useEffect(() => {
    checkMembershipStatus();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedService, selectedDate]);

  const checkMembershipStatus = async () => {
    setCheckingMembership(true);
    try {
      const response = await axios.get('/api/membership/my-dashboard');
      const dashboardData = response.data.data;
      const hasActive = dashboardData.currentMembership && 
                        dashboardData.status === 'Active' &&
                        dashboardData.daysRemaining > 0;
      
      setMembershipStatus({
        hasActiveMembership: hasActive,
        membershipPlan: dashboardData.currentMembership?.planId?.name,
        daysRemaining: dashboardData.daysRemaining
      });
    } catch (error) {
      console.error('Error checking membership:', error);
      setMembershipStatus({ hasActiveMembership: false });
    } finally {
      setCheckingMembership(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/bookings/services');
      setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    }
  };

  const fetchTimeSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/bookings/availability', {
        params: { serviceId: selectedService?._id, date: selectedDate }
      });
      setTimeSlots(response.data.data);
      if (response.data.message) {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    
    // Check if member has active membership before allowing free booking
    if (!membershipStatus?.hasActiveMembership) {
      alert('❌ You need an active membership to book wellness services for free.\n\nPlease purchase a membership plan first or book as a guest at the counter.');
      navigate('/member/dashboard');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/bookings/bookings', {
        serviceId: selectedService._id,
        bookingDate: selectedDate,
        startTime: selectedSlot.time,
        isWalkIn: false
      });
      
      alert('✅ Booking successful! Check your WhatsApp for confirmation.');
      navigate('/member/my-bookings');
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('membership')) {
        alert('❌ Active membership required for free booking. Please renew your membership.');
        navigate('/member/dashboard');
      } else {
        alert(error.response?.data?.message || 'Error creating booking');
      }
    } finally {
      setLoading(false);
    }
  };

  const availableDates = getAvailableDates();

  // Show membership required message if no active membership
  if (!checkingMembership && membershipStatus && !membershipStatus.hasActiveMembership) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Membership Required</h2>
            <p className="text-gray-600 mb-4">
              You need an active membership to book wellness services for free.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                💡 Wellness services are FREE for members with an active membership.
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Guests can book services at the counter with applicable charges.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/member/dashboard')}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/member/renew')}
                className="flex-1 border-2 border-red-600 text-red-600 py-3 rounded-xl hover:bg-red-50 transition font-semibold"
              >
                Purchase Membership
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (checkingMembership) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying membership...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/member/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Book Wellness Service</h1>
            <p className="text-gray-600 mt-1">Relax and rejuvenate with our premium wellness services</p>
          </div>
        </div>

        {/* Membership Status Banner */}
        {membershipStatus?.hasActiveMembership && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <div>
              <p className="text-green-800 text-sm font-medium">
                ✅ Active Membership: {membershipStatus.membershipPlan}
              </p>
              <p className="text-green-600 text-xs">
                {membershipStatus.daysRemaining} days remaining • All wellness services are FREE for you!
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-red-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Select a Service</h2>
            </div>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service._id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep(2);
                  }}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{service.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock size={14} /> {service.duration} min
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users size={14} /> Max {service.capacity} {service.capacity > 1 ? 'persons' : 'person'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-green-600">FREE</p>
                      <p className="text-xs text-gray-500">for Members</p>
                      <p className="text-xs text-gray-400 line-through">₹{service.priceForGuest}</p>
                      <ChevronRight className="mt-2 text-gray-400" size={20} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date */}
        {step === 2 && selectedService && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button
              onClick={() => setStep(1)}
              className="text-red-600 mb-4 flex items-center gap-1 hover:underline"
            >
              ← Back to Services
            </button>
            
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-red-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Select Date</h2>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-yellow-700 flex items-center gap-2">
                <Info size={14} />
                Services available only on Fridays & Saturdays
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {availableDates.map((date) => (
                <button
                  key={date.value}
                  onClick={() => {
                    setSelectedDate(date.value);
                    setStep(3);
                  }}
                  className={`p-3 text-center rounded-xl border-2 transition-all ${
                    selectedDate === date.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <p className="font-semibold text-gray-800">{date.display.split(',')[0]}</p>
                  <p className="text-sm text-gray-500">{date.display.split(',')[1]}</p>
                </button>
              ))}
            </div>
            
            {availableDates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No available dates in the next 4 weeks
              </div>
            )}
          </div>
        )}

        {/* Step 3: Select Time Slot */}
        {step === 3 && selectedService && selectedDate && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button
              onClick={() => setStep(2)}
              className="text-red-600 mb-4 flex items-center gap-1 hover:underline"
            >
              ← Back to Date
            </button>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-red-600" size={24} />
                  <h2 className="text-xl font-semibold text-gray-800">Select Time</h2>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedService.name} • {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">Operating Hours</p>
                <p className="font-semibold text-gray-700">5:00 AM - 10:00 PM</p>
                <p className="text-xs text-gray-400">(Closed 1-2 PM)</p>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Loading available slots...</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500">No available slots for this date</p>
                <button
                  onClick={() => setStep(2)}
                  className="mt-4 text-red-600 hover:underline"
                >
                  Choose another date
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot)}
                      disabled={!slot.available}
                      className={`p-3 text-center rounded-xl border-2 transition-all ${
                        selectedSlot?.time === slot.time
                          ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                          : slot.available
                          ? 'border-green-200 hover:border-red-300 cursor-pointer bg-white'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">{slot.displayTime}</p>
                      {selectedService.capacity > 1 && slot.capacity > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {slot.remainingSlots} left
                        </p>
                      )}
                      {!slot.available && (
                        <p className="text-xs text-red-500 mt-1">Booked</p>
                      )}
                    </button>
                  ))}
                </div>
                
                {selectedSlot && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="bg-green-50 rounded-xl p-4 mb-4">
                      <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle size={18} />
                        Booking Summary
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{selectedSlot.displayTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{selectedService.duration} minutes</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-gray-600">Price:</span>
                          <span className="text-green-600 font-semibold">FREE for Members</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleBooking}
                      disabled={loading}
                      className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Confirm Booking
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}