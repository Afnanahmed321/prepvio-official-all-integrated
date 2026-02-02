import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  CreditCard,
  Check,
  X,
  Zap,
  Crown,
  Rocket,
  ShieldCheck,
  Smartphone,
  Globe,
  CheckCircle2,
  ArrowRight,
  Lock,
  Sparkles,
  Award,
  Download,
  Calendar,
  MessageCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "../store/authstore";

// Configure axios
axios.defaults.withCredentials = true;

// --- PLANS DATA ---
const plans = [
  {
    id: 'monthly',
    name: 'Basic',
    price: '₹79',
    priceValue: 79,
    duration: '/month',
    interviews: 4,
    icon: Zap,
    isRecommended: false,
    color: 'bg-blue-50 text-blue-600',
    description: "Essential tools for casual learners.",
    features: [
      '4 AI Interviews',
      'Standard support',
      'Course certificates',
      'Mobile app access'
    ]
  },
  {
    id: 'premium',
    name: 'Pro Access',
    price: '₹179',
    priceValue: 179,
    duration: '/month',
    interviews: 9,
    icon: Crown,
    isRecommended: true,
    color: 'bg-[#D4F478] text-black',
    description: "Best for serious students & job seekers.",
    features: [
      '9 AI Interviews',
      'Priority 24/7 support',
      'Offline downloads',
      'Exclusive webinars',
      'Interview prep module'
    ]
  },
  {
    id: 'yearly',
    name: 'Premium Plan',
    price: '₹499',
    priceValue: 499,
    duration: '/month',
    interviews: 25,
    icon: Rocket,
    isRecommended: false,
    color: 'bg-orange-50 text-orange-600',
    description: "Best value for dedicated learners.",
    features: [
      '25 AI Interviews',
      '1-on-1 Mentorship',
      'Live doubt sessions',
      'Job placement assistance',
      'Custom learning path'
    ]
  }
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

const successVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function Payment() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('pricing');
  const [promoCode, setPromoCode] = useState("");
  const [promoValidation, setPromoValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const { refreshUser } = useAuthStore();

  // ✅ Fetch current subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/payment/interview-status",
          { withCredentials: true }
        );

        // ✅ Show subscription even if it's free plan with 1 credit
        if (res.data.subscription && res.data.subscription.interviewsTotal > 0) {
          setCurrentPlan(res.data.subscription);
        }
      } catch (err) {
        console.error("Failed to fetch subscription", err);
      }
    };

    fetchSubscription();
  }, [paymentSuccess]);

  // Validate promo code
  const validatePromoCode = async (planId) => {
    if (!promoCode.trim()) {
      setPromoValidation(null);
      return;
    }

    setIsValidating(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/promo/validate",
        { code: promoCode, planId }
      );

      if (data.valid) {
        setPromoValidation({
          valid: true,
          ...data.pricing,
          code: data.promoCode.code,
          description: data.promoCode.description,
        });
      }
    } catch (err) {
      setPromoValidation({
        valid: false,
        message: err.response?.data?.message || "Invalid promo code",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Razorpay Payment Handler
  const handlePaymentWithPlan = async (planId) => {
    setIsProcessing(true);

    try {
      const requestData = { planId };
      if (promoCode.trim() && promoValidation?.valid) {
        requestData.promoCode = promoCode;
      }

      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        requestData
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

              setPaymentData({
                planName: verifyRes.data.subscription.planName,
                interviews: verifyRes.data.interviews.remaining,
                transactionId: response.razorpay_payment_id,
                date: new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              });
              setPaymentSuccess(true);
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
          ondismiss: function () {
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
    setSelectedPlan(planId);
    setShowPromoInput(true);
    setPromoCode("");
    setPromoValidation(null);
  };

  const proceedToPayment = () => {
    if (selectedPlan) {
      setShowPromoInput(false);
      handlePaymentWithPlan(selectedPlan);
    }
  };

  const handleBackToPlans = () => {
    setPaymentSuccess(false);
    setPaymentData(null);
  };

  // If payment is successful, show success page
  if (paymentSuccess && paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D4F478] via-[#B8E356] to-[#9BCF35] font-sans flex items-center justify-center p-4 relative overflow-hidden">

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-10 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-10 right-10 w-80 h-80 bg-black/10 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full p-8 md:p-12 space-y-8"
        >
          {/* Success Icon with Animation */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative"
            >
              <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                <Check className="w-14 h-14 text-white" strokeWidth={3} />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: '75ms' }} />
            </motion.div>
          </motion.div>

          {/* Success Message */}
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900">
              Payment Successful! 🎉
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Welcome to <span className="text-black font-bold">{paymentData.planName}</span>
            </p>
          </motion.div>

          {/* Payment Details Card */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 space-y-4 border border-gray-200"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-300">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Payment Details</span>
              <Award className="w-5 h-5 text-[#D4F478]" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Plan</span>
                <span className="text-gray-900 font-bold">{paymentData.planName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Interviews Added</span>
                <span className="text-green-600 font-bold text-lg">🎤 {paymentData.interviews}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Transaction ID</span>
                <span className="text-gray-900 font-mono text-xs bg-gray-200 px-3 py-1 rounded-lg">
                  {paymentData.transactionId.slice(0, 16)}...
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Date</span>
                <span className="text-gray-900 font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {paymentData.date}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <Download className="w-6 h-6 text-blue-600 transition-transform hover:scale-110" />
              <span className="text-sm font-bold text-blue-900">Download Receipt</span>
            </button>

            <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors">
              <MessageCircle className="w-6 h-6 text-green-600 transition-transform hover:scale-110" />
              <span className="text-sm font-bold text-green-900">Contact Support</span>
            </button>

            <button
              onClick={() => window.location.href = "/dashboard"}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <Rocket className="w-6 h-6 text-purple-600 transition-transform hover:scale-110" />
              <span className="text-sm font-bold text-purple-900">Go to Dashboard</span>
            </button>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => window.location.href = "/services/check-your-ability/interview"}
              className="flex-1 bg-[#1A1A1A] text-white font-black py-4 px-6 rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Start Your First Interview</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={handleBackToPlans}
              className="sm:w-auto px-6 py-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              View All Plans
            </button>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-gray-500 pt-4"
          >
            A confirmation email has been sent to your registered email address.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Original pricing page
  return (
    <div className="min-h-screen bg-[#FDFBF9] font-sans selection:bg-[#D4F478] selection:text-black relative overflow-hidden">

      {/* --- BACKGROUND DECORATION --- */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-70"
          style={{ animation: 'blob 7s infinite' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-70"
          style={{ animation: 'blob 7s infinite 2s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-70"
          style={{ animation: 'blob 7s infinite 4s' }}
        />
      </div>

      <style>
        {`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16">

        {/* --- TAB NAVIGATION --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="inline-flex gap-4 bg-white rounded-2xl p-1.5 border border-gray-200 shadow-md">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'pricing'
                ? 'bg-[#D4F478] text-black shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Pricing Plans
            </button>
            {currentPlan?.active && (
              <button
                onClick={() => setActiveTab('current-plan')}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'current-plan'
                  ? 'bg-[#D4F478] text-black shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Current Plan
              </button>
            )}
          </div>
        </motion.div>

        {/* --- HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full text-sm font-bold text-gray-600 shadow-sm mb-2">
            <Lock className="w-3.5 h-3.5" /> Secure & Encrypted Payment
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
            {activeTab === 'pricing' ? (
              <>Invest in your <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Future Today.</span></>
            ) : (
              <>Your <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Active Plan</span></>
            )}
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-xl mx-auto">
            {activeTab === 'pricing'
              ? 'Unlock unlimited access to AI-powered interview prep and career-boosting tools.'
              : 'Manage your subscription and track your remaining credits.'}
          </p>
        </motion.div>

        {/* ✅ CURRENT PLAN TAB */}
        {activeTab === 'current-plan' && currentPlan?.active && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Main Status Card */}
            <div className={`relative overflow-hidden rounded-3xl p-8 shadow-xl border-2 ${currentPlan.interviewsRemaining > 0
              ? 'bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 border-green-200'
              : 'bg-gradient-to-br from-white via-red-50/30 to-orange-50/50 border-red-200'
              }`}>

              {/* Decorative blob */}
              <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${currentPlan.interviewsRemaining > 0 ? 'bg-green-400' : 'bg-red-400'
                }`} />

              <div className="relative z-10">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${currentPlan.interviewsRemaining > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`} />
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Active Plan
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-1">
                      {currentPlan.planName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {new Date(currentPlan.endDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>

                {/* Credits Display - BIG & CLEAR */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Interview Credits
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-6xl font-black tabular-nums ${currentPlan.interviewsRemaining > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {currentPlan.interviewsRemaining}
                        </span>
                        <span className="text-2xl font-bold text-gray-400">
                          left
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        Started with {currentPlan.interviewsTotal} credits
                      </p>
                    </div>

                    {/* Visual Indicator */}
                    <div className="flex flex-col items-center">
                      {currentPlan.interviewsRemaining > 0 ? (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg">
                          <AlertCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Usage
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {currentPlan.interviewsTotal - currentPlan.interviewsRemaining} used
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((currentPlan.interviewsTotal - currentPlan.interviewsRemaining) / currentPlan.interviewsTotal) * 100}%`
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${currentPlan.interviewsRemaining > 0
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                          : 'bg-gradient-to-r from-red-400 to-orange-500'
                          }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Messages - Clear & Action-Oriented */}
                {currentPlan.interviewsRemaining === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-red-600" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-red-900 mb-1">
                        No Credits Remaining
                      </h4>
                      <p className="text-sm text-red-700 font-medium mb-3">
                        You've used all your interview credits. Upgrade your plan to continue practicing!
                      </p>
                      <button
                        onClick={() => setActiveTab('pricing')}
                        className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Upgrade Now
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentPlan.interviewsRemaining > 0 && currentPlan.interviewsRemaining <= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-orange-900 mb-1">
                        Running Low on Credits
                      </h4>
                      <p className="text-sm text-orange-700 font-medium mb-3">
                        Only {currentPlan.interviewsRemaining} {currentPlan.interviewsRemaining === 1 ? 'credit' : 'credits'} left. Consider upgrading to keep practicing without interruption.
                      </p>
                      <button
                        onClick={() => setActiveTab('pricing')}
                        className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        View Plans
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentPlan.interviewsRemaining > 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black text-green-900 mb-1">
                        You're All Set!
                      </h4>
                      <p className="text-sm text-green-700 font-medium">
                        You have {currentPlan.interviewsRemaining} interview credits available. Start practicing now!
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ✅ PRICING CARDS TAB */}
        {activeTab === 'pricing' && (
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
                      ${disableButton
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
                        <ArrowRight className="w-4 h-4 transition-transform hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* --- TRUST INDICATORS --- */}
        {activeTab === 'pricing' && (
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-bold text-gray-400"><ShieldCheck className="w-6 h-6" /> SSL Secure</div>
            <div className="flex items-center gap-2 font-bold text-gray-400"><Globe className="w-6 h-6" /> Global Access</div>
            <div className="flex items-center gap-2 font-bold text-gray-400"><Smartphone className="w-6 h-6" /> Mobile Ready</div>
          </div>
        )}

      </div>

      {/* PROMO CODE MODAL */}
      <AnimatePresence>
        {showPromoInput && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowPromoInput(false);
              setSelectedPlan(null);
              setPromoCode("");
              setPromoValidation(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              {(() => {
                const plan = plans.find(p => p.id === selectedPlan);
                if (!plan) return null;

                return (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-black text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-4xl font-black text-gray-900">
                        {promoValidation?.valid ? `₹${promoValidation.finalAmount}` : plan.price}
                      </p>
                      {promoValidation?.valid && (
                        <p className="text-sm text-gray-500 line-through">
                          Original: {plan.price}
                        </p>
                      )}
                    </div>

                    {/* Promo Code Input */}
                    <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-300">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        🎁 Have a promo code?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase());
                            setPromoValidation(null);
                          }}
                          placeholder="Enter PREP29"
                          autoComplete="off"
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none font-medium"
                        />
                        <button
                          onClick={() => validatePromoCode(selectedPlan)}
                          disabled={!promoCode.trim() || isValidating}
                          className={`px-6 py-3 rounded-xl font-bold transition-all ${promoCode.trim()
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          {isValidating ? 'Checking...' : 'Apply'}
                        </button>
                      </div>

                      {/* Validation Message */}
                      {promoValidation && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mt-3 p-3 rounded-xl ${promoValidation.valid
                            ? 'bg-green-100 border-2 border-green-300 text-green-800'
                            : 'bg-red-100 border-2 border-red-300 text-red-800'
                            }`}
                        >
                          {promoValidation.valid ? (
                            <div>
                              <p className="font-bold text-sm mb-1">
                                {promoValidation.code} Applied Successfully
                              </p>
                              <p className="text-xs mb-2">
                                {promoValidation.code === 'PREP29'
                                  ? "This plan includes all features enabled and 2 interviews."
                                  : promoValidation.description}
                              </p>
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span>Original:</span>
                                  <span className="line-through">₹{promoValidation.originalAmount}</span>
                                </div>
                                <div className="flex justify-between font-bold text-green-700">
                                  <span>Discount:</span>
                                  <span>-₹{promoValidation.discountAmount}</span>
                                </div>
                                <div className="flex justify-between font-black text-lg">
                                  <span>Final:</span>
                                  <span>₹{promoValidation.finalAmount}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm font-bold">❌ {promoValidation.message}</p>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={proceedToPayment}
                        disabled={isProcessing}
                        className="flex-1 bg-[#1A1A1A] text-white font-bold py-4 px-6 rounded-2xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : `Pay ${promoValidation?.valid ? `₹${promoValidation.finalAmount}` : plan.price}`}
                      </button>
                      <button
                        onClick={() => {
                          setShowPromoInput(false);
                          setSelectedPlan(null);
                          setPromoCode("");
                          setPromoValidation(null);
                        }}
                        className="px-6 py-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Sample Codes */}
                    {/* <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-xs font-bold text-yellow-800 mb-1">PREP29 applied successfully</p>
                      <p className="text-xs text-yellow-700">This plan includes all features enabled and 2 interviews.</p>
                    </div> */}
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Payment;