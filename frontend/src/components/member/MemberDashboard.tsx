import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, CreditCard, Award, AlertCircle, Dumbbell, Sparkles, Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface DashboardData {
  member: {
    _id: string;
    memberId: string;
    name: string;
    email: string;
    mobileNumber: string;
  };
  currentMembership: {
    _id: string;
    planId: {
      name: string;
      price: number;
      duration: string;
    };
    startDate: string;
    endDate: string;
    status: string;
  };
  daysRemaining: number;
  status: string;
  recentPayments: any[];
}

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/membership/my-dashboard');
      console.log('Dashboard data:', response.data);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100';
      case 'Grace Period':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-2 rounded-xl">
                <Dumbbell className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Member Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button 
            onClick={() => navigate('/member/book-wellness')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2"
          >
            <Sparkles size={18} />
            Book Wellness Service
          </button>
          <button 
            onClick={() => navigate('/member/my-bookings')}
            className="border-2 border-red-600 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 transition font-semibold flex items-center gap-2"
          >
            <Heart size={18} />
            My Bookings
          </button>
        </div>

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {dashboardData?.member.name || 'Member'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's your fitness journey overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-red-600" size={24} />
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(dashboardData?.status || '')}`}>
                {dashboardData?.status || 'No Active'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              {dashboardData?.daysRemaining && dashboardData.daysRemaining > 0 ? dashboardData.daysRemaining : 0} days
            </h3>
            <p className="text-gray-600 text-sm">Remaining</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              {dashboardData?.currentMembership?.planId?.name || 'No Active Plan'}
            </h3>
            <p className="text-gray-600 text-sm">Current Plan</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              ₹{dashboardData?.currentMembership?.planId?.price?.toLocaleString() || 0}
            </h3>
            <p className="text-gray-600 text-sm">Membership Fee</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              {dashboardData?.currentMembership?.endDate 
                ? new Date(dashboardData.currentMembership.endDate).toLocaleDateString()
                : 'N/A'}
            </h3>
            <p className="text-gray-600 text-sm">Valid Until</p>
          </div>
        </div>

        {/* Membership Details Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Membership Details</h3>
          
          {dashboardData?.currentMembership ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Plan Type</span>
                  <span className="font-semibold">{dashboardData.currentMembership.planId.name}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Start Date</span>
                  <span>{new Date(dashboardData.currentMembership.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">End Date</span>
                  <span>{new Date(dashboardData.currentMembership.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${
                    dashboardData.status === 'Active' ? 'text-green-600' : 
                    dashboardData.status === 'Grace Period' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {dashboardData.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-lg text-green-600">₹{dashboardData.currentMembership.planId.price}</span>
                </div>
                {dashboardData.status === 'Grace Period' && (
                  <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                    <AlertCircle size={18} />
                    <span className="text-sm">Your membership is in grace period. Please renew soon!</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No active membership found</p>
              <button 
                onClick={() => navigate('/member/renew')}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Purchase Membership
              </button>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        {dashboardData?.recentPayments && dashboardData.recentPayments.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Payments</h3>
            <div className="space-y-3">
              {dashboardData.recentPayments.map((payment) => (
                <div key={payment._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Invoice: {payment.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{payment.amount}</p>
                    <p className="text-xs text-gray-500">{payment.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}