import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import Layout from "./dashboard/adminlayout.jsx";

// Pages
import Dashboard from "./Components/dashboard.jsx";
import UserManagement from "./Components/UserManagement.jsx";
import ChannelManagement from "./Components/ChannelManagement.jsx";
import CategoryManagement from "./Components/CategoryManagement.jsx";
import CourseManagement from "./Components/CourseManagement.jsx";
import PlaylistManagement from "./Components/PlaylistManagement.jsx";
import QuizManagement from "./Components/QuizManagement.jsx";
import Statistics from "./Components/Statistic.jsx";
import HDashboard from "./Helpdesk/HDashboard.jsx";
import Calender from "./Components/Calender.jsx";
import Customer from "./Helpdesk/Customer.jsx";
import CreateTicket from "./Helpdesk/Ticket/Create.jsx";
import Details from "./Helpdesk/Ticket/Details.jsx";
import List from "./Helpdesk/Ticket/List.jsx";
import PricingPlans from "./Components/dashboard.jsx";
import ListPage from "./Components/dashboard.jsx";
import AnalyticsDashboard from "./Components/dashboard.jsx";
// import services from './Components/ServiceManagement.jsx';
import ServiceManagement from "./Components/ServiceManagement.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="services" element={<ServiceManagement />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="channels" element={<ChannelManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="playlists" element={<PlaylistManagement />} />
        <Route path="quizzes" element={<QuizManagement />} />
        <Route path="hdashboard" element={<HDashboard />} />
        <Route path="customer" element={<Customer />} />
        <Route path="calender" element={<Calender />} />

        {/* Helpdesk */}
        <Route path="help-desk/ticket/create" element={<CreateTicket />} />
        <Route path="help-desk/ticket/details" element={<Details />} />
        <Route path="help-desk/ticket/list" element={<List />} />

        {/* Others */}
        <Route path="pricing" element={<PricingPlans />} />
        <Route path="listpage" element={<ListPage />} />
        <Route path="analytics-dashboard" element={<AnalyticsDashboard />} />
      </Route>
    </Routes>
  );
}






// import React from 'react';
// import AdminPanel from './Components/AdminPanel.jsx';

// import './index.css';

// function App() {
//   return (
//     <div className="App bg-gray-100 min-h-screen">
//       <AdminPanel />
//     </div>
//   );
// }

// export default App;