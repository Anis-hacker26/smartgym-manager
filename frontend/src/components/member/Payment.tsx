import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { amount, membershipId } = location.state || {};

  useEffect(() => {
    if (!amount || !membershipId) {
      navigate('/member/dashboard');
    }
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create Razorpay order
      const orderResponse = await axios.post('/api/payments/create-order', {
        amount: amount,
        currency: 'INR'
      });
      
      const { order } = orderResponse.data;
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }
      
      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Perfect Fitness Club',
        description: 'Membership Renewal',
        order_id: order.id,
        handler: async (response: any) => {
          // Verify payment
          const verificationResponse = await axios.post('/api/payments/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            membershipId,
            amount
          });
          
          if (verificationResponse.data.success) {
            alert('Payment successful! Your membership has been renewed.');
            navigate('/member/dashboard');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'Member',
          email: 'member@perfectfitness.com',
          contact: '9999999999'
        },
        theme: {
          color: '#FF0000'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text">Complete Payment</h2>
          <p className="text-gray-600 mt-2">Secure payment gateway</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Membership Amount</span>
            <span className="text-2xl font-bold text-primary">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-600">Included</span>
          </div>
        </div>
        
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay ₹${amount} Now`}
        </button>
        
        <button
          onClick={() => navigate('/member/dashboard')}
          className="w-full mt-4 text-gray-600 hover:text-primary transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}