import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/Login.jsx";
import FindTutor from "./pages/Mentee/FindTutor.jsx";
import MenteeMeeting from "./pages/Mentee/Meeting.jsx";
import MenteeProfileModal from "./pages/Mentee/MenteeProfileModal.jsx";
import TutorMeeting from "./pages/Tutor/Meeting.jsx";
import TutorProfileModal from "./pages/Tutor/TutorProfileModal.jsx";

function AppContent() {
  const [role] = useState("tutor"); // hoặc "tutor"
  const location = useLocation();
  const hideHeaderFooter = location.pathname === "/" || location.pathname === "/login";

  return (
    <div className="Page">
      {!hideHeaderFooter && <Header role={role} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mentee/find-tutor" element={<FindTutor />} />
        <Route path="/mentee/meeting" element={<MenteeMeeting />} />
        <Route path="/tutor/meeting" element={<TutorMeeting />} />
        <Route path="/tutor/id=12345" element={<TutorProfileModal />} />
        <Route path="/mentee/id=12345" element={<MenteeProfileModal />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
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