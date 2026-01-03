import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Award,
  MonitorCheck,
  Globe,
  Sparkles,
  FileText,
  User,
  X,
  Bell,
  Search,
  ChevronLeft,
  MoreHorizontal,
  ArrowRight,
  ShieldCheck,
  Play
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { useAuthStore } from "../store/authstore";
import { formatDate } from "../utils/date";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const USER_API = "http://localhost:5000/api";

// --- ASSETS & CONFIGURATION ---
const ASSETS = {
  avatarPlaceholder: "https://api.dicebear.com/7.x/initials/svg?seed=",
  maleChar: "/SIRA.png",
};

// --- ANIMATION VARIANTS (Lightweight) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05, ease: "easeOut" },
  },
};

const itemUpVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

const hoverCardEffect = {
  y: -5,
  scale: 1.01,
  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
  transition: { type: "spring", stiffness: 300, damping: 20 }
};

// --- DATA ---
const motivationalQuotes = [
  "Keep pushing forward! 💪",
  "Every course is a new skill! 🚀",
  "You're doing amazing! ⭐",
  "Progress leads to results! 🎯",
  "Today is your day! 🔥"
];




const serviceConfigs = [
  { key: 'checkYourAbility', name: 'Check Your Ability', icon: MonitorCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'jobPortal', name: 'Job Portal Access', icon: Globe, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'aiSystem', name: 'AI System Tools', icon: Sparkles, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'resumeAnalyzer', name: 'Resume Analyzer', icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
];




const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { weight: 'bold' } } },
    y: { grid: { color: "#f3f4f6" }, ticks: { color: "#9ca3af" } },
  },
  plugins: {
    legend: { display: false },
    tooltip: { 
      backgroundColor: "#1A1A1A",
      padding: 12,
      cornerRadius: 8,
      titleFont: { weight: 'bold' },
      bodyFont: { weight: 'bold' }
    },
  },
};

// --- COMPONENTS ---

// 1. StatCard
const StatCard = ({ label, value, trend, icon: Icon, iconStyle, trendStyle, trendIcon: TrendIcon }) => (
  <motion.div 
    variants={itemUpVariants}
    whileHover={hoverCardEffect}
    className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between h-44 relative overflow-hidden group"
  >
    <div className={`absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-5 pointer-events-none ${iconStyle.includes('text-blue') ? 'bg-blue-500' : iconStyle.includes('text-purple') ? 'bg-purple-500' : 'bg-green-500'}`} />
    
    <div className="flex justify-between items-start z-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${iconStyle}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${trendStyle}`}>
        <TrendIcon className={`w-3 h-3`} /> 
        {trend}
      </div>
    </div>
    
    <div className="z-10 mt-auto pt-4">
      <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight leading-none">{value}</div>
      <div className="text-sm font-bold text-gray-400">{label}</div>
    </div>
  </motion.div>
);

