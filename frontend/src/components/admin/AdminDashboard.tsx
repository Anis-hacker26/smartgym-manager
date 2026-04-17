import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Users, CreditCard, Calendar, DollarSign, UserPlus, List, Settings, Sparkles, Dumbbell } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMemberships: 0,
    monthlyRevenue: 0,
    todayBookings: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/membership/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-red-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalMembers}</p>
            <p className="text-gray-600 text-sm">Total Members</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-red-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeMemberships}</p>
            <p className="text-gray-600 text-sm">Active Memberships</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-red-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">₹{stats.monthlyRevenue.toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Monthly Revenue</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="text-red-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.todayBookings}</p>
            <p className="text-gray-600 text-sm">Today's Bookings</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Member Management Section */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={20} className="text-red-600" />
              Member Management
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/admin/members')}
                className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between"
              >
                <span>👥 View All Members</span>
                <span>→</span>
              </button>
              <button 
                onClick={() => navigate('/admin/members/add')}
                className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between"
              >
                <span>➕ Add New Member</span>
                <span>→</span>
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between">
                <span>📋 Manage Memberships</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Operations Section */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-red-600" />
              Operations
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/admin/manage-bookings')}
                className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between"
              >
                <span>📅 Manage Wellness Bookings</span>
                <span>→</span>
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between">
                <span>🧖 Manage Wellness Services</span>
                <span>→</span>
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between">
                <span>🏋️ Manage Equipment</span>
                <span>→</span>
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between">
                <span>📊 View Reports</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-6">
          <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
                <p className="text-red-100">Manage your gym operations efficiently</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate('/admin/members/add')}
                  className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  Add Member
                </button>
                <button 
                  onClick={() => navigate('/admin/manage-bookings')}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  View Bookings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-red-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium text-gray-800">System Ready</p>
                <p className="text-sm text-gray-500">Admin dashboard is ready to manage members and bookings</p>
              </div>
              <span className="text-xs text-gray-400">Just now</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium text-gray-800">Wellness Services Available</p>
                <p className="text-sm text-gray-500">Steam Bath, Foot Massage, Full Body Massage, Foot Kansa Thalee</p>
              </div>
              <span className="text-xs text-gray-400">Today</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}