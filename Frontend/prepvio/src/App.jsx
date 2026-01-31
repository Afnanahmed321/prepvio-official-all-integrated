import { useState, useEffect } from "react";
import { Navigate, Route, Routes, Outlet, useNavigate } from "react-router-dom";

import Home from "./HomePages/Home.jsx";
import Layout from "./components/Layout.jsx";
import Footer from "./HomePages/Footer.jsx";

import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

import DashboardPage from "./Dashboard/DashBoardPage.jsx";
import FAQs from "./Dashboard/FAQs.jsx";
import Interview from "./Dashboard/Interview.jsx";
import Learning from "./Dashboard/Learning.jsx";
import Message from "./Dashboard/Message.jsx";
import Notifications from "./Dashboard/Notfication.jsx";
import Payment from "./Dashboard/Payment.jsx";
import SavedCourses from "./Dashboard/SavedCourse.jsx";
import Account from "./Dashboard/setting.jsx";
import InterviewPreview from "./Dashboard/InterviewPreview.jsx";
import AptitudeTestAnalysis from "./Dashboard/AptitudeTestAnalysis.jsx";
import CurrentPlan from "./Dashboard/CurrentPlan.jsx";

import LearnAndPerform from "./ServiceDetails/Learn and perfrom/LearnAndPerfrom.jsx";
import Channels from "./ServiceDetails/Learn and perfrom/Channels.jsx";
import VideoPlayer from "./ServiceDetails/Learn and perfrom/VideoPlayer.jsx";

import SelectRolesAndCompany from "./ServiceDetails/Check_Your_Ability/pages/selecting_roles_and_typeofcompany/SelectRolesAndCompany.jsx";
import Rounds from "./ServiceDetails/Check_Your_Ability/pages/selecting_roles_and_typeofcompany/Rounds.jsx";
import InterviewScreen from "./ServiceDetails/Check_Your_Ability/pages/Interview_page/InterviewScreen.jsx";
import AfterInterview from "./ServiceDetails/Check_Your_Ability/pages/Interview_page/AfterInterview.jsx";

import Categories from "./ServiceDetails/Check_Your_Ability/pages/selecting category/Categories.jsx";
import Aptitude from "./ServiceDetails/Check_Your_Ability/pages/Aptitude/Aptitude.jsx";

import Feedback from "./Dashboard/Feedback.jsx";
import AptitudeReviewMode from "./Dashboard/AptitudeReviewMode.jsx";

import RazorpayTest from "./pricing/RazorpayTest.jsx";

import ScrollToTop from "./ScrollToTop.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authstore.js";

/* ======================================================
   PROTECTED ROUTE (AUTH + VERIFIED)
====================================================== */
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// ⛔ user not loaded yet
	if (!user) {
		return <LoadingSpinner />;
	}

	if (!user.isVerified) {
		return <Navigate to="/verify-email" replace />;
	}

	return children;
};

const PaidOnlyRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check if user has active subscription
  if (!user.subscription?.active) {
    return <Navigate to="/dashboard/payroll" replace />;
  }

  // Check if subscription expired
  if (new Date() > new Date(user.subscription.endDate)) {
    return <Navigate to="/dashboard/payroll" replace />;
  }

  // ✅ NEW: Check if user has interview credits
  if (user.subscription.interviewsRemaining <= 0) {
    // Show alert and redirect to payment
    setTimeout(() => {
      alert("⚠️ You have no interview credits remaining. Please upgrade your plan.");
    }, 100);
    return <Navigate to="/dashboard/payroll" replace />;
  }

  return <Outlet />;
};


/* ======================================================
   REDIRECT AUTHENTICATED USERS
====================================================== */
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	// ⛔ waiting for user object
	if (isAuthenticated && !user) {
		return <LoadingSpinner />;
	}

	if (isAuthenticated && user.isVerified) {
		return <Navigate to="/" replace />;
	}

	return children;
};

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	// Check Your Ability shared state
	const [companyType, setCompanyType] = useState(null);
	const [role, setRole] = useState(null);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<>
			<ScrollToTop />

			<Routes>
				{/* Home */}
				<Route path="/" element={<Home />} />

				{/* Interview Preview (Public) */}
				<Route path="/interview-preview" element={<InterviewPreview />} />

				<Route path="/aptitude-review" element={<AptitudeReviewMode />} />


				{/* Dashboard (Protected) */}
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Layout />
						</ProtectedRoute>
					}
				>
					<Route index element={<DashboardPage />} />
					<Route path="setting" element={<Account />} />
					<Route path="notifications" element={<Notifications />} />
					<Route path="learning" element={<Learning />} />
					<Route path="saved-courses" element={<SavedCourses />} />
					<Route path="interview-analysis" element={<Interview />} />
					<Route path="payroll" element={<Payment />} />
					<Route path="current-plan" element={<CurrentPlan />} /> 
					<Route path="messages/inbox" element={<Message />} />
					<Route path="help/faq" element={<FAQs />} />
					<Route path="feedback" element={<Feedback />} />
					<Route path="aptitude-test-analysis" element={<AptitudeTestAnalysis />} />
					
				</Route>
				

				{/* Auth */}
				<Route
					path="/signup"
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path="/login"
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>

				<Route path="/verify-email" element={<EmailVerificationPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/reset-password/:token" element={<ResetPasswordPage />} />

				{/* Services */}
				<Route path="/services/learn--perform" element={<ProtectedRoute><LearnAndPerform /></ProtectedRoute>} />
				<Route path="/services/:serviceSlug/:courseId" element={<ProtectedRoute><Channels /></ProtectedRoute>} />
				<Route path="/:channelName/:channelId/:courseId" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />

				{/* Check Your Ability Flow */}
				{/* Check Your Ability Flow */}
<Route path="/services/check-your-ability">
  
  {/* ✅ Categories – always visible */}
  <Route index element={<ProtectedRoute><Categories /></ProtectedRoute>} />

  {/* ✅ Aptitude – free & paid */}
  <Route path="aptitude" element={<ProtectedRoute><Aptitude /></ProtectedRoute>} />

  {/* 🔒 Interview – PAID ONLY */}
  <Route element={<PaidOnlyRoute />}>
    
    <Route
      path="interview"
      element={
        <SelectRolesAndCompany
          companyType={companyType}
          setCompanyType={setCompanyType}
          role={role}
          setRole={setRole}
        />
      }
    />

    <Route
      path="interview/rounds"
      element={<Rounds companyType={companyType} role={role} />}
    />

    <Route
      path="interview/start"
      element={<InterviewScreen companyType={companyType} role={role} />}
    />

    <Route
      path="interview/after-interview"
      element={<AfterInterview />}
    />

  </Route>
</Route>




				{/* Catch-all */}
				<Route path='*' element={<Navigate to='/' replace />} />
				<Route path="/razorpay-test" element={<RazorpayTest />} />
			</Routes>

			<Footer />
			<Toaster />
		</>
	);
}

export default App;
