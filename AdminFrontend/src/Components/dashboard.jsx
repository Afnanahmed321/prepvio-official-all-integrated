import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  UserPlus, 
  ChevronDown, 
  TrendingUp, 
  MoreHorizontal, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  LogOut, 
  Camera, 
  Building,
  X
} from 'lucide-react';

// --- Initial Data ---
const initialAccountDetails = {
  name: 'Carla Sanford',
  email: 'carla.sanford@hreazec.com',
  phone: '+1 (555) 123-4567',
  position: 'HR Manager',
  department: 'Human Resources',
  joinDate: 'January 2020'
};

const dataByPeriod = {
  'Past 3 months': {
    kpiScore: 63.89,
    increase: 2.34,
    kpiData: [
      { month: 'May', value: 90, max: 100 },
      { month: 'Jun', value: 80, max: 100 },
      { month: 'Jul', value: 65, max: 100 }
    ],
    topPerformers: [
      { name: 'Lewis Guthowski', tasks: 314, avatar: '👨' },
      { name: 'Marlene Kuhlman', tasks: 289, avatar: '👩' },
      { name: 'Kristi Lueilwitz', tasks: 289, avatar: '👨' },
      { name: 'Abel Pollich', tasks: 232, avatar: '👨' }
    ]
  },
  'Past 6 months': {
    kpiScore: 75.42,
    increase: 5.67,
    kpiData: [
      { month: 'Feb', value: 70, max: 100 },
      { month: 'Mar', value: 85, max: 100 },
      { month: 'Apr', value: 75, max: 100 },
      { month: 'May', value: 90, max: 100 },
      { month: 'Jun', value: 80, max: 100 },
      { month: 'Jul', value: 65, max: 100 }
    ],
    topPerformers: [
      { name: 'Marlene Kuhlman', tasks: 567, avatar: '👩' },
      { name: 'Lewis Guthowski', tasks: 542, avatar: '👨' },
      { name: 'Abel Pollich', tasks: 498, avatar: '👨' },
      { name: 'Kristi Lueilwitz', tasks: 456, avatar: '👨' }
    ]
  },
  'Past year': {
    kpiScore: 68.23,
    increase: 3.89,
    kpiData: [
      { month: 'Jan', value: 65, max: 100 },
      { month: 'Feb', value: 70, max: 100 },
      { month: 'Mar', value: 85, max: 100 },
      { month: 'Apr', value: 75, max: 100 },
      { month: 'May', value: 90, max: 100 },
      { month: 'Jun', value: 80, max: 100 },
      { month: 'Jul', value: 65, max: 100 },
      { month: 'Aug', value: 72, max: 100 },
      { month: 'Sep', value: 68, max: 100 },
      { month: 'Oct', value: 78, max: 100 },
      { month: 'Nov', value: 74, max: 100 },
      { month: 'Dec', value: 70, max: 100 }
    ],
    topPerformers: [
      { name: 'Lewis Guthowski', tasks: 1124, avatar: '👨' },
      { name: 'Abel Pollich', tasks: 1089, avatar: '👨' },
      { name: 'Marlene Kuhlman', tasks: 1056, avatar: '👩' },
      { name: 'Kristi Lueilwitz', tasks: 987, avatar: '👨' }
    ]
  }
};

const upcomingMeetings = [
  { title: 'Project Manager - Job Interview', time: 'Today 08:00-08:00', avatars: ['👨', '👩', '👨'] },
  { title: 'Project Manager - Job Interview', time: 'Today 08:00-08:00', avatars: ['👩', '👨'] },
  { title: 'Project Manager - Job Interview', time: 'Today 08:00-08:00', avatars: ['👨', '👩', '👨'] }
];

