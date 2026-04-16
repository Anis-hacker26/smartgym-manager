import { useEffect, useState } from 'react';
import { Search, Eye, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MembersList() {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/api/membership/members?search=${search}`);
      setMembers(response.data.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Members</h1>
            <p className="text-gray-600 mt-2">Manage all gym members</p>
          </div>
          <button
            onClick={() => navigate('/admin/members/add')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <UserPlus size={20} />
            Add New Member
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, mobile number, or member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member: any) => (
              <div key={member._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-500">ID: {member.memberId}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {member.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Mobile:</span> {member.mobileNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {member.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Joined:</span> {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                </div>
                
                <button
                  onClick={() => navigate(`/admin/members/${member._id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}