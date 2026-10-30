
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Video,
  RefreshCw,
  LogOut,
  ArrowLeft,
} from "lucide-react";

const API_URL = "http://localhost:8080/api";

const StudentInterviews = () => {
  const navigate = useNavigate();

  const name = localStorage.getItem("name");

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  const fetchSessions = useCallback(async () => {
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
      console.error("Failed to fetch interviews:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load interviews. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleJoinInterview = (session) => {
    if (session.status !== "Live") {
      return;
    }

    setJoiningId(session._id);

    navigate(`/video-interview/${session._id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    navigate("/");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Live":
        return "bg-green/15 text-green";

      case "Completed":
        return "bg-panel2 text-muted";

      case "Cancelled":
        return "bg-red/15 text-red";

      default:
        return "bg-accent-soft text-accent";
    }
  };

  const renderAction = (session) => {
    if (session.status === "Live") {
      return (
        <button
          onClick={() => handleJoinInterview(session)}
          disabled={joiningId === session._id}
          className="flex items-center gap-2 bg-green text-white font-bold px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
        >
          <Video size={16} />
          {joiningId === session._id
            ? "Joining..."
            : "Join Interview"}
        </button>
      );
    }

    if (session.status === "Scheduled") {
      return (
        <button
          disabled
          className="bg-panel2 text-muted font-semibold px-4 py-2.5 rounded-lg cursor-not-allowed"
        >
          Waiting for interviewer
        </button>
      );
    }

    return (
      <button
        disabled
        className="bg-panel2 text-muted font-semibold px-4 py-2.5 rounded-lg cursor-not-allowed"
      >
        {session.status}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <aside className="w-56 bg-panel border-r border-border p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
            {"</>"}
          </div>

          <span className="font-bold text-text">Platform</span>
        </div>

        <Link
          to="/student-dashboard"
          className="flex items-center gap-2.5 text-muted px-3 py-2.5 text-sm rounded-lg hover:bg-panel2 hover:text-text transition-colors"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <Link
          to="/student-interviews"
          className="flex items-center gap-2.5 bg-accent-soft text-accent font-semibold px-3 py-2.5 rounded-lg text-sm mt-1"
        >
          <Calendar size={16} />
          Interviews
        </Link>

        <div className="mt-auto pt-4 border-t border-border flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white text-xs font-bold">
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
            title="Logout"
            className="text-muted hover:text-red p-1.5 rounded-md hover:bg-red/10 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to="/student-dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent mb-3"
            >
              <ArrowLeft size={15} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-text">
              My Interviews
            </h1>

            <p className="text-sm text-muted mt-1">
              View and join all your scheduled interviews.
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

        {/* Interview Count */}
        <div className="bg-panel border border-border rounded-xl p-4 mb-6">
          <p className="text-sm text-muted">
            Total interviews
          </p>

          <p className="text-2xl font-bold text-text mt-1">
            {sessions.length}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-panel border border-border rounded-2xl p-6">
            <p className="text-muted text-sm">
              Loading interviews...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-panel border border-border rounded-2xl p-6">
            <p className="text-red text-sm">{error}</p>

            <button
              onClick={fetchSessions}
              className="mt-3 text-sm text-accent font-semibold"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sessions.length === 0 && (
          <div className="bg-panel border border-border rounded-2xl p-8 text-center">
            <Calendar
              size={32}
              className="text-muted mx-auto mb-3"
            />

            <h3 className="text-text font-semibold">
              No interviews found
            </h3>

            <p className="text-muted text-sm mt-1">
              Your interviews will appear here once they are scheduled.
            </p>
          </div>
        )}

        {/* Interview List */}
        {!loading &&
          !error &&
          sessions.map((session) => (
            <div
              key={session._id}
              className="bg-panel border border-border rounded-2xl p-5 mb-4 flex flex-wrap items-center justify-between gap-4 hover:border-accent/40 transition-colors"
            >
              <div className="min-w-0">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusClass(
                    session.status
                  )}`}
                >
                  {session.status}
                </span>

                <h3 className="text-text font-semibold mt-3 text-base">
                  {session.title}
                </h3>

                <p className="text-muted text-sm flex items-center gap-2 mt-2">
                  <Clock size={14} />

                  {session.duration} minutes
                  {" · "}
                  {session.problems?.length || 0} problems
                </p>

                <p className="text-muted text-sm mt-1">
                  {new Date(session.scheduledAt).toLocaleString()}
                </p>

                {session.interviewer && (
                  <p className="text-muted text-xs mt-2">
                    Interviewer:{" "}
                    {session.interviewer.name ||
                      session.interviewer.email ||
                      "Interviewer"}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                {renderAction(session)}
              </div>
            </div>
          ))}
      </main>
    </div>
  );
};

export default StudentInterviews;
