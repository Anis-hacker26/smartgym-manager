import { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, CreditCard, Award, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface DashboardData {
  member: {
    _id: string;
    memberId: string;
    name: string;
    email: string;
    mobileNumber: string;
    qrCode: string;
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fix: Use correct endpoint without double /api
      const response = await axios.get('/api/membership/my-dashboard');
      console.log('Dashboard data:', response.data);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* QR Code Card and Membership Details */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Digital Membership Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Digital Membership Card</h2>
              <p className="text-red-100 mt-1">Perfect Fitness Club</p>
            </div>
            
            <div className="flex justify-center mb-6">
              {dashboardData?.member.qrCode ? (
                <img 
                  src={dashboardData.member.qrCode} 
                  alt="QR Code" 
                  className="w-48 h-48 bg-white p-2 rounded-xl"
                />
              ) : (
                <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">QR Code</span>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-xl font-semibold">{dashboardData?.member.name}</p>
              <p className="text-red-100">Member ID: {dashboardData?.member.memberId}</p>
              <div className="mt-4 pt-4 border-t border-red-400">
                <p className="text-sm">{dashboardData?.currentMembership?.planId?.name || 'No Active Plan'}</p>
                {dashboardData?.status === 'Grace Period' && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-yellow-200">
                    <AlertCircle size={16} />
                    <span className="text-sm">Grace Period - Renew soon!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Membership Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Membership Details</h3>
            
            {dashboardData?.currentMembership ? (
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
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${
                    dashboardData.status === 'Active' ? 'text-green-600' : 
                    dashboardData.status === 'Grace Period' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {dashboardData.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-lg">₹{dashboardData.currentMembership.planId.price}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No active membership found</p>
                <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
                  Purchase Membership
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}