// import React, { useState } from "react";
// // 1. IMPORT 'useNavigate' from React Router
// import { useNavigate } from "react-router-dom";
// import { Home, Users, FileText, Target, Briefcase, Settings, ChevronDown } from "lucide-react";

// // This map connects your item 'name' to the 'path' in App.js
// const navLinks = {
//   "Dashboard": "/dashboard",
//   "User Management": "/user-management",
//   "Statistics": "/statistics",
//   "Channels": "/channels",
//   "Categories": "/categories",
//   "Playlist": "/playlists",
//   "Video Quiz": "/quizzes",
//   "HDashboard": "/hdashboard",
//   "Customer": "/customer",
//   "Calender": "/calender",
//   "AnalyticsDashboard": "/AnalyticsDashboard",
//   "Pricing": "/pricing",
//   "Membership List": "/listpage",


//   // Ticket sub-items
//   "Create": "/help-desk/ticket/create",
//   "Details": "/help-desk/ticket/details",
//   "List": "/help-desk/ticket/list",
  
//   // You can add these once you create the routes in App.js
//   // "Content Management": "/content",
//   // "Job Portal": "/job-portal",
//   // "AI Interview Practice": "/ai-interview",
//   // "Resume Analyzer": "/resume-analyzer",
//   "Calendar": "/calendar",
//   // "Settings": "/settings",
// };

// const NavItem = ({ icon: Icon, text, active, onClick, isSubItem = false, isNestedSubItem = false }) => (
//   <li
//     onClick={onClick}
//     className={`flex items-center space-x-3 rounded-xl cursor-pointer transition-all duration-200 ${
//       active
//         ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 font-semibold border border-blue-300/50"
//         : "text-slate-700 hover:bg-white/60 hover:shadow-md"
//     } ${isNestedSubItem ? "py-2 px-3 ml-4" : isSubItem ? "py-2 px-3 ml-2" : "p-3"}`}
//   >
//     {Icon && <Icon size={20} className="flex-shrink-0" />}
//     <span className="text-sm">{text}</span>
//   </li>
// );

// export default function Sidebar() {
//   const [activeItem, setActiveItem] = useState("Dashboard");
//   const [openMenus, setOpenMenus] = useState([]);
  
//   // 2. INITIALIZE the navigate function
//   const navigate = useNavigate();

//   // 3. UPDATE 'handleItemClick' to navigate
//   const handleItemClick = (name) => {
//     setActiveItem(name);
    
//     // Find the path from our 'navLinks' map
//     const path = navLinks[name];
    
//     // If we have a path, navigate to it!
//     if (path) {
//       navigate(path);
//     } else {
//       console.warn(`No path defined for: ${name}`);
//     }
//   };

//   const toggleMenu = (name) => {
//     setOpenMenus((prev) =>
//       prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
//     );
//   };

//   const navItems = [
//     { name: "Dashboard", icon: Home },
//     { name: "User Management", icon: Users },
   
   
//     {
//       name: "Learn & Perform",
//       icon: Target,
//       children: [
//         { name: "Channels" },
//         { name: "Categories" },
//         { name: "Playlist" },
//         { name: "Video Quiz" },
//       ],
//     },
//     { name: "Job Portal", icon: Briefcase },
//     { name: "AI Interview Practice", icon: Target },
//     { name: "Resume Analyzer", icon: FileText },
    
//      {
//       name: "Statistics",
//       icon: FileText,
      
//     },
//     {
//       name: "Membership",
//       icon: Target,
//       children: [
//         { name: "AnalyticsDashboard" },
//         { name: "Pricing" },
//         { name: "Membership List" },
     
//       ],
//     },
    
//     { name: "Calender", icon: FileText },
//     { 
//       name: "Help Desk", 
//       icon: Users,
//       children: [
//         { name: "HDashboard" },
//         { 
//           name: "Ticket",
//           children: [
//             { name: "Create" },
//             { name: "Details" },
//             { name: "List" },
//           ]
//         },
//         { name: "Customer" },
//       ],
//     },
//     {
//       name: "Settings",
//       icon: Settings,
//       children: [
//         { name: "Profile Settings" },
//         { name: "Account Security" },
//         { name: "Notifications" },
//         { name: "Appearance" },
//         { name: "Privacy" },
//       ],
//     },
//   ];

