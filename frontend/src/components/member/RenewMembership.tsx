import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CreditCard, Wallet } from 'lucide-react';

interface Plan {
  _id: string;
  name: string;
  duration: string;
  durationInDays: number;
  price: number;
  features: string[];
}

export default function RenewMembership() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH'>('ONLINE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

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

    setLoading(true);
    try {
      const response = await axios.post('/api/membership/renew', {
        planId: selectedPlan._id,
        paymentMethod
      });

      if (paymentMethod === 'ONLINE') {
        // Redirect to payment page
        navigate(`/payment/${response.data.data.membership._id}`, {
          state: { amount: selectedPlan.price, membershipId: response.data.data.membership._id }
        });
      } else {
        alert('Membership renewed successfully! Please pay cash at the counter.');
        navigate('/member/dashboard');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error renewing membership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/member/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text">Renew Membership</h1>
            <p className="text-gray-600 mt-2">Choose a plan to continue your fitness journey</p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all ${
                selectedPlan?._id === plan._id ? 'ring-2 ring-primary transform scale-105' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <h3 className="text-xl font-bold text-text mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold text-primary mb-4">₹{plan.price}</p>
              <p className="text-gray-600 mb-4">{plan.durationInDays} days validity</p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600">✓ {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        {selectedPlan && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-text mb-4">Payment Method</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'ONLINE')}
                  className="text-primary"
                />
                <CreditCard size={20} />
                <span>Online Payment (Razorpay)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'CASH')}
                  className="text-primary"
                />
                <Wallet size={20} />
                <span>Cash at Counter</span>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedPlan && (
          <div className="flex gap-4">
            <button
              onClick={handleRenew}
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ₹${selectedPlan.price} and Renew`}
            </button>
            <button
              onClick={() => setSelectedPlan(null)}
              className="px-6 py-3 bg-gray-100 text-text rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}