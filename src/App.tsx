import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import LoginPage from "./components/auth/loginPage";
import MainPage from "./components/main";
import RegisterPage from "./components/auth/registerPage";

import { LoadingOverlay } from "./components/loadingOverlay/LoadingOverlay";
import ClinicsPage from "./components/clinics/ClinicPage";
import ClinicDetailPage from "./components/clinics/oneClinic/ClinicDetailsPage";



function App() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          direction: "rtl",
        }}
      >
        <div style={{ color: "#4b5563", fontSize: "0.875rem" }}>
          در حال بررسی وضعیت ورود...
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <MainPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegisterPage />
            )
          }
        />
    
          <Route path="dashboard" element={<ClinicsPage />} />
           
  
          <Route path="/clinics/:id" element={<ClinicDetailPage />} />




          <Route path="*" element={<Navigate to="/" replace />} />
    
      </Routes>
    </>
  );
}

export default App;


//   return (
//     <>
//       <LoadingOverlay />
//       <Routes>
//         <Route
//           path="/"
//           element={
//             isAuthenticated ? (
//               <Navigate to="/dashboard" replace />
//             ) : (
//               <MainPage />
//             )
//           }
//         />
//         <Route
//           path="/login"
//           element={
//             isAuthenticated ? (
//               <Navigate to="/dashboard" replace />
//             ) : (
//               <LoginPage />
//             )
//           }
//         />
//         <Route
//           path="/register"
//           element={
//             isAuthenticated ? (
//               <Navigate to="/dashboard" replace />
//             ) : (
//               <RegisterPage />
//             )
//           }
//         />
//         <Route path="/" element={<LayoutDashboard />}>
//           <Route path="dashboard" element={<MainTherapist />} />
//           <Route path="leaves" element={<LeaveRequests />} />
        
//               <Route path="systematicassessments">
//             {/* مسیر فرزند: پارامتر Id اجباری است */}
//             <Route index element={<AssessmentTemplatesPanel/>}/>
//             <Route
//               path="edit/:id/"
//               element={<AssessmentTemplateCreateForm />}
//             />
//             <Route
//               path="new/"
//               element={<AssessmentTemplateCreateForm />}
//             />
//           </Route>

//             <Route path="exercises">
//             {/* مسیر فرزند: پارامتر Id اجباری است */}
//             <Route index element={<ExerciseManagerPanel currentTherapistId={user?._id} onCreateExercise={()=>navigate('/exercises/new') } onEditExercise={ (exercise:IExercise)=>navigate("/exercises/edit/"+exercise._id) }/>}/>
//             <Route
//               path="edit/:id/"
//               element={<ExerciseForm onSuccess={()=>navigate("/exercises") } onCancel={()=>navigate("/exercises")} />}
//             />
//             <Route
//               path="new/"
//               element={<ExerciseForm onSuccess={()=>navigate("/exercises") } onCancel={()=>navigate("/exercises")}  />}
//             />
//           </Route>

//               {/* <Route path="exercisesheets">
        
//             <Route index element={<TherapistExerciseSheets />}/>
           
//           </Route> */}
//           <Route
//   path="/exercise-sheets"
//   element={
//     <ExerciseSheetListPage
//       currentTherapistId={user?._id}
//     />
//   }
// />

// <Route
//   path="/exercise-sheets/create"
//   element={
//     <ExerciseSheetFormPage isNew={false}  

//     />
//   }
// />

// <Route
//   path="/exercise-sheets/:id/edit"
//   element={
//     <ExerciseSheetFormPage

//             isNew={false}
//     />
    
//   }
// />

// <Route
//   path="/exercise-sheets/:id/new"
//   element={
//     <ExerciseSheetFormPage
   
//       isNew={true}
   
//     />
    
//   }
// />

// <Route
//   path="/exercise-sheets/:id/new/:patientId"
//   element={
//     <ExerciseSheetFormPage
   
//       isNew={true}
   
//     />
    
    
//   }
// />
// <Route
//   path="/exercise-sheets/new/:patientId"
//   element={
//     <ExerciseSheetFormPage
   
//       isNew={true}
   
//     />
    
    
//   }
// />
//           <Route path="patientprofile">
//             {/* مسیر فرزند: پارامتر Id اجباری است */}
           
//  <Route index element={<MainPatientProfile/>}/>
 
 
//        <Route
//               path=":Id/assessments/select"
//               element={<SystematicAssessmentSelector/>}
//             />
//             <Route
//               path=":Id/assessments"
//               element={<MainOnePatientAssessments />}
//             />
//                      <Route
//               path=":Id/exercises"
//               element={<PatientExerciseSheetsPage />}
//             />
//             <Route
//               path=":Id"
//               element={<OnePatientProfile />}
//             />
//       <Route
//               path="assessments/run/:Id"
//               element={<SystematicAssessmentRunner/>}
//             />
//           </Route>

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Route>
//       </Routes>
//     </>
//   );