import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MenteeSidebar from "./MenteeSidebar";
import TutorSidebar from "./TutorSidebar";
import AdminSidebar from "./AdminSidebar";
import "../assets/css/style.css";

function DashboardLayout() {
  const role = localStorage.getItem("role") || "Mentee";
  const location = useLocation();
  
  // Xác định activeItem dựa trên pathname
  const getActiveItem = () => {
    const path = location.pathname;
    if (role === "Admin") {
      if (path.includes("/admin/dashboard")) return "dashboard";
      if (path.includes("/admin/tutor-approval")) return "tutor-approval";
      if (path.includes("/admin/users")) return "users";
      if (path.includes("/admin/activity")) return "activity";
      if (path.includes("/admin/reports")) return "reports";
      if (path.includes("/admin/quality")) return "quality";
      return null;
    } else if (role === "Tutor") {
      if (path.includes("/tutor/dashboard")) return "overview";
      if (path.includes("/tutor/meeting")) return "meeting";
      if (path.includes("/tutor/feedback")) return "feedback";
      if (path.includes("/tutor/schedule")) return "schedule";
      return null;
    } else {
      if (path.includes("/mentee/overview") || path === "/dashboard") return "overview";
      if (path.includes("/mentee/meeting")) return "meeting";
      if (path.includes("/mentee/find-tutor")) return "find-tutor";
      if (path.includes("/mentee/review")) return "review";
      if (path.includes("/mentee/register-tutor")) return "register-tutor";
      return null;
    }
  };

  // Không hiển thị sidebar ở trang /dashboard, /tutor/dashboard và /admin/dashboard
  const showSidebar = location.pathname !== "/dashboard" && 
                       location.pathname !== "/tutor/dashboard" && 
                       location.pathname !== "/admin/dashboard";

  return (
    <div className="dashboard-layout">
      <Header role={role.toLowerCase()} />
      
      <div className="dashboard-main">
        {/* Hiển thị sidebar dựa trên role, nhưng không hiển thị ở /dashboard */}
        {showSidebar && (
          role === "Admin" ? (
            <AdminSidebar activeItem={getActiveItem()} />
          ) : role === "Tutor" ? (
            <TutorSidebar activeItem={getActiveItem()} />
          ) : (
            <MenteeSidebar activeItem={getActiveItem()} />
          )
        )}
        
        <div className="dashboard-content-area">
          <Outlet />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default DashboardLayout;