//   const renderNavItem = (item, isSubItem = false) => {
//     if (item.children) {
//       return (
//         <li key={item.name}>
//           <div
//             onClick={() => toggleMenu(item.name)}
//             className={`flex items-center justify-between space-x-3 rounded-xl cursor-pointer transition-all duration-200 ${
//               openMenus.includes(item.name) ||
//               item.children.some((c) => c.name === activeItem || (c.children && c.children.some(nested => nested.name === activeItem)))
//                 ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 font-semibold shadow-md border border-blue-300/50"
//                 : "text-slate-700 hover:bg-white/60 hover:shadow-md"
//             } ${isSubItem ? "py-2 px-3 ml-2" : "p-3"}`}
//           >
//             <div className="flex items-center space-x-3">
//               {item.icon && <item.icon size={20} />}
//               <span className="text-sm">{item.name}</span>
//             </div>
//             <ChevronDown
//               size={16}
//               className={`transition-transform duration-300 ${
//                 openMenus.includes(item.name) ? "rotate-180" : "rotate-0"
//               }`}
//             />
//           </div>

//           {openMenus.includes(item.name) && (
//             <ul className="pl-4 pt-2 space-y-1">
//               {item.children.map((sub) => renderNavItem(sub, true))}
//             </ul>
//           )}
//         </li>
//       );
//     }

//     return (
//       <NavItem
//         key={item.name}
//         icon={item.icon}
//         text={item.name}
//         active={activeItem === item.name}
//         onClick={() => handleItemClick(item.name)}
//         isSubItem={isSubItem}
//         isNestedSubItem={isSubItem}
//       />
//     );
//   };

//   return (
//     <aside className="w-72 h-screen bg-gradient-to-br from-orange-100/80 via-rose-100/80 to-slate-200/80 backdrop-blur-xl shadow-2xl sticky top-0 overflow-y-auto border-r border-white/50 flex-shrink-0">
//       <div className="p-6">
//         {/* Logo Section */}
//         <div className="flex justify-center items-center mb-10 bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//             MERN-Admin
//           </h1>
//         </div>

//         {/* Navigation */}
//         <nav>
//           <ul className="space-y-2">
//             {navItems.map((item) => renderNavItem(item))}
//           </ul>
//         </nav>

//         {/* Footer Section */}
//         <div className="mt-8 p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
//               A
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-slate-800">Admin User</p>
//               <p className="text-xs text-slate-600">admin@example.com</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }


import React, { useState } from "react";
// 1. IMPORT 'useNavigate' from React Router
import { useNavigate } from "react-router-dom";
import { Home, Users, FileText, Target, Briefcase, Settings, ChevronDown } from "lucide-react";

// This map connects your item 'name' to the 'path' in App.js
const navLinks = {
  "Dashboard": "/dashboard",
  "User Management": "/user-management",
  "Service": "/services",
  "Courses": "/courses",
  "Statistics": "/statistics",
  "Channels": "/channels",
  "Categories": "/categories",
  "Playlist": "/playlists",
  "Video Quiz": "/quizzes",
  "HDashboard": "/hdashboard",
  "Customer": "/customer",
  "Calender": "/calender",
  "AnalyticsDashboard": "/AnalyticsDashboard",
  "Pricing": "/pricing",
  "Membership List": "/listpage",

  // Ticket sub-items
  "Create": "/help-desk/ticket/create",
  "Details": "/help-desk/ticket/details",
  "List": "/help-desk/ticket/list",
  
  // Settings sub-items - NEW
  "Profile Settings": "/settings",
  "Account Security": "/settings",
  "Notifications": "/settings",
  "Appearance": "/settings",
  "Privacy": "/settings",
  "System Preferences": "/settings",
  "Integrations": "/settings",
  "Billing": "/settings",
  
  // You can add these once you create the routes in App.js
  // "Content Management": "/content",
  // "Job Portal": "/job-portal",
  // "AI Interview Practice": "/ai-interview",
  // "Resume Analyzer": "/resume-analyzer",
  "Calendar": "/calendar",
};

