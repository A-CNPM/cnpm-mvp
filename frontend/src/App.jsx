import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import RoleSelection from "./pages/RoleSelection.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import FindTutor from "./pages/Mentee/FindTutor.jsx";
import MenteeMeeting from "./pages/Mentee/Meeting.jsx";
import MenteeProfileModal from "./pages/Mentee/MenteeProfileModal.jsx";
import RegisterTutor from "./pages/Mentee/RegisterTutor.jsx";
import Review from "./pages/Mentee/Review.jsx";
import Overview from "./pages/Mentee/Overview.jsx";
import Forum from "./pages/Forum.jsx";
import Calendar from "./pages/Mentee/Calendar.jsx";
import Report from "./pages/Mentee/Report.jsx";
import TutorDashboard from "./pages/Tutor/TutorDashboard.jsx";
import TutorMeeting from "./pages/Tutor/Meeting.jsx";
import TutorProfileModal from "./pages/Tutor/TutorProfileModal.jsx";
import TutorFeedback from "./pages/Tutor/Feedback.jsx";
import TutorOverview from "./pages/Tutor/Overview.jsx";
import TutorSchedule from "./pages/Tutor/Schedule.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import TutorApproval from "./pages/Admin/TutorApproval.jsx";
import UserManagement from "./pages/Admin/UserManagement.jsx";
import ActivityMonitoring from "./pages/Admin/ActivityMonitoring.jsx";
import Reports from "./pages/Admin/Reports.jsx";
import QualityMonitoring from "./pages/Admin/QualityMonitoring.jsx";

function AppContent() {
  return (
    <div className="Page">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mentee/overview" element={<Overview />} />
          <Route path="/mentee/find-tutor" element={<FindTutor />} />
          <Route path="/mentee/meeting" element={<MenteeMeeting />} />
          <Route path="/mentee/register-tutor" element={<RegisterTutor />} />
          <Route path="/mentee/review" element={<Review />} />
          <Route path="/mentee/calendar" element={<Calendar />} />
          <Route path="/mentee/report" element={<Report />} />
          <Route path="/tutor/dashboard" element={<TutorDashboard />} />
          <Route path="/tutor/overview" element={<TutorOverview />} />
          <Route path="/tutor/meeting" element={<TutorMeeting />} />
          <Route path="/tutor/feedback" element={<TutorFeedback />} />
          <Route path="/tutor/schedule" element={<TutorSchedule />} />
          <Route path="/tutor/id=12345" element={<TutorProfileModal />} />
          <Route path="/mentee/id=12345" element={<MenteeProfileModal />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tutor-approval" element={<TutorApproval />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/activity" element={<ActivityMonitoring />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/quality" element={<QualityMonitoring />} />
        </Route>
        <Route path="/forum" element={<Forum />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;