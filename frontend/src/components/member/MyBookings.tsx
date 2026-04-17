import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, AlertCircle, XCircle, CheckCircle, ArrowLeft, Loader, Trash2, RefreshCw } from 'lucide-react';

interface Booking {
  _id: string;
  serviceId: {
    name: string;
    duration: number;
    description: string;
  };
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
  cancellationCharge?: number;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/bookings/my-bookings');
      console.log('Raw bookings response:', response.data);
      setBookings(response.data.data);
      setDebug(`Found ${response.data.data.length} bookings`);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setDebug('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string, startTime: string, serviceName: string) => {
    const now = new Date();
    const bookingTime = new Date(startTime);
    const hoursDiff = (bookingTime.getTime() - now.getTime()) / (1000 * 3600);
    
    let message = `Are you sure you want to cancel your ${serviceName} booking?`;
    
    if (hoursDiff >= 10) {
      message += '\n\n✅ Free cancellation (10+ hours before)';
    } else if (hoursDiff < 4 && hoursDiff > 0) {
      message += '\n\n⚠️ Cancelling within 4-10 hours will incur a ₹100 charge.';
    } else if (hoursDiff <= 0) {
      message += '\n\n⚠️ This booking has already passed. Cancellation will be marked as no-show with ₹100 charge.';
    }
    
    if (!confirm(message)) return;
    
    setCancelling(bookingId);
    try {
      const response = await axios.put(`/api/bookings/bookings/${bookingId}/cancel`);
      alert(response.data.message || 'Booking cancelled successfully');
      fetchBookings(); // Refresh the list
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error cancelling booking');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> Confirmed</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle size={12} /> Cancelled</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> Completed</span>;
      case 'NO_SHOW':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold flex items-center gap-1"><AlertCircle size={12} /> No Show</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  // Check if booking is in the future and confirmed
  const canCancelBooking = (booking: Booking) => {
    const now = new Date();
    const bookingTime = new Date(booking.startTime);
    const isFuture = bookingTime > now;
    const isConfirmed = booking.status === 'CONFIRMED';
    
    console.log(`Booking ${booking._id}: isFuture=${isFuture}, isConfirmed=${isConfirmed}, startTime=${booking.startTime}, now=${now}`);
    
    return isFuture && isConfirmed;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-3 text-red-600" size={32} />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/member/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
              <p className="text-gray-600 mt-1">View and manage your wellness service bookings</p>
            </div>
          </div>
          <button
            onClick={fetchBookings}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Debug Info (remove in production) */}
        {debug && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 mb-4 text-xs text-blue-600 text-center">
            {debug}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 mb-6">You haven't made any wellness service bookings.</p>
            <button
              onClick={() => navigate('/member/book-wellness')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Book a Service
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const bookingDate = new Date(booking.bookingDate);
              const startTime = new Date(booking.startTime);
              const showCancelButton = canCancelBooking(booking);
              const isPast = startTime < new Date();
              
              return (
                <div key={booking._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{booking.serviceId.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{booking.serviceId.duration} minutes</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>{bookingDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span>
                        {startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(booking.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span>Perfect Fitness Club</span>
                    </div>
                  </div>
                  
                  {/* Cancel Button - Show for future confirmed bookings */}
                  {showCancelButton && (
                    <button
                      onClick={() => handleCancel(booking._id, booking.startTime, booking.serviceId.name)}
                      disabled={cancelling === booking._id}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 transition disabled:opacity-50 font-medium"
                    >
                      {cancelling === booking._id ? (
                        <>
                          <Loader className="animate-spin" size={18} />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <Trash2 size={18} />
                          Cancel Booking
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Message for past confirmed bookings */}
                  {!showCancelButton && booking.status === 'CONFIRMED' && isPast && (
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm py-2">
                      <AlertCircle size={16} />
                      This booking has already passed
                    </div>
                  )}
                  
                  {/* Message for cancelled bookings */}
                  {booking.status === 'CANCELLED' && booking.cancellationCharge && booking.cancellationCharge > 0 && (
                    <div className="mt-3 flex items-center justify-end gap-2 text-red-500 text-sm">
                      <AlertCircle size={14} />
                      Cancellation charge: ₹{booking.cancellationCharge}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}