const NavItem = ({ icon: Icon, text, active, onClick, isSubItem = false, isNestedSubItem = false }) => (
  <li
    onClick={onClick}
    className={`flex items-center space-x-3 rounded-xl cursor-pointer transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 font-semibold border border-blue-300/50"
        : "text-slate-700 hover:bg-white/60 hover:shadow-md"
    } ${isNestedSubItem ? "py-2 px-3 ml-4" : isSubItem ? "py-2 px-3 ml-2" : "p-3"}`}
  >
    {Icon && <Icon size={20} className="flex-shrink-0" />}
    <span className="text-sm">{text}</span>
  </li>
);

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [openMenus, setOpenMenus] = useState([]);
  
  // 2. INITIALIZE the navigate function
  const navigate = useNavigate();

  // 3. UPDATE 'handleItemClick' to navigate
  const handleItemClick = (name) => {
    setActiveItem(name);
    
    // Find the path from our 'navLinks' map
    const path = navLinks[name];
    
    // If we have a path, navigate to it!
    if (path) {
      navigate(path);
    } else {
      console.warn(`No path defined for: ${name}`);
    }
  };

  const toggleMenu = (name) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const navItems = [
    { name: "Dashboard", icon: Home },
    { name: "User Management", icon: Users },
   
   
    {
      name: "Learn & Perform",
      icon: Target,
      children: [
        { name: "Service" },
        { name: "Courses" },
        { name: "Channels" },
        { name: "Categories" },
        { name: "Playlist" },
        { name: "Video Quiz" },
      ],
    },
    { name: "Job Portal", icon: Briefcase },
    { name: "AI Interview Practice", icon: Target },
    { name: "Resume Analyzer", icon: FileText },
    
     {
      name: "Statistics",
      icon: FileText,
      
    },
    {
      name: "Membership",
      icon: Target,
      children: [
        { name: "AnalyticsDashboard" },
        { name: "Pricing" },
        { name: "Membership List" },
     
      ],
    },
    
    { name: "Calender", icon: FileText },
    { 
      name: "Help Desk", 
      icon: Users,
      children: [
        { name: "HDashboard" },
        { 
          name: "Ticket",
          children: [
            { name: "Create" },
            { name: "Details" },
            { name: "List" },
          ]
        },
        { name: "Customer" },
      ],
    },
    {
      name: "Settings",
      icon: Settings,
      children: [
        { name: "Profile Settings" },
        { name: "Account Security" },
        { name: "Notifications" },
        { name: "Appearance" },
        { name: "Privacy" },
        { name: "System Preferences" },
        { name: "Integrations" },
        { name: "Billing" },
      ],
    },
  ];

  const renderNavItem = (item, isSubItem = false) => {
    if (item.children) {
      return (
        <li key={item.name}>
          <div
            onClick={() => toggleMenu(item.name)}
            className={`flex items-center justify-between space-x-3 rounded-xl cursor-pointer transition-all duration-200 ${
              openMenus.includes(item.name) ||
              item.children.some((c) => c.name === activeItem || (c.children && c.children.some(nested => nested.name === activeItem)))
                ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 font-semibold shadow-md border border-blue-300/50"
                : "text-slate-700 hover:bg-white/60 hover:shadow-md"
            } ${isSubItem ? "py-2 px-3 ml-2" : "p-3"}`}
          >
            <div className="flex items-center space-x-3">
              {item.icon && <item.icon size={20} />}
              <span className="text-sm">{item.name}</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${
                openMenus.includes(item.name) ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {openMenus.includes(item.name) && (
            <ul className="pl-4 pt-2 space-y-1">
              {item.children.map((sub) => renderNavItem(sub, true))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <NavItem
        key={item.name}
        icon={item.icon}
        text={item.name}
        active={activeItem === item.name}
        onClick={() => handleItemClick(item.name)}
        isSubItem={isSubItem}
        isNestedSubItem={isSubItem}
      />
    );
  };

  return (
    <aside className="w-72 h-screen bg-gradient-to-br from-orange-100/80 via-rose-100/80 to-slate-200/80 backdrop-blur-xl shadow-2xl sticky top-0 overflow-y-auto border-r border-white/50 flex-shrink-0">
      <div className="p-6">
        {/* Logo Section */}
        <div className="flex justify-center items-center mb-10 bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            MERN-Admin
          </h1>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => renderNavItem(item))}
          </ul>
        </nav>

        {/* Footer Section */}
        <div className="mt-8 p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Admin User</p>
              <p className="text-xs text-slate-600">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}