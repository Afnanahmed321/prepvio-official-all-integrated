// Home.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import AuthModal from "../components/AuthModal"; // Add this line
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Globe,
  TrendingUp,
  Mic,
  Briefcase,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2,
  Star,
  Calendar,
  Lock,
  Sparkles,
  Check,
  Zap,
  Crown,
  Rocket
} from "lucide-react";

// ✅ Import Existing Functional Components
import Header from "./Header";
import ZigZagServices from "../HomePages/ZigZagServices";
import AboutUs from "../HomePages/AboutUs";
import FAQSection from "./Faqs";
import { useAuthStore } from "../store/authstore";

// Configure axios
axios.defaults.withCredentials = true;

/**
 * ASSETS & CONFIGURATION
 */
const ASSETS = {
  babaAi: "/BABA AI.png",
  siraAi: "/SIRA.png",
};



/**
 * ANIMATION VARIANTS
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1, ease: "easeOut" } },
};

const itemUpVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.8 } },
};

const itemSideVariants = (direction = "left") => ({
  hidden: { x: direction === "left" ? -40 : 40, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
});

const floatVariants = {
  animate: { y: [0, -12, 0], rotate: [0, 4, 0], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } },
};

const hoverCardEffect = {
  y: -8, scale: 1.01, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)", transition: { type: "spring", stiffness: 300, damping: 20 },
};

const switchVariants = {
  initial: { opacity: 0, scale: 0.9, rotateY: 15 },
  animate: { opacity: 1, scale: 1, rotateY: 0, transition: { duration: 0.8, type: "spring" } },
  exit: { opacity: 0, scale: 0.9, rotateY: -15, transition: { duration: 0.5 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20 } 
  }
};

/**
 * SUB-COMPONENTS
 */

// ✅ FIXED HeroTextSection with "Resume Practice" logic
const HeroTextSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalType, setModalType] = useState('login');

  // ✅ Check if user has used any credits
  const hasStartedInterviews = user?.subscription?.interviewsUsed > 0;
  const buttonText = hasStartedInterviews ? "Resume Practice" : "Start Practice";

  const handleStartPractice = () => {
    if (!isAuthenticated) {
      setModalType('login');
      setShowAuthModal(true);
      return;
    }

    if (!user?.isVerified) {
      setModalType('verify');
      setShowAuthModal(true);
      return;
    }

    // Navigate to interview page if authenticated and verified
    navigate('/services/check-your-ability/interview');
  };

  return (
    <>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        type={modalType}
      />
      
      <motion.div variants={itemSideVariants("left")} className="flex flex-col justify-center h-full relative z-30">
        <motion.div variants={floatVariants} animate="animate" className="absolute -top-16 -left-12 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="relative">
          <h1 className="text-6xl md:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] text-gray-900 mb-6 drop-shadow-sm">
            Master <br />
            <span className="text-4xl md:text-5xl xl:text-6xl font-medium text-gray-400 block mt-2 ml-1">
              Your Interview
            </span>
          </h1>
          <motion.div initial={{ width: 0 }} animate={{ width: 100 }} transition={{ delay: 1, duration: 1 }} className="h-1.5 bg-[#D4F478] mt-2 rounded-full mb-6 ml-2" />
        </div>

        <p className="text-gray-500 mb-10 max-w-xl text-lg leading-relaxed ml-1 font-medium">
          AI-powered simulations that transform nervous energy into executive presence before the stakes are real.
        </p>

        <div className="flex items-center gap-4 ml-1 relative z-40">
          <motion.button 
            onClick={handleStartPractice}
            whileHover="hover" 
            whileTap="tap" 
            className="flex items-center gap-0 group cursor-pointer"
          >
            <span className="bg-[#1A1A1A] text-white px-8 py-4 rounded-l-full font-bold text-lg shadow-xl shadow-gray-300/50 z-10 relative">
              {buttonText} {/* ✅ Dynamic button text */}
            </span>
            <motion.span 
              className="w-14 h-[3.75rem] flex items-center justify-center rounded-r-full bg-[#D4F478] border-l-2 border-[#1A1A1A] group-hover:bg-[#cbf060] transition-colors origin-left"
              variants={{ hover: { x: 5 }, tap: { x: 0 } }}
            >
              <ArrowRight className="w-6 h-6 text-black group-hover:rotate-[-45deg] transition-transform duration-300" />
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

const AgentCard = () => (
  <motion.div variants={itemUpVariants} whileHover={hoverCardEffect} className="bg-[#2A2A2A] rounded-[2.5rem] p-6 text-white flex items-center gap-5 relative overflow-hidden shadow-2xl shadow-gray-900/10 cursor-pointer group z-20">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors pointer-events-none" />
    <div className="relative shrink-0">
      <div className="w-20 h-20 rounded-full absolute -inset-1 bg-gradient-to-tr from-yellow-200 to-transparent blur-md opacity-20 animate-pulse pointer-events-none"></div>
      <img src={ASSETS.babaAi} alt="BABA AI" className="w-20 h-20 rounded-2xl object-cover relative z-10 border-[3px] border-[#3A3A3A] shadow-lg" />
      <div className="absolute -bottom-2 -right-2 bg-[#D4F478] text-black text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full z-20 shadow-lg border border-[#2A2A2A]">
        BABA AI
      </div>
    </div>
    <div className="relative z-10 flex flex-col justify-center">
      <h4 className="font-bold text-xl mb-1 tracking-tight">Real-time Fixes</h4>
      <p className="text-gray-400 text-xs font-medium mb-2.5">Instant Voice Assistant</p>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="w-3.5 h-3.5 fill-[#D4F478] text-[#D4F478]" />))}
      </div>
    </div>
  </motion.div>
);

