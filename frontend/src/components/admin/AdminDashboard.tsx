import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Users, CreditCard, Calendar, DollarSign, UserPlus, List, Settings } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-text">Welcome, Admin</span>
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
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-bold text-text mt-2">{stats.totalMembers}</p>
            <p className="text-gray-600 text-sm">Total Members</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-bold text-text mt-2">{stats.activeMemberships}</p>
            <p className="text-gray-600 text-sm">Active Memberships</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-bold text-text mt-2">₹{stats.monthlyRevenue.toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Monthly Revenue</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-bold text-text mt-2">{stats.todayBookings}</p>
            <p className="text-gray-600 text-sm">Today's Bookings</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Member Management
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/admin/members')}
                className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between"
              >
                <span>View All Members</span>
                <List size={16} />
              </button>
              <button 
                onClick={() => navigate('/admin/members/add')}
                className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between"
              >
                <span>Add New Member</span>
                <UserPlus size={16} />
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition flex items-center justify-between">
                <span>Manage Memberships</span>
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Operations
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                Manage Wellness Services
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                View Bookings
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 transition">
                Manage Equipment
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}