// --- Edit Profile Modal Component ---
const EditProfileModal = ({ isOpen, onClose, accountDetails, setAccountDetails, accountImage, handleImageUpload }) => {
  const [formData, setFormData] = useState(accountDetails);

  useEffect(() => {
    setFormData(accountDetails);
  }, [accountDetails, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAccountDetails(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative flex-shrink-0">
              {accountImage ? (
                <img src={accountImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-orange-500" />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-2 border-orange-500">
                  {formData.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all shadow-lg">
                <Camera className="w-4 h-4 text-orange-600" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1 w-full">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
              />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all font-semibold text-gray-700 border border-white/50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-semibold shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Past 3 months');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [accountImage, setAccountImage] = useState(null);
  const [accountDetails, setAccountDetails] = useState(initialAccountDetails);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Backend data states
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from backend
  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard fetch failed', err);
        setLoading(false);
      });
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAccountImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-200 via-orange-100 to-gray-300 min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-gradient-to-br from-orange-200 via-orange-100 to-gray-300 min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-red-600">Failed to load dashboard data</div>
      </div>
    );
  }

  const currentData = dataByPeriod[selectedPeriod];
  const kpiData = currentData.kpiData;
  const topPerformers = currentData.topPerformers;
  const employees = dashboardData.employees || [];

  return (
    <div className="bg-gradient-to-br from-orange-200 via-orange-100 to-gray-300 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              {/* <div className="bg-orange-600 p-2 rounded-xl">
                <div className="w-6 h-6 bg-orange-400 rounded"></div>
              </div> */}
              {/* <span className="text-gray-600 font-semibold">HReazec</span> */}
              <h1 className="text-4xl font-bold text-gray-800 ml-8">Employees Dashboard</h1>
            </div>
            
            {/* Account Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/80 transition-all"
              >
                {accountImage ? (
                  <img src={accountImage} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {accountDetails.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <span className="text-sm font-medium">{accountDetails.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {showAccountMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowAccountMenu(false)}
                  ></div>
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-50">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {accountImage ? (
                            <img src={accountImage} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white" />
                          ) : (
                            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white">
                              {accountDetails.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <label className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all shadow-lg">
                            <Camera className="w-3 h-3 text-orange-600" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{accountDetails.name}</h3>
                          <p className="text-sm text-white/80">{accountDetails.position}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-700">{accountDetails.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-700">{accountDetails.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Building className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-700">{accountDetails.department}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-700">Joined {accountDetails.joinDate}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-700">Bengaluru, Karnataka, IN</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 p-2">
                      <button 
                        onClick={() => {
                          setIsEditModalOpen(true);
                          setShowAccountMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-lg transition-all"
                      >
                        <User className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Stats Cards - Using Backend Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-xs text-gray-600">Total Employees</span>
                  </div>
                  <div className="text-2xl font-bold">{dashboardData.totalEmployees || 0}</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-xs text-gray-600">Total Services</span>
                  </div>
                  <div className="text-2xl font-bold">{dashboardData.totalServices || 0}</div>
                </div>
                
              </div>

              {/* KPI Score Section */}
              {/* <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Average KPI Score</h2>
                  <select 
                    className="bg-white/60 px-4 py-2 rounded-lg text-sm border-0 cursor-pointer"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option>Past 3 months</option>
                    <option>Past 6 months</option>
                    <option>Past year</option>
                  </select>
                </div>
                <div className="flex flex-col md:flex-row gap-12">
                  <div>
                    <div className="text-5xl font-bold mb-1">{currentData.kpiScore}%</div>
                    <div className="text-sm text-green-600">↑ {currentData.increase}% inc</div>
                    <div className="flex items-end gap-2 sm:gap-4 mt-8 h-48">
                      {kpiData.map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                          <div className="relative w-full h-full flex flex-col justify-end">
                            <div className="w-full bg-gray-200 rounded-t-lg" style={{ height: `${item.max}%` }}>
                              <div 
                                className="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg transition-all"
                                style={{ height: `${item.value}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-4 w-full md:w-64">
                    <h3 className="font-semibold mb-4">Top Performance</h3>
                    <div className="space-y-3">
                      {topPerformers.map((performer, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white">
                              {performer.avatar}
                            </div>
                            {i === 0 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full text-xs flex items-center justify-center">⭐</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{performer.name}</div>
                            <div className="text-xs text-gray-600">{performer.tasks} tasks completed</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Employees Table - Using Backend Data */}
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">Employees</h2>
                {employees.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No employees found</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                        <th className="pb-3 font-medium">ID</th>
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Role</th>
                        {/* <th className="pb-3 font-medium">Performance</th> */}
                        <th className="pb-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, i) => (
                        <tr key={emp.empId || i} className="border-b border-gray-100">
                          <td className="py-4 text-sm text-gray-600">{emp.empId}</td>
                          <td className="py-4 text-sm font-medium">{emp.name}</td>
                          <td className="py-4 text-sm text-gray-600">{emp.role}</td>
                          <td className="py-4">
                            {/* <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                                  style={{ width: `${emp.performance || 0}%` }}
                                ></div>
                              </div>
                            </div> */}
                          </td>
                          {/* <td className="py-4">
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-full lg:w-72 space-y-6 flex-shrink-0">
              {/* Upcoming Meetings */}
              {/* <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Upcoming Meeting</h3>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium">{meeting.title}</div>
                          <div className="text-xs text-gray-400">{meeting.time}</div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        {meeting.avatars.map((avatar, j) => (
                          <div key={j} className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-xs">
                            {avatar}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Working Format */}
              {/* <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Working Format</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-600">On-site</div>
                      <div className="text-lg font-bold">13,982</div>
                    </div>
                    <div className="text-orange-500 font-semibold">11.4%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-600">Hybrid</div>
                      <div className="text-lg font-bold">26,214</div>
                    </div>
                    <div className="text-orange-500 font-semibold">32.2%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-600">Remote</div>
                      <div className="text-lg font-bold">41,214</div>
                    </div>
                    <div className="text-orange-500 font-semibold">56.4%</div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Render the modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        accountDetails={accountDetails}
        setAccountDetails={setAccountDetails}
        accountImage={accountImage}
        handleImageUpload={handleImageUpload}
      />
    </div>
  );
};

export default Dashboard;