// 2. Recommended Session Card (Responsive)
const RecommendedSessionCard = ({ onContinue, hasResume }) => (
  <motion.div 
    variants={itemUpVariants}
    className="bg-[#1A1A1A] rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden shadow-2xl shadow-gray-900/20 text-white flex flex-col justify-center min-h-[300px] md:min-h-[340px] group cursor-pointer"
  >
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity" />
    <div className="absolute bottom-0 left-0 w-full h-full opacity-10" style={{backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px"}} />
    
    <div className="relative z-10 max-w-lg">
      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-6 border border-white/10 text-[#D4F478]">
        <Zap className="w-3 h-3 fill-current" /> 
        RECOMMENDED FOR YOU
      </div>
      <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
        {hasResume ? "Continue Your Journey" : "Product Strategy"}<br/>
        {hasResume ? "" : "Deep Dive"}
      </h2>
      <p className="text-gray-400 mb-8 max-w-md text-sm md:text-lg leading-relaxed">
        {hasResume 
          ? "Pick up right where you left off and keep learning!" 
          : "Master the \"Circle Framework\" and improve your strategic thinking score."}
      </p>
      
      {hasResume && (
        <button 
          onClick={onContinue}
          className="bg-[#D4F478] text-black px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-white hover:scale-105 transition-all shadow-lg shadow-[#D4F478]/20 w-fit text-sm md:text-base"
        >
          <Play className="w-5 h-5 fill-black" />
          Continue Learning
        </button>
      )}
    </div>

    <motion.img 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.5 }}
      transition={{ delay: 0.2 }}
      src={ASSETS.maleChar} 
      className="absolute -bottom-10 -right-10 w-56 h-64 md:w-72 md:h-80 object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-700 hidden md:block" 
      alt="Mentor" 
    />
  </motion.div>
);

// 3. Service Card
const ServiceCard = ({ icon: Icon, name, color, bg }) => (
  <motion.div 
    whileHover={hoverCardEffect}
    className="p-5 rounded-[1.5rem] border bg-white border-gray-100 transition-all duration-300 flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-gray-900 text-sm truncate">{name}</h3>
      <p className="text-xs text-green-600 font-bold mt-0.5 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> Available
      </p>
    </div>
    <div className="w-8 h-8 rounded-full bg-[#D4F478] flex items-center justify-center shrink-0">
         <ArrowRight className="w-4 h-4 text-black" />
    </div>
  </motion.div>
);

// 4. Course Row
const CourseRow = ({ course }) => {
  const progress = course.totalSeconds > 0 
    ? Math.round((course.watchedSeconds / course.totalSeconds) * 100) 
    : 0;
  
  const status = course.completed ? "Completed" : "Ongoing";
  const color = course.completed ? "green" : "yellow";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100 gap-4 sm:gap-0">
      <div className="flex items-center gap-4">
        {course.channelThumbnail ? (
          <img 
            src={course.channelThumbnail} 
            alt={course.channelName}
            className="w-12 h-12 rounded-2xl object-cover"
          />
        ) : (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors font-bold text-lg ${color === 'green' ? 'bg-[#D4F478] text-black' : 'bg-yellow-100 text-yellow-700'}`}>
            {course.courseTitle.charAt(0)}
          </div>
        )}
        <div>
          <h4 className="font-bold text-gray-900 text-sm group-hover:text-black transition-colors">{course.courseTitle}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-medium">
            <User className="w-3 h-3" /> {course.channelName}
          </div>
        </div>
      </div>
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 w-full sm:w-auto">
         <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
           {status}
         </span>
         <div className="w-full sm:w-20 bg-gray-100 rounded-full h-1.5 mt-0 sm:mt-1">
            <div className={`h-1.5 rounded-full ${color === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${progress}%` }}></div>
         </div>
      </div>
    </div>
  );
};

// --- DASHBOARD MODAL ---
export const DashboardModal = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleManageAccount = () => {
    onClose();
    navigate("/dashboard");
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-md w-full p-6 md:p-8 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 relative"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-20 w-20 rounded-[1.5rem] bg-[#1A1A1A] flex items-center justify-center shadow-lg shadow-gray-200">
              <User className="text-[#D4F478] h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Welcome back, {user.name}</p>
          </div>

          <div className="space-y-4">
             <div className="p-5 rounded-2xl bg-[#FDFBF9] border border-gray-100">
               <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm uppercase tracking-wider">
                 <ShieldCheck size={16} /> Profile Info
               </div>
               <p className="text-sm text-gray-600 font-medium break-all">Name: <span className="text-gray-900">{user.name}</span></p>
               <p className="text-sm text-gray-600 font-medium break-all">Email: <span className="text-gray-900">{user.email}</span></p>
             </div>
          </div>

          <div className="mt-8 space-y-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleManageAccount} className="w-full py-3.5 px-4 bg-[#1A1A1A] text-white font-bold rounded-xl shadow-lg shadow-gray-200 hover:bg-black transition-colors">
              View Full Dashboard
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className="w-full py-3.5 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-red-500 hover:border-red-100 transition-colors">
              Log Out
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- MAIN PAGE ---
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          `${USER_API}/users/dashboard`,
          { withCredentials: true }
        );
        setDashboard(res.data);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleContinue = () => {
    if (!dashboard?.resume) return;

    const { courseId, channelId, videoId } = dashboard.resume;

    navigate(
      `/course/${channelId}/${courseId}${
        videoId ? `?video=${videoId}` : ""
      }`
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFBF9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1A1A1A]"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Failed to load dashboard
      </div>
    );
  }

  const stats = dashboard?.stats || {
  totalCourses: 0,
  completedCourses: 0,
  inProgressCourses: 0,
  totalWatchedHours: 0,
};

const weeklyActivity = dashboard?.weeklyActivity || {
  "3 Weeks Ago": 0,
  "2 Weeks Ago": 0,
  "Last Week": 0,
  "This Week": 0,
};



const chartData = {
  labels: Object.keys(weeklyActivity),
  datasets: [
    {
      label: "Learning Hours",
      data: Object.values(weeklyActivity).map(v =>
        Math.round(v * 10) / 10
      ),
      backgroundColor: "#D4F478",
      borderRadius: 12,
      borderSkipped: false,
    },
  ],
};


const courses = dashboard?.courses || [];

const derivedAchievements = courses
  .filter(course => course.watchedSeconds > 0)
  .map(course => {
    if (course.completed) {
      return {
        title: `Completed ${course.courseTitle}`,
        desc: `by ${course.channelName}`,
        icon: CheckCircle,
      };
    }

    return {
      title: `Started ${course.courseTitle}`,
      desc: `by ${course.channelName}`,
      icon: BookOpen,
    };
  })
  .slice(0, 3);


  const displayName = user?.name?.split(' ')[0] || 'User';
  const userAvatar = user?.profilePic || `${ASSETS.avatarPlaceholder}${encodeURIComponent(user?.name || 'User')}`;
  const activeServices = serviceConfigs.filter(service => user[service.key]);

  // Updated Cards with real data
  const staticCards = [
    { 
      label: "Total Courses", 
      value: stats.totalCourses.toString(), 
      icon: BookOpen, 
      iconStyle: "bg-blue-50 text-blue-600", 
      trend: `${stats.totalCourses} enrolled`, 
      trendStyle: "bg-green-50 text-green-600",
      trendIcon: TrendingUp
    },
    { 
      label: "Completed", 
      value: stats.completedCourses.toString(), 
      icon: CheckCircle, 
      iconStyle: "bg-[#D4F478] text-black", 
      trend: "Great progress!", 
      trendStyle: "bg-green-50 text-green-600",
      trendIcon: TrendingUp
    },
    { 
      label: "In Progress", 
      value: stats.inProgressCourses.toString(), 
      icon: Clock, 
      iconStyle: "bg-purple-50 text-purple-600", 
      trend: "Keep going!", 
      trendStyle: "bg-green-50 text-green-600",
      trendIcon: TrendingUp
    },
    { 
      label: "Hours Learned", 
      value: `${stats.totalWatchedHours}h`, 
      icon: Target, 
      iconStyle: "bg-orange-50 text-orange-600", 
      trend: "Time invested", 
      trendStyle: "bg-green-50 text-green-600",
      trendIcon: TrendingUp 
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9] font-sans selection:bg-[#D4F478] selection:text-black pb-10">
      
      {/* Navbar - Sticky */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF9]/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-black/10">P</div>
             <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">Prepvio.AI</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
               <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input type="text" placeholder="Search courses..." className="bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 w-64 shadow-sm" />
            </div>
            <button className="w-11 h-11 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:shadow-md transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div onClick={() => setShowModal(true)} className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all">
              <img src={userAvatar} alt="Profile" className="w-8 h-8 rounded-full object-cover bg-gray-100" />
              <span className="text-sm font-bold text-gray-700 hidden sm:block">{displayName}</span>
              <ChevronLeft className="-rotate-90 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      {showModal && <DashboardModal onClose={() => setShowModal(false)} />}

      <main className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header */}
        <motion.div 
          initial="hidden" animate="visible" variants={containerVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              {greeting}, <span className="text-gray-400">{displayName}.</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-base md:text-lg">{quote}</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staticCards.map((card, idx) => (
             <StatCard key={idx} {...card} />
          ))}
        </motion.div>

        {/* Main Bento Grid */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 space-y-8">
             
             {/* Recommended Session Card */}
             <RecommendedSessionCard 
               onContinue={handleContinue}
               hasResume={!!dashboard.resume}
             />

             {/* Chart Section */}
             <motion.div variants={itemUpVariants} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="font-bold text-xl text-gray-900">Learning Activity</h3>
                   <p className="text-sm text-gray-500 font-medium">You've learned {stats.totalWatchedHours} hours in total!</p>
                 </div>
                 <div className="p-2 bg-gray-50 rounded-xl"><TrendingUp className="w-5 h-5 text-gray-500" /></div>
               </div>
               <div className="h-64 w-full relative">
                 <Bar data={chartData} options={chartOptions} />
               </div>
             </motion.div>

             {/* Services Grid (Quick Actions) */}
             {activeServices.length > 0 && (
               <motion.div variants={itemUpVariants}>
                 <h3 className="font-bold text-xl text-gray-900 mb-4 ml-2">Your Premium Access</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {activeServices.map(service => (
                     <ServiceCard 
                       key={service.key}
                       {...service}
                     />
                   ))}
                 </div>
               </motion.div>
             )}
          </div>

          {/* Right Column (Sidebar Content) */}
          <div className="lg:col-span-4 space-y-8">
             
             {/* Achievements */}
             <motion.div variants={itemUpVariants} className="bg-[#1A1A1A] p-8 rounded-[2.5rem] shadow-xl shadow-gray-200 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full blur-[60px] opacity-40" />
                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-6 text-[#D4F478]">
                      <Award className="w-5 h-5" />
                      <h3 className="font-bold text-lg">Achievements</h3>
                   </div>
                   <div className="space-y-4">
                      {derivedAchievements.length > 0 ? (
  derivedAchievements.map((item, idx) => {
    const Icon = item.icon;
    return (
      <div
        key={idx}
        className="flex items-start gap-3 p-3 bg-white/10 rounded-xl border border-white/5 backdrop-blur-sm"
      >
        <div className="mt-1 w-8 h-8 bg-[#D4F478] rounded-lg flex items-center justify-center text-black shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <h4 className="font-bold text-sm">{item.title}</h4>
          <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
        </div>
      </div>
    );
  })
) : (
  <p className="text-sm text-gray-400">
    Start a course to unlock achievements 🚀
  </p>
)}

                   </div>
                   <button className="w-full mt-6 py-3 bg-[#D4F478] text-black font-bold rounded-xl text-sm hover:bg-white transition-colors">
                     View All Trophies
                   </button>
                </div>
             </motion.div>

             {/* Course List */}
             <motion.div variants={itemUpVariants} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-lg text-gray-900">Your Courses</h3>
                   <MoreHorizontal className="text-gray-400 w-5 h-5 cursor-pointer" />
                </div>
                <div className="space-y-2">
                   {courses.map((course, idx) => (
  <CourseRow key={`${course.courseId}-${idx}`} course={course} />
))}

                </div>
             </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}