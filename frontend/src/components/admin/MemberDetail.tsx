import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, CreditCard, Phone, Mail, MapPin, User, RefreshCw } from 'lucide-react';

interface MemberDetail {
  _id: string;
  memberId: string;
  name: string;
  email: string;
  mobileNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact: string;
  emergencyPhone: string;
  joinDate: string;
  qrCode: string;
  currentMembership: any;
  membershipHistory: any[];
}

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    fetchMemberDetails();
    fetchPlans();
  }, [id]);

  const fetchMemberDetails = async () => {
    try {
      const response = await axios.get(`/api/membership/members/${id}`);
      setMember(response.data.data);
    } catch (error) {
      console.error('Error fetching member:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/membership/plans');
      setPlans(response.data.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleRenew = async () => {
    if (!selectedPlan) {
      alert('Please select a plan');
      return;
    }

    try {
      await axios.post('/api/membership/renew', {
        memberId: id,
        planId: selectedPlan,
        paymentMethod: 'CASH'
      });
      alert('Membership renewed successfully!');
      setShowRenewModal(false);
      fetchMemberDetails();
    } catch (error) {
      alert('Error renewing membership');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!member) return <div className="text-center py-12">Member not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/members')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-text">Member Details</h1>
              <p className="text-gray-600 mt-1">ID: {member.memberId}</p>
            </div>
          </div>
          <button
            onClick={() => setShowRenewModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <RefreshCw size={20} />
            Renew Membership
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <p className="font-medium">{member.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail size={16} /> {member.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mobile Number</label>
                  <p className="font-medium flex items-center gap-2">
                    <Phone size={16} /> {member.mobileNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Date of Birth</label>
                  <p>{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Gender</label>
                  <p>{member.gender}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Joined Date</label>
                  <p>{new Date(member.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} /> {member.address || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-text mb-4">Emergency Contact</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Contact Name</label>
                  <p>{member.emergencyContact || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone Number</label>
                  <p>{member.emergencyPhone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Membership History */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-text mb-4">Membership History</h2>
              <div className="space-y-3">
                {member.membershipHistory?.map((membership: any) => (
                  <div key={membership._id} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{membership.planId.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(membership.startDate).toLocaleDateString()} - {new Date(membership.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{membership.paymentAmount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          membership.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {membership.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - QR Code & Current Membership */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-semibold text-center mb-4">Digital Membership Card</h3>
              <div className="flex justify-center mb-4">
                {member.qrCode ? (
                  <img src={member.qrCode} alt="QR Code" className="w-40 h-40 bg-white p-2 rounded-xl" />
                ) : (
                  <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center">
                    <span className="text-gray-400">QR Code</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-red-100">ID: {member.memberId}</p>
              </div>
            </div>

            {/* Current Membership */}
            {member.currentMembership && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Current Membership
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold">{member.currentMembership.planId.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid From</span>
                    <span>{new Date(member.currentMembership.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Until</span>
                    <span>{new Date(member.currentMembership.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold ${
                      member.currentMembership.status === 'ACTIVE' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {member.currentMembership.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-text mb-4">Renew Membership</h3>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="">Select a plan</option>
              {plans.map((plan: any) => (
                <option key={plan._id} value={plan._id}>
                  {plan.name} - ₹{plan.price} ({plan.durationInDays} days)
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <button
                onClick={handleRenew}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Confirm Renewal
              </button>
              <button
                onClick={() => setShowRenewModal(false)}
                className="flex-1 bg-gray-100 text-text py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}