const InfoCard = () => {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const target = 87;
      const interval = setInterval(() => {
        current += 2;
        if (current >= target) { setScore(target); clearInterval(interval); } else { setScore(current); }
      }, 30);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div variants={itemUpVariants} whileHover={hoverCardEffect} className="bg-white rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden min-h-[220px] border border-gray-100 h-full z-20">
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-50 rounded-full blur-xl opacity-80 pointer-events-none" />
      <div>
        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-5 text-green-600 shadow-inner">
          <TrendingUp className="w-6 h-6 fill-current" />
        </div>
        <h3 className="font-bold text-2xl mb-2 text-gray-900 tracking-tight">Confidence</h3>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-black text-gray-900">{score}%</span>
          <span className="text-gray-400 font-medium mb-2">Score</span>
        </div>
      </div>
      <div className="mt-4 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-green-400 to-[#D4F478]" />
      </div>
    </motion.div>
  );
};

const HeroServicesCard = () => (
  <motion.div variants={itemUpVariants} whileHover={hoverCardEffect} className="bg-[#EAE6F5] rounded-[2.5rem] p-7 relative overflow-hidden flex flex-col h-full shadow-sm cursor-pointer z-20">
    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200/50 rounded-full blur-[40px] pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/40 rounded-full blur-[40px] pointer-events-none" />
    <div className="flex justify-between items-center mb-6 relative z-10">
      <h3 className="font-bold text-xl text-gray-800 tracking-tight">Training Mode</h3>
      <div className="bg-white p-2 rounded-full shadow-sm"><Mic className="w-5 h-5 text-purple-500" /></div>
    </div>
    <div className="space-y-2.5 relative z-10 mt-auto">
      {[{ id: "01", text: "Behavioral Questions" }, { id: "02", text: "Technical Deep Dive" }, { id: "03", text: "Case Studies" }].map((item, idx) => (
        <motion.div key={idx} whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.9)" }} className="bg-white/60 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 transition-colors border border-white/20 shadow-sm cursor-pointer">
          <span className="text-[10px] font-bold bg-black text-white w-5 h-5 flex items-center justify-center rounded-full shrink-0">{item.id}</span>
          <span className="text-sm font-bold text-gray-700">{item.text}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const SuccessStoryCard = () => (
  <motion.div variants={itemSideVariants("right")} className="h-full z-20 relative">
    <motion.div whileHover={hoverCardEffect} className="bg-white rounded-[2.5rem] p-5 h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center relative overflow-hidden border border-gray-100 group">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
      <div className="relative mt-8 mb-4 w-full flex justify-center perspective-1000">
        <div className="w-48 h-48 rounded-full bg-blue-100/50 absolute top-4 blur-2xl scale-75 animate-pulse pointer-events-none" />
        
        <motion.img 
          initial={{ rotateY: 10 }} 
          whileHover={{ rotateY: 0, scale: 1.05 }} 
          transition={{ duration: 0.5 }} 
          src={ASSETS.siraAi} 
          alt="SIRA AI" 
          className="relative z-10 w-48 h-60 object-cover rounded-[2rem] shadow-2xl shadow-blue-900/20" 
          style={{ clipPath: "path('M 20 0 H 172 A 20 20 0 0 1 192 20 V 190 A 40 40 0 0 1 152 230 H 40 A 40 40 0 0 1 0 190 V 20 A 20 20 0 0 1 20 0 Z')" }} 
        />

        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-16 -right-2 z-20 bg-white p-2.5 rounded-2xl shadow-xl border border-gray-100">
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
            <Briefcase className="w-5 h-5" />
          </div>
        </motion.div>
      </div>
      <div className="mt-auto w-full bg-[#F8F9FB] rounded-[2rem] p-5 border border-gray-100 group-hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="text-left"><div className="font-bold text-gray-900 tracking-tight text-lg">SIRA AI.</div><div className="text-xs text-gray-500 font-medium">PrepVio AI models</div></div>
          <div className="bg-white p-1.5 rounded-full shadow-sm"><Globe className="w-4 h-4 text-blue-500" /></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">{[1, 2, 3, 4].map((i) => (<div key={i} className={`w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] overflow-hidden`}><img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" /></div>))}</div>
          <div className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full shadow-sm border border-green-100">Coming Soon..</div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const MetricCard = ({ label, value, color }) => (
  <div className="bg-slate-800/40 p-1.5 rounded-lg border border-slate-700/50 text-center backdrop-blur-sm">
    <div className={`text-xs font-bold ${color}`}>{value}</div>
    <div className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
  </div>
);

