import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import {
  LayoutDashboard,
  Settings,
  Bookmark,
  Search,
  LifeBuoy,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  LogOut,
  Bell,
  BookOpen,
  HelpCircle,
  X // Added X for mobile close
} from "lucide-react";

// --- COMPONENTS (Unchanged logic, just ensuring props pass through) ---

const SidebarLink = ({ icon: Icon, label, to, badge, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className="block w-full">
      <div
        className={`relative flex items-center w-full gap-4 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 group overflow-hidden ${
          isActive
            ? "bg-[#1A1A1A] text-white shadow-lg shadow-gray-200"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <Icon
          className={`w-5 h-5 flex-shrink-0 transition-colors ${
            isActive ? "text-[#D4F478]" : "text-gray-400 group-hover:text-gray-900"
          }`}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-1 whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {isActive && (
           <div className={`absolute w-1.5 h-1.5 rounded-full bg-[#D4F478] ${collapsed ? 'top-2 right-2' : 'right-2 top-1/2 -translate-y-1/2'}`} />
        )}
        {!collapsed && badge && (
          <motion.span 
             initial={{ opacity: 0, scale: 0 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0 }}
             className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
               isActive 
                 ? "bg-[#D4F478] text-black" 
                 : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
             }`}
          >
            {badge}
          </motion.span>
        )}
      </div>
    </Link>
  );
};

const DropdownMenu = ({ title, icon: Icon, children, collapsed, setSidebarCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasActiveChild = React.Children.toArray(children).some(
    (child) => child.props.to === location.pathname
  );

  useEffect(() => {
    if (collapsed) setIsOpen(false);
  }, [collapsed]);

  const handleToggle = () => {
    if (collapsed) {
        setSidebarCollapsed(false);
        setTimeout(() => setIsOpen(true), 200);
    } else {
        setIsOpen(!isOpen);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-between py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 group overflow-hidden ${
          isOpen || hasActiveChild
            ? "bg-white border border-gray-100 shadow-sm text-gray-900"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <Icon className={`w-5 h-5 flex-shrink-0 ${
                isOpen || hasActiveChild ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"
              }`}
            />
          )}
          <AnimatePresence>
            {!collapsed && (
                <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden"
                >
                    {title}
                </motion.span>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                isOpen ? "rotate-180 text-gray-900" : ""
            }`}
            />
        )}
      </button>

      <AnimatePresence>
        {isOpen && !collapsed && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0, height: 0 },
              visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
              exit: { opacity: 0, height: 0, transition: { duration: 0.2 } }
            }}
            className="overflow-hidden pl-4 space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN SIDEBAR COMPONENT ---

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [learningCount, setLearningCount] = useState(0);

  // Check screen size to handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false); // Reset collapse on mobile (we use slide-in instead)
      }
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/users/dashboard",
        { withCredentials: true }
      );

      setLearningCount(res.data.stats.inProgressCourses);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  fetchDashboard();
}, []);

  // Animation variants: Different logic for Mobile vs Desktop
  const sidebarVariants = {
    desktop: {
      width: isCollapsed ? 80 : 288,
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    mobile: {
      width: 288, // Always full width on mobile
      x: mobileOpen ? 0 : -288, // Slide in/out
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={isMobile ? "mobile" : "desktop"}
        variants={sidebarVariants}
        className={`
          fixed md:relative z-40 inset-y-0 left-0 
          bg-white border-r border-gray-100 h-screen flex flex-col font-sans
        `}
      >
        {/* Toggle Button (Desktop: Collapse / Mobile: Close) */}
        <button
          onClick={() => isMobile ? setMobileOpen(false) : setIsCollapsed(!isCollapsed)}
          className={`
            absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-black shadow-sm z-50
            ${isMobile && !mobileOpen ? 'hidden' : 'flex'} // Hide button if closed on mobile
          `}
        >
          {isMobile ? (
            <X className="w-3 h-3" />
          ) : (
            <ChevronLeft className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          )}
        </button>

        {/* Branding Header */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} transition-all duration-300`}>
          {/* <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-black/20 shrink-0">
            D
          </div> */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold tracking-tight text-gray-900 whitespace-nowrap overflow-hidden"
              >
                DASHBOARD
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* Menu Items */}
        <div className="px-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" to="/dashboard" collapsed={isCollapsed} />
          <SidebarLink icon={Settings} label="Account" to="/dashboard/setting" collapsed={isCollapsed} />
          <SidebarLink icon={Bell} label="Notifications" to="/dashboard/notifications" badge="3" collapsed={isCollapsed} />
          <SidebarLink
  icon={BookOpen}
  label="Learning"
  to="/dashboard/learning"
  badge={learningCount > 0 ? learningCount : null}
  collapsed={isCollapsed}
/>


          <DropdownMenu title="Saved Courses" icon={Bookmark} collapsed={isCollapsed} setSidebarCollapsed={setIsCollapsed}>
            <SidebarLink icon={Bookmark} label="My Courses" to="/dashboard/saved-courses" collapsed={isCollapsed} />
          </DropdownMenu>

          <SidebarLink icon={Search} label="Interview Analysis" to="/dashboard/interview-analysis" collapsed={isCollapsed} />
          <SidebarLink icon={CreditCard} label="Payroll" to="/dashboard/payroll" collapsed={isCollapsed} />

          <DropdownMenu title="Help Desk" icon={LifeBuoy} collapsed={isCollapsed} setSidebarCollapsed={setIsCollapsed}>
            <SidebarLink icon={LifeBuoy} label="Inbox" to="/dashboard/messages/inbox" collapsed={isCollapsed} />
            <SidebarLink icon={HelpCircle} label="FAQs" to="/dashboard/help/faq" collapsed={isCollapsed} />
          </DropdownMenu>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-50 mt-auto">
          <SidebarLink icon={LogOut} label="LogOut" to="/logout" collapsed={isCollapsed} />
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;




//Backup code hai yeah
// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Settings,
//   MessageCircle,
//   Bookmark,
//   Search,
//   LifeBuoy,
//   ChevronDown,
//   CreditCard,
//   LogOut,
//   Bell,
//   BookOpen,
//   HelpCircle
// } from "lucide-react";

// const SidebarLink = ({ icon: Icon, label, to, badge }) => {
//   const location = useLocation();
//   const isActive = location.pathname === to;

//   return (
//     <Link
//       to={to}
//       className={`flex items-center w-full gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
//         isActive
//           ? "bg-white/30 backdrop-blur-2xl border border-white/50 text-indigo-600 shadow-md"
//           : "text-gray-400 hover:text-indigo-600 hover:bg-white/20 hover:backdrop-blur-xl"
//       }`}
//     >
//       <Icon className="w-5 h-5" />
//       <span className="flex-1">{label}</span>
//       {badge && (
//         <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
//           {badge}
//         </span>
//       )}
//     </Link>
//   );
// };

// const DropdownMenu = ({ title, icon: Icon, children }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   return (
//     <div className="space-y-1">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center w-full justify-between py-3 px-4 text-sm text-gray-400 hover:text-indigo-600 hover:bg-white/20 hover:backdrop-blur-xl rounded-xl transition-all duration-300"
//       >
//         <div className="flex items-center gap-2">
//           {Icon && <Icon className="w-5 h-5" />}
//           <span>{title}</span>
//         </div>
//         <ChevronDown
//           className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
//         />
//       </button>
//       {isOpen && <div className="pl-4 space-y-1">{children}</div>}
//     </div>
//   );
// };

// const Sidebar = () => {
//   return (
//     <aside className="w-64 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-lg p-6 h-screen flex flex-col">
//       <h1 className="text-2xl font-bold mb-6 text-gray-800 px-2">DASHBOARD</h1>
//       <div className="space-y-2 flex-1 overflow-y-auto">
//         <SidebarLink icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
//         <SidebarLink icon={Settings} label="Account" to="/dashboard/setting" />
//         <SidebarLink icon={Bell} label="Notifications" to="/dashboard/notifications" badge="3" />
//         <SidebarLink icon={BookOpen} label="Learning" to="/dashboard/learning" badge="5" />
//         <DropdownMenu title="Saved Courses" icon={Bookmark}>
//           <SidebarLink icon={Bookmark} label="My Courses" to="/dashboard/saved-courses" />
//         </DropdownMenu>
//         <SidebarLink icon={Search} label="Interview Analysis" to="/dashboard/interview-analysis" />
//         <SidebarLink icon={CreditCard} label="Payroll" to="/dashboard/payroll" />
//         <DropdownMenu title="Help Desk" icon={LifeBuoy}>
//           <SidebarLink icon={LifeBuoy} label="Inbox" to="/dashboard/messages/inbox" />
//           <SidebarLink icon={HelpCircle} label="FAQs" to="/dashboard/help/faq" />
//         </DropdownMenu>
//         <SidebarLink icon={LogOut} label="LogOut" to="/logout" />
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;


// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Settings,
//   MessageCircle,
//   Bookmark,
//   Trophy,
//   Search,
//   LifeBuoy,
//   ChevronDown,
//   CreditCard,
//   LogOut,
//   BookOpen,
//   CheckCircle,
//   FileText,
//   Percent,
//   ChartLine,
//   PieChart
// } from "lucide-react";

// const SidebarLink = ({ icon: Icon, label, to }) => {
//   const location = useLocation();
//   const isActive = location.pathname === to;

//   return (
//     <Link
//       to={to}
//       className={`flex items-center w-full gap-2 py-3 px-4 rounded-lg text-sm font-medium ${
//         isActive ? "bg-blue-900 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
//       }`}
//     >
//       <Icon className="w-5 h-5" />
//       <span>{label}</span>
//     </Link>
//   );
// };

// const DropdownMenu = ({ title, icon: Icon, children }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   return (
//     <div className="space-y-1">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center w-full justify-between py-3 px-4 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
//       >
//         <div className="flex items-center gap-2">
//           {Icon && <Icon className="w-5 h-5" />}
//           <span>{title}</span>
//         </div>
//         <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
//       </button>
//       {isOpen && <div className="pl-4 space-y-1">{children}</div>}
//     </div>
//   );
// };

// const Sidebar = () => {
//   return (
//     <aside className="w-64 bg-white  p-4 h-screen">
//       <h1 className="text-2xl font-bold mb-6 px-2">DASHBOARD</h1>
//       <div className="space-y-2">
//         <SidebarLink icon={LayoutDashboard} label="Dashboard" to="/dashboard" />
//         <SidebarLink icon={Settings} label="Account" to="/dashboard/setting" />
//         <DropdownMenu title="Messages" icon={MessageCircle}>
//           <SidebarLink icon={MessageCircle} label="Inbox" to="/dashboard/messages/inbox" />
//           <SidebarLink icon={MessageCircle} label="Sent" to="/dashboard/messages/sent" />
//           <SidebarLink icon={MessageCircle} label="Draft" to="/dashboard/messages/draft" />
//         </DropdownMenu>
//         <DropdownMenu title="Saved Courses" icon={Bookmark}>
//           <SidebarLink icon={Bookmark} label="My Courses" to="/dashboard/saved-courses" />
//         </DropdownMenu>
//         <SidebarLink icon={Search} label="Interview Analysis" to="/dashboard/interview-analysis" />
//         <SidebarLink icon={CreditCard} label="Payroll" to="/dashboard/payroll" />
//         <DropdownMenu title="Help Desk" icon={LifeBuoy}>
//           <SidebarLink icon={LifeBuoy} label="Chat" to="/dashboard/help/chat" />
//           <SidebarLink icon={LifeBuoy} label="FAQ" to="/dashboard/help/faq" />
//         </DropdownMenu>
//         <SidebarLink icon={LogOut} label="LogOut" to="/logout" />
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;