
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileBarChart,
  LogOut,
  Clock,
  Plus,
  User,
  Video,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/interviews";

function InterviewerDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const [error, setError] = useState("");

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/my-sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSessions(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Unable to fetch interviews"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    navigate("/");
  };

  const handleStartInterview = async (session) => {
    try {
      setStartingId(session._id);
      setError("");

      const token = localStorage.getItem("token");

      // Start the interview on backend
      if (session.status === "Scheduled") {
        const response = await axios.post(
          `${API_URL}/${session._id}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update the session status locally
        setSessions((previousSessions) =>
          previousSessions.map((item) =>
            item._id === session._id
              ? response.data.session
              : item
          )
        );
      }

      // Open the video interview page
      navigate(`/video-interview/${session._id}`);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Unable to start interview"
      );
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg">

      {/* Sidebar */}
      <div className="w-56 bg-panel border-r border-border p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/20">
            {"</>"}
          </div>

          <span className="font-bold text-text">Platform</span>
        </div>

        <Link
          to="/interviewer-dashboard"
          className="flex items-center gap-2.5 bg-accent-soft text-accent font-semibold px-3 py-2.5 rounded-lg text-sm mb-1"
        >
          <LayoutDashboard size={16} />
          Live Monitoring
        </Link>

        <Link
          to="/schedule-interview"
          className="flex items-center gap-2.5 text-muted px-3 py-2.5 text-sm rounded-lg hover:bg-panel2 hover:text-text transition-colors"
        >
          <Calendar size={16} />
          Schedule Interview
        </Link>

        <Link
          to="/create-problem"
          className="flex items-center gap-2.5 text-muted px-3 py-2.5 text-sm rounded-lg hover:bg-panel2 hover:text-text transition-colors"
        >
          <BookOpen size={16} />
          Question Bank
        </Link>

        <div className="flex items-center gap-2.5 text-muted px-3 py-2.5 text-sm">
          <FileBarChart size={16} />
          Reports
        </div>

        {/* User Profile */}
        <div className="mt-auto pt-4 border-t border-border flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-accent/20">
            {name ? name.charAt(0).toUpperCase() : "I"}
          </div>

          <div className="flex-1">
            <p className="text-sm text-text font-medium">{name}</p>
            <p className="text-xs text-muted">Interviewer</p>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">
              Live Interview Monitoring
            </h1>

            <p className="text-sm text-muted mt-1">
              Track candidates in real time
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/schedule-interview"
              className="flex items-center gap-1.5 bg-accent text-white font-bold px-5 py-2.5 rounded-lg hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
            >
              <Plus size={16} />
              Schedule Interview
            </Link>

            <Link
              to="/create-problem"
              className="flex items-center gap-1.5 bg-panel border border-border text-text font-bold px-5 py-2.5 rounded-lg hover:bg-panel2 transition-colors"
            >
              <Plus size={16} />
              Create Problem
            </Link>
          </div>
        </div>

        {/* Refresh and Error */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted">
            {sessions.length} interview(s)
          </p>

          <button
            onClick={fetchSessions}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-muted hover:text-text"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-panel border border-border rounded-2xl p-6 text-muted">
            Loading interviews...
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State */
          <div className="bg-panel border border-border rounded-2xl p-6 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent">
              <Calendar size={18} />
            </div>

            <div>
              <span className="bg-accent-soft text-accent text-xs font-bold px-3 py-1 rounded-full">
                No interviews scheduled
              </span>

              <p className="text-muted text-sm mt-1.5">
                Schedule an interview to see candidate activity here.
              </p>
            </div>
          </div>
        ) : (
          /* Interview List */
          sessions.map((session) => {
            const isLive = session.status === "Live";

            const isFinished =
              session.status === "Completed" ||
              session.status === "Cancelled";

            const isStarting = startingId === session._id;

            return (
              <div
                key={session._id}
                className="bg-panel border border-border rounded-2xl p-5 flex justify-between items-center mb-4 hover:border-accent/40 transition-colors shadow-sm"
              >
                <div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isLive
                        ? "bg-green-500/10 text-green-500"
                        : isFinished
                        ? "bg-gray-500/10 text-gray-500"
                        : "bg-accent-soft text-accent"
                    }`}
                  >
                    {session.status}
                  </span>

                  <h3 className="text-text font-semibold mt-2 text-base">
                    {session.title}
                  </h3>

                  <p className="text-muted text-sm flex items-center gap-1.5 mt-1">
                    <User size={13} />

                    {session.candidate?.name || "Candidate"}
                    {session.candidate?.email
                      ? ` (${session.candidate.email})`
                      : ""}
                  </p>

                  <p className="text-muted text-sm flex items-center gap-1.5 mt-0.5">
                    <Clock size={13} />

                    {session.problems?.length || 0} problems ·{" "}
                    {session.duration} minutes ·{" "}
                    {new Date(session.scheduledAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleStartInterview(session)}
                  disabled={isFinished || isStarting}
                  className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-lg transition-colors ${
                    isFinished
                      ? "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                      : "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20"
                  }`}
                >
                  {isStarting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Connecting...
                    </>
                  ) : isLive ? (
                    <>
                      <Video size={16} />
                      Rejoin session
                    </>
                  ) : isFinished ? (
                    session.status
                  ) : (
                    <>
                      <Video size={16} />
                      Start session
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default InterviewerDashboard;
