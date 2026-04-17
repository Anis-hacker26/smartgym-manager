import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Filter, XCircle, CheckCircle, Users, ArrowLeft, Loader, Eye } from 'lucide-react';

interface Booking {
  _id: string;
  serviceId: { 
    name: string; 
    duration: number;
    priceForMember: number;
    priceForGuest: number;
  };
  memberId?: { 
    name: string; 
    mobileNumber: string; 
    memberId: string;
  };
  guestName?: string;
  guestPhone?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
  isWalkIn: boolean;
  createdAt: string;
}

export default function ManageBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/bookings');
      setBookings(response.data.data);
      setFilteredBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    if (searchTerm) {
      filtered = filtered.filter(b => 
        (b.memberId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.memberId?.mobileNumber?.includes(searchTerm) ||
         b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.guestPhone?.includes(searchTerm))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    setFilteredBookings(filtered);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const response = await axios.put(`/api/bookings/bookings/${bookingId}/cancel`);
      alert(response.data.message);
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error cancelling booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
      NO_SHOW: 'bg-gray-100 text-gray-700'
    };
    const icons: Record<string, JSX.Element> = {
      CONFIRMED: <CheckCircle size={12} />,
      CANCELLED: <XCircle size={12} />,
      COMPLETED: <CheckCircle size={12} />,
      NO_SHOW: <XCircle size={12} />
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${styles[status] || 'bg-yellow-100 text-yellow-700'}`}>
        {icons[status]} {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manage Bookings</h1>
              <p className="text-gray-600 mt-1">View and manage all wellness service bookings</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {filteredBookings.length} bookings
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{booking.serviceId.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {booking.isWalkIn 
                        ? `Walk-in: ${booking.guestName} (${booking.guestPhone})`
                        : `Member: ${booking.memberId?.name || 'N/A'} (${booking.memberId?.memberId || 'N/A'})`}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Time</p>
                    <p className="font-medium">{new Date(booking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Duration</p>
                    <p className="font-medium">{booking.serviceId.duration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Amount</p>
                    <p className="font-medium text-green-600">₹{booking.amount}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition"
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-3">
              <div className="border-b pb-2">
                <p className="text-gray-500 text-sm">Service</p>
                <p className="font-semibold">{selectedBooking.serviceId.name}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-gray-500 text-sm">Customer</p>
                <p className="font-semibold">
                  {selectedBooking.isWalkIn 
                    ? `${selectedBooking.guestName} (Walk-in)`
                    : selectedBooking.memberId?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedBooking.isWalkIn 
                    ? selectedBooking.guestPhone
                    : selectedBooking.memberId?.mobileNumber}
                </p>
              </div>
              <div className="border-b pb-2">
                <p className="text-gray-500 text-sm">Date & Time</p>
                <p>{new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p>{new Date(selectedBooking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-gray-500 text-sm">Duration</p>
                <p>{selectedBooking.serviceId.duration} minutes</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-gray-500 text-sm">Amount</p>
                <p className="font-semibold text-green-600">₹{selectedBooking.amount}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                {getStatusBadge(selectedBooking.status)}
              </div>
            </div>
            
            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-6 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}