
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignupPage from "./pages/Signup";
import Navbar from "./components/Navbar";

import StudentDashboard from "./pages/StudentDashboard";
import StudentInterviews from "./pages/StudentInterviews";

import PracticePage from "./pages/PracticePage";
import ProblemSolvePage from "./pages/ProblemSolvePage";
import InterviewerDashboard from "./pages/InterviewerDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import CreateProblemPage from "./pages/CreateProblemPage";
import ScheduleInterviewPage from "./pages/ScheduleInterviewPage";
import VideoInterviewPage from "./pages/VideoInterviewPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignupPage />} />

        {/* Student Dashboard */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Interviews */}
        <Route
          path="/student-interviews"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentInterviews />
            </ProtectedRoute>
          }
        />

        {/* Interviewer Dashboard */}
        <Route
          path="/interviewer-dashboard"
          element={
            <ProtectedRoute allowedRole="interviewer">
              <InterviewerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Interviewer Routes */}
        <Route
          path="/create-problem"
          element={
            <ProtectedRoute allowedRole="interviewer">
              <CreateProblemPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule-interview"
          element={
            <ProtectedRoute allowedRole="interviewer">
              <ScheduleInterviewPage />
            </ProtectedRoute>
          }
        />

        {/* Video Interview Route */}
        <Route
          path="/video-interview/:id"
          element={
            <ProtectedRoute allowedRole={["interviewer", "student"]}>
              <VideoInterviewPage />
            </ProtectedRoute>
          }
        />

        {/* Practice Routes */}
        <Route
          path="/practice"
          element={<PracticePage />}
        />

        <Route
          path="/practice/:id"
          element={<ProblemSolvePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
