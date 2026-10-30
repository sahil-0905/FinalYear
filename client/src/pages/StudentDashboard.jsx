
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Code2,
  Calendar,
  TrendingUp,
  LogOut,
  Target,
  Trophy,
  Flame,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:8080/api";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const name = localStorage.getItem("name");

  const [sessions, setSessions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    navigate("/");
  };

  // Fetch interview sessions
  const fetchSessions = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/interviews/my-sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSessions(response.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);

      setError(
        err.response?.data?.message ||
          "Unable to fetch interview sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch practice problems
  const fetchProblems = async () => {
    try {
      const response = await axios.get(`${API_URL}/problems`);

      setProblems(response.data.slice(0, 3));
    } catch (err) {
      console.error("Error fetching problems:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <div className="w-56 bg-panel border-r border-border p-4 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
            {"</>"}
          </div>

          <span className="font-bold text-text">Platform</span>
        </div>

        {/* Dashboard */}
        <Link
          to="/student-dashboard"
          className="flex items-center gap-2.5 bg-accent-soft text-accent font-semibold px-3 py-2.5 rounded-lg text-sm mb-1"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        {/* Practice */}
        <Link
          to="/practice"
          className="flex items-center gap-2.5 text-muted px-3 py-2.5 text-sm rounded-lg hover:bg-panel2 hover:text-text transition-colors"
        >
          <Code2 size={16} />
          Practice
        </Link>

        {/* Interviews */}
        <Link
          to="/student-interviews"
          className="flex items-center gap-2.5 text-muted px-3 py-2.5 text-sm rounded-lg hover:bg-panel2 hover:text-text transition-colors"
        >
          <Calendar size={16} />
          Interviews
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2.5 text-muted px-3 py-2.5 text-sm">
          <TrendingUp size={16} />
          Progress
        </div>

        {/* User Profile */}
        <div className="mt-auto pt-4 border-t border-border flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-accent/20">
            {name ? name.charAt(0).toUpperCase() : "S"}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-text font-medium truncate">
              {name || "Student"}
            </p>

            <p className="text-xs text-muted">Student</p>
          </div>

          <button
            onClick={handleLogout}
            className="text-muted hover:text-red p-1.5 rounded-md hover:bg-red/10 transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">
              Welcome back, {name || "Student"} 👋
            </h1>

            <p className="text-sm text-muted mt-1">
              Keep your streak going
            </p>
          </div>

          <button
            onClick={fetchSessions}
            className="flex items-center gap-2 text-sm text-muted hover:text-accent border border-border rounded-lg px-3 py-2"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Interview Summary */}
        <div className="bg-panel border border-border rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent">
              <Calendar size={18} />
            </div>

            <div>
              <h3 className="text-text font-semibold">
                My Interviews
              </h3>

              <p className="text-muted text-sm mt-1">
                {loading
                  ? "Loading interviews..."
                  : error
                  ? error
                  : `${sessions.length} interview sessions`}
              </p>
            </div>
          </div>

          <Link
            to="/student-interviews"
            className="bg-accent text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-accent/90 transition-colors text-sm"
          >
            View All
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Problems Solved */}
          <div className="bg-panel border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-xs">
                Problems solved
              </p>

              <Target size={14} className="text-accent" />
            </div>

            <p className="text-text text-2xl font-bold">
              142
            </p>
          </div>

          {/* Accuracy */}
          <div className="bg-panel border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-xs">
                Accuracy
              </p>

              <Trophy size={14} className="text-green" />
            </div>

            <p className="text-green text-2xl font-bold">
              78%
            </p>
          </div>

          {/* Streak */}
          <div className="bg-panel border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-xs">
                Day streak
              </p>

              <Flame size={14} className="text-amber" />
            </div>

            <p className="text-amber text-2xl font-bold">
              9
            </p>
          </div>

          {/* Completed Interviews */}
          <div className="bg-panel border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-xs">
                Interviews taken
              </p>

              <Calendar size={14} className="text-accent" />
            </div>

            <p className="text-text text-2xl font-bold">
              {sessions.filter(
                (session) => session.status === "Completed"
              ).length}
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-4">
          {/* Practice List */}
          <div className="bg-panel border border-border rounded-2xl p-5">
            <h4 className="font-bold text-text mb-3 flex items-center gap-2">
              <Code2 size={16} className="text-accent" />
              Continue practicing
            </h4>

            {problems.length === 0 ? (
              <p className="text-muted text-sm">
                No practice problems available.
              </p>
            ) : (
              problems.map((problem, index) => (
                <Link
                  key={problem._id}
                  to={`/practice/${problem._id}`}
                >
                  <div
                    className={`flex justify-between items-center py-3 px-2 -mx-2 rounded-lg text-sm hover:bg-panel2 transition-colors ${
                      index !== problems.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    <span className="text-text font-medium">
                      {problem.title}
                    </span>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        problem.difficulty === "Easy"
                          ? "bg-green/15 text-green"
                          : problem.difficulty === "Medium"
                          ? "bg-amber/15 text-amber"
                          : "bg-red/15 text-red"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Topic Progress */}
          <div className="bg-panel border border-border rounded-2xl p-5">
            <h4 className="font-bold text-text mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-accent" />
              Topic-wise progress
            </h4>

            {/* Trees */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text font-medium">
                  Trees
                </span>

                <span className="text-muted">
                  18/25
                </span>
              </div>

              <div className="h-1.5 bg-input rounded-full overflow-hidden">
                <div
                  className="h-1.5 bg-gradient-to-r from-accent to-purple-400 rounded-full"
                  style={{ width: "72%" }}
                />
              </div>
            </div>

            {/* Graphs */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text font-medium">
                  Graphs
                </span>

                <span className="text-muted">
                  9/20
                </span>
              </div>

              <div className="h-1.5 bg-input rounded-full overflow-hidden">
                <div
                  className="h-1.5 bg-gradient-to-r from-accent to-purple-400 rounded-full"
                  style={{ width: "45%" }}
                />
              </div>
            </div>

            {/* Arrays */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text font-medium">
                  Arrays
                </span>

                <span className="text-muted">
                  30/30
                </span>
              </div>

              <div className="h-1.5 bg-input rounded-full overflow-hidden">
                <div
                  className="h-1.5 bg-gradient-to-r from-accent to-purple-400 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
