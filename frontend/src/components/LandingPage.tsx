import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Calendar, Users, Award, Shield, ArrowRight, Zap } from 'lucide-react';

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-2 rounded-xl">
                <Dumbbell className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">Smart<span className="text-red-600">Gym</span></span>
            </div>
            <div className="hidden md:flex gap-3">
              <button
                onClick={() => {
                  setSelectedRole('MEMBER');
                  setShowLoginModal(true);
                }}
                className="px-6 py-2.5 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition font-semibold"
              >
                Member Login
              </button>
              <button
                onClick={() => {
                  setSelectedRole('ADMIN');
                  setShowLoginModal(true);
                }}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold shadow-md"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-red-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-red-100 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-6">
              <Zap className="text-red-600" size={16} />
              <span className="text-red-600 text-sm font-semibold">Perfect Fitness Club</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to{' '}
              <span className="text-red-600 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">SmartGym</span>
              <br />
              <span className="text-gray-700">Manager</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your Journey to a Healthier You Starts Here. Track memberships, manage bookings, 
              and grow your fitness business with our comprehensive management solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSelectedRole('MEMBER');
                  setShowLoginModal(true);
                }}
                className="group px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg font-semibold flex items-center justify-center gap-2 text-lg"
              >
                Get Started 
                <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose <span className="text-red-600">SmartGym</span>?</h2>
          <p className="text-xl text-gray-600">Complete fitness management solution for modern gyms</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, title: "Member Management", desc: "Easy member onboarding and profile management", color: "bg-blue-100", iconColor: "text-blue-600" },
            { icon: Calendar, title: "Smart Booking", desc: "Book classes and wellness services instantly", color: "bg-green-100", iconColor: "text-green-600" },
            { icon: Award, title: "Digital Membership", desc: "QR code based digital membership cards", color: "bg-purple-100", iconColor: "text-purple-600" },
            { icon: Shield, title: "Secure Payments", desc: "Safe and secure online payment gateway", color: "bg-orange-100", iconColor: "text-orange-600" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className={feature.iconColor} size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "500+", label: "Active Members" },
              { number: "50+", label: "Expert Trainers" },
              { number: "20+", label: "Wellness Programs" },
              { number: "1000+", label: "Happy Clients" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-red-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLoginModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl"
            >
              ×
            </button>
            
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-red-100 to-red-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="text-red-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedRole === 'ADMIN' ? 'Admin Login' : 'Member Login'}
              </h2>
              <p className="text-gray-500 mt-2">Welcome back! Please login to your account</p>
            </div>

            <LoginForm 
              role={selectedRole} 
              onClose={() => setShowLoginModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Login Form Component
function LoginForm({ role, onClose }: { role: 'MEMBER' | 'ADMIN'; onClose: () => void }) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, role }),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setStep('otp');
        console.log('OTP sent:', data.debug);
        alert(`Demo OTP: ${data.debug || '123456'} (Check console for OTP)`);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please make sure backend is running on port 5000');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp: otpValue }),
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Verify response:', data);
      
      if (response.ok) {
        // Close modal
        onClose();
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (role === 'ADMIN') {
          console.log('Redirecting to admin dashboard');
          window.location.href = '/admin/dashboard';
        } else {
          console.log('Redirecting to member dashboard');
          window.location.href = '/member/dashboard';
        }
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Verify error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {step === 'mobile' ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendOTP();
              }}
            />
          </div>
          <button
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50 font-semibold"
          >
            {loading ? 'Sending...' : 'Continue with OTP'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter 6-digit OTP sent to <span className="font-semibold">{mobileNumber}</span>
            </label>
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50 font-semibold"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          <button
            onClick={() => setStep('mobile')}
            className="w-full text-gray-500 hover:text-red-600 transition"
          >
            ← Back to mobile number
          </button>
        </div>
      )}
    </div>
  );
}