const HeroVisual = () => (
  <motion.div variants={switchVariants} initial="initial" animate="animate" exit="exit" className="h-full flex items-center z-20 relative">
    <div className="relative w-full max-w-lg mx-auto transform transition-transform hover:scale-[1.01] duration-500">
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-4">
          <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500/80"></div><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div><div className="w-3 h-3 rounded-full bg-emerald-500/80"></div></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div><div className="text-[10px] font-mono text-slate-400">REC • 04:12</div></div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-slate-800 rounded-2xl aspect-video relative overflow-hidden group min-h-[220px]">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center"><Users className="text-slate-600 opacity-50" size={48} /></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-slate-600 rounded-t-full opacity-80 blur-sm pointer-events-none"></div>
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-lg"><Activity size={10} /> Live Analysis</div>
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-amber-500/50 rounded-xl p-3 transform transition-all shadow-xl animate-in slide-in-from-bottom-2">
              <div className="flex items-start gap-3"><AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} /><div><p className="text-xs font-semibold text-slate-200">Pacing Alert</p><p className="text-[10px] text-slate-400 mt-0.5 leading-tight">You are speaking too fast (180wpm). Take a breath to improve clarity.</p></div></div>
            </div>
          </div>
          <div className="w-20 space-y-2 hidden sm:block">
            <MetricCard label="Confidence" value="82%" color="text-emerald-400" />
            <MetricCard label="Eye Contact" value="95%" color="text-emerald-400" />
            <MetricCard label="Clarity" value="64%" color="text-amber-400" />
            <div className="h-14 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700/50"><Mic size={16} className="text-slate-500 animate-pulse" /></div>
          </div>
        </div>
      </div>
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    </div>
  </motion.div>
);

const FloatingDecoration = () => (
  <motion.div variants={floatVariants} animate="animate" className="absolute top-24 right-1/4 pointer-events-none z-0 hidden lg:block">
    <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
      <path d="M20,60 Q40,10 60,60 T90,60" stroke="#FBCFE8" strokeWidth="6" strokeLinecap="round" fill="none" style={{ filter: "drop-shadow(0px 4px 8px rgba(251, 207, 232, 0.6))" }} />
      <circle cx="85" cy="35" r="6" fill="#FBCFE8" />
      <circle cx="15" cy="80" r="4" fill="#FBCFE8" />
    </svg>
  </motion.div>
);

const PartnersSection = () => (
  <div className="py-12 md:py-20 overflow-hidden">
    <div className="text-center mb-8"><span className="text-xs font-bold uppercase tracking-widest text-gray-400">Prepare for roles at top-tier companies</span></div>
    <div className="relative flex overflow-x-hidden group">
      <div className="animate-marquee whitespace-nowrap flex gap-16 items-center px-4">
        {['Google', 'Microsoft', 'Goldman Sachs', 'Deloitte', 'Amazon'].map((uni, i) => (
          <span key={i} className="text-2xl font-bold text-gray-300 flex items-center gap-2 hover:text-gray-400 transition-colors cursor-default"><div className="w-8 h-8 rounded-full bg-gray-200"></div> {uni}</span>
        ))}
        {['Google', 'Microsoft', 'Goldman Sachs', 'Deloitte', 'Amazon'].map((uni, i) => (
          <span key={`dup-${i}`} className="text-2xl font-bold text-gray-300 flex items-center gap-2 hover:text-gray-400 transition-colors cursor-default"><div className="w-8 h-8 rounded-full bg-gray-200"></div> {uni}</span>
        ))}
      </div>
    </div>
  </div>
);

const ProblemSection = () => (
  <div className="max-w-[1600px] mx-auto px-6 mb-20">
    <motion.div whileHover={{ y: -5 }} className="bg-[#1A1A1A] rounded-[3.5rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-gray-900/20">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">You Know Your Stuff. <br /><span className="text-gray-500">Why Do Interviews Feel Like a Gamble?</span></h2>
        <div className="space-y-4 text-lg text-gray-400 leading-relaxed"><p>"Your mind goes blank when asked 'Tell me about yourself.'"</p><p>"You ramble under pressure, losing the interviewer's attention."</p><p>"The regret of better answers keeps you up at night."</p></div>
        <div className="pt-4"><span className="text-[#D4F478] font-bold text-xl tracking-tight">There's a reason top performers make it look easy...</span></div>
      </div>
    </motion.div>
  </div>
);

// ✅ PLANS DATA (from payment.jsx)
const plans = [
  {
    id: 'monthly',
    name: 'Basic',
    price: '₹79',
    priceValue: 79,
    duration: '/month',
    interviews: 2,
    icon: Zap,
    isRecommended: false, 
    color: 'bg-blue-50 text-blue-600',
    description: "Essential tools for casual learners.",
    features: [
      '2 AI Interviews',
      'Standard support',
      'Course certificates',
      'Mobile app access'
    ]
  },
  {
    id: 'premium',
    name: 'Pro Access',
    price: '₹120',
    priceValue: 120,
    duration: '/month',
    interviews: 4,
    icon: Crown,
    isRecommended: true, 
    color: 'bg-[#D4F478] text-black', 
    description: "Best for serious students & job seekers.",
    features: [
      '4 AI Interviews',
      'Priority 24/7 support',
      'Offline downloads',
      'Exclusive webinars',
      'Interview prep module'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: '₹999',
    priceValue: 999,
    duration: '/year',
    interviews: 50,
    icon: Rocket,
    isRecommended: false,
    color: 'bg-orange-50 text-orange-600',
    description: "Best value for dedicated learners.",
    features: [
      '50 AI Interviews',
      '1-on-1 Mentorship',
      'Live doubt sessions',
      'Job placement assistance',
      'Custom learning path'
    ]
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '₹2,999',
    priceValue: 2999,
    duration: '/lifetime',
    interviews: 999,
    icon: Crown,
    isRecommended: false,
    color: 'bg-purple-50 text-purple-600',
    description: "Unlimited access forever.",
    features: [
      'Unlimited AI Interviews',
      'Lifetime access',
      'All premium features',
      'Priority support',
      'Future updates included'
    ]
  }
];

const PricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false); // ✅ NEW
  const [modalType, setModalType] = useState('login'); // ✅ NEW: 'login' or 'verify'
  const { refreshUser, isAuthenticated, user } = useAuthStore();

  // ✅ Fetch current subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isAuthenticated) return;
      
      try {
        const res = await axios.get(
          "http://localhost:5000/api/payment/interview-status",
          { withCredentials: true }
        );
        
        if (res.data.subscription && res.data.subscription.interviewsTotal > 0) {
          setCurrentPlan(res.data.subscription);
        }
      } catch (err) {
        console.error("Failed to fetch subscription", err);
      }
    };

    fetchSubscription();
  }, [isAuthenticated]);

  // ✅ Razorpay Payment Handler
  const handlePaymentWithPlan = async (planId) => {
    if (!isAuthenticated) {
      setModalType('login'); // ✅ CHANGED
      setShowAuthModal(true); // ✅ CHANGED
      return;
    }

    if (!user?.isVerified) {
      setModalType('verify'); // ✅ CHANGED
      setShowAuthModal(true); // ✅ CHANGED
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        { planId }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Prepvio AI",
        description: `${data.planName} - ${data.interviews} Interviews`,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              "http://localhost:5000/api/payment/verify",
              response
            );

            if (verifyRes.data.success) {
              await refreshUser();
              
              const res = await axios.get(
                "http://localhost:5000/api/payment/interview-status",
                { withCredentials: true }
              );
              
              if (res.data.subscription) {
                setCurrentPlan(res.data.subscription);
              }

              alert(`Payment successful! ${verifyRes.data.interviews.remaining} interviews added.`);
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
            setSelectedPlan(null);
          }
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
        },
        theme: {
          color: "#1A1A1A",
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            setSelectedPlan(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment initiation failed. Please try again.");
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const handlePlanSelect = (planId) => {
    if (!isAuthenticated) {
      setModalType('login'); // ✅ CHANGED
      setShowAuthModal(true); // ✅ CHANGED
      return;
    }

    if (!user?.isVerified) {
      setModalType('verify'); // ✅ CHANGED
      setShowAuthModal(true); // ✅ CHANGED
      return;
    }

    setSelectedPlan(planId);
    handlePaymentWithPlan(planId);
  };
  

  return (
    <>
    <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        type={modalType}
      />
    <div className="max-w-[1600px] mx-auto px-6 ">
    
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center max-w-3xl mx-auto mb-30"
>
  {/* Eyebrow */}
  <div className="text-center max-w-2xl mx-auto mb-10">
  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Choose Your Plan</h2>
  <p className="text-lg text-gray-500 font-medium leading-relaxed">
            Get interview-ready in days, not weeks. Start now.
          </p>
  </div>
  
</motion.div>


      

      {/* --- PRICING CARDS --- */}
      <motion.div 
        id="pricing-cards"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start"
      >
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isDark = plan.isRecommended;
          const isCurrentPlan = currentPlan?.active && currentPlan?.planId === plan.id;
          const hasCreditsRemaining = isCurrentPlan && currentPlan.interviewsRemaining > 0;
          const disableButton = isCurrentPlan && hasCreditsRemaining;
          
          return (
            <motion.div 
              key={plan.id}
              variants={cardVariants}
              whileHover={{ y: -10 }}
              className={`
                relative rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 flex flex-col h-full
                ${isDark 
                  ? 'bg-[#1A1A1A] text-white shadow-2xl shadow-gray-900/40 lg:scale-110 z-10 ring-1 ring-white/10' 
                  : 'bg-white border border-gray-100 text-gray-900 shadow-xl shadow-gray-200/50 hover:border-gray-300'
                }
              `}
            >
              {/* Popular Badge */}
              {isDark && (
                <div className="absolute top-0 inset-x-0 flex justify-center -mt-4">
                  <div className="bg-[#D4F478] text-black text-xs font-black px-6 py-2 rounded-full shadow-lg tracking-widest uppercase border-4 border-[#FDFBF9]">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card Header */}
              <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${plan.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm font-medium mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                  <span className={`text-lg font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {plan.duration}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className={`h-px w-full mb-8 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-0.5 ${isDark ? 'bg-[#D4F478] text-black' : 'bg-green-100 text-green-600'}`}>
                      <Check className="w-3 h-3" strokeWidth={4} />
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={disableButton || (isProcessing && selectedPlan === plan.id)}
                className={`
                  w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2
                  ${
                    disableButton
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : isProcessing && selectedPlan === plan.id
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : isDark
                          ? 'bg-[#D4F478] text-black hover:bg-white hover:scale-[1.02]'
                          : 'bg-[#1A1A1A] text-white hover:bg-gray-800'
                  }
                `}
              >
                {disableButton ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Current Plan
                  </>
                ) : isProcessing && selectedPlan === plan.id ? (
                  <>Processing...</>
                ) : (
                  <>
                    Choose {plan.name}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
    </>
  );
};



// ✅ HERO COMPONENT
const Hero = () => {
  const [activeStep, setActiveStep] = useState(0); 

  useEffect(() => {
    const interval = setInterval(() => { setActiveStep((prev) => (prev === 0 ? 1 : 0)); }, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-[1600px] mx-auto bg-white/40 backdrop-blur-xl rounded-[3.5rem] p-6 md:p-10 lg:p-12 border border-white/60 shadow-2xl shadow-gray-200/50 relative overflow-hidden z-10 -mt-5">
      <FloatingDecoration />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 mt-6 lg:mt-10 min-h-[600px]">
        <div className="lg:col-span-5 flex flex-col justify-between gap-8 lg:gap-0"><div className="flex-grow flex flex-col justify-center"><HeroTextSection /></div><div className="mt-8 lg:mt-0"><AgentCard /></div></div>
        <div className="lg:col-span-7 relative h-full min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeStep === 0 ? (
              <motion.div key="trio" variants={switchVariants} initial="initial" animate="animate" exit="exit" className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-8 h-full">
                <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8"><div className="flex-grow"><InfoCard /></div><div className="flex-grow"><HeroServicesCard /></div></div>
                <div className="lg:col-span-3"><SuccessStoryCard /></div>
              </motion.div>
            ) : (<HeroVisual key="visual" />)}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ✅ MAIN HOME COMPONENT
const Home = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF9] p-3 md:p-6 font-sans selection:bg-[#D4F478] selection:text-black overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-50"><div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-[120px] opacity-60" /><div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-t from-pink-50 to-transparent rounded-full blur-[120px] opacity-60" /></div>
      
      <Header />

      <div className="flex flex-col gap-8 mt-0">
        <Hero />
        <PartnersSection />
        <ProblemSection />

        <div id="explore" className="scroll-mt-24">
            <ZigZagServices /> 
        </div>

        <div id="about" className="scroll-mt-24">
            <AboutUs /> 
        </div>
        
        <PricingSection />
        
        <div id="faqs" className="scroll-mt-24">
            <FAQSection /> 
        </div>
      </div>
      
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { animation: marquee 30s linear infinite; } .perspective-1000 { perspective: 1000px; }`}</style>
    </div>
  );
};

export default Home;