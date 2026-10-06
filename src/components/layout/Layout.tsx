import "./Layout.css";
import { Outlet, useNavigate } from "react-router-dom";
// import { logoutAdmin } from "../../api/auth";

// import { GetPendingLeaveRequestsCount } from "../../api/adminpanel";

import Swal from "sweetalert2";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

const LayoutDashboard = () => {
  const { user, logout } = useAuth();


  const fullName = user?.fullName  || "";

  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: "آیا اطمینان دارید؟",
      text: "برای خروج از حساب کاربری تایید کنید!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "تایید",
      cancelButtonText: "لغو",
    }).then((result) => {
      if (result.isConfirmed) {
        logout().then(() => {
          Swal.fire({
            title: "خروج موفق!",
            text: "با موفقیت خارج شدید!",
            icon: "success",
          });
          navigate("/");
        });
      }
    });
  };

  return (
    <div className={`admin-layout ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
      <aside className={`admin-sidebar ${!isSidebarOpen ? "closed" : ""}`}>
        <div className="sidebar-header p-1! ">
          <button
            className="toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {isSidebarOpen && (
          <>
            <div className="flex-col! text-center!">
              <p className="min-w-45 mx-2! p-1!  text-center mb-2! border-purple-400 border-2 rounded-xl bg-blue-900  text">
                {" "}
                کاربر فعال :{fullName}
              </p>
            
            </div>

            <button onClick={handleLogout} className="logout-btn">
              خروج از حساب
            </button>
            <ul>
              <li
                onClick={() => {
                  navigate("/dashboard");
                  setIsSidebarOpen(false);
                }}
              >
                داشبورد
              </li>
             
            
                    <li
                onClick={() => {
                  navigate("/systematicassessments");
                  setIsSidebarOpen(false);
                }}
              >
                ارزیابی های سیستماتیک
              </li>
                <li
                onClick={() => {
                  navigate("/exercises");
                  setIsSidebarOpen(false);
                }}
              >
               تمرینات
              </li>

  <li onClick={() => {navigate("/exercise-sheets")
                setIsSidebarOpen(false)
              }}>
                برگه های تمرین
              </li>
              <button
                className=" p-1! w-50! rounded-xl bg-blue-300 text-black font-bold border  mt-3!"
                onClick={() => {
                  window.location.reload();
                  setIsSidebarOpen(false);
                }}
              >
                بروزرسانی
              </button>
            </ul>
          </>
        )}
      </aside>

      <main className="admin-main">
        {!isSidebarOpen && (
          <button
            className="floating-toggle-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars />
          </button>
        )}
        <Outlet />
      </main>
    
    </div>
  );
};

export default LayoutDashboard;
