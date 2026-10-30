
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { JitsiMeeting } from "@jitsi/react-sdk";
import {
  Video,
  LoaderCircle,
  AlertCircle,
  PhoneOff,
} from "lucide-react";

const API_URL = "http://localhost:8080/api/interviews";

function VideoInterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meetingUrl, setMeetingUrl] = useState("");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "Participant";

  useEffect(() => {
    let isMounted = true;

    const fetchMeeting = async () => {
      try {
        let response;

        // Interviewer room was already started from dashboard.
        // Here interviewer only fetches the existing room.
        if (role === "interviewer") {
          response = await axios.get(
            `${API_URL}/${id}/join`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          // Candidate joins an already started interview
          response = await axios.get(
            `${API_URL}/${id}/join`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        if (!response.data.meetingUrl || !response.data.session?.roomId) {
          throw new Error("Meeting room details are missing");
        }

        if (isMounted) {
          setMeetingUrl(response.data.meetingUrl);
          setSession(response.data.session);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to connect to the interview"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMeeting();

    return () => {
      isMounted = false;
    };
  }, [id, role, token]);

  const handleLeave = () => {
    navigate(
      role === "interviewer"
        ? "/interviewer-dashboard"
        : "/student-dashboard"
    );
  };

  const handleEndInterview = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to end this interview for everyone?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setEnding(true);

      await axios.post(
        `${API_URL}/${id}/end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/interviewer-dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to end the interview"
      );
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-text">
        <LoaderCircle className="animate-spin mb-3" size={32} />
        <p>Connecting to interview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-text p-6">
        <AlertCircle size={36} className="text-red-500 mb-3" />

        <h2 className="text-xl font-bold mb-2">
          Unable to join interview
        </h2>

        <p className="text-muted text-center mb-5">
          {error}
        </p>

        <button
          onClick={handleLeave}
          className="bg-accent text-white px-5 py-2.5 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!meetingUrl || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Video size={20} className="text-accent" />

          <div>
            <h1 className="font-bold">{session.title}</h1>

            <p className="text-xs text-muted">
              {role === "interviewer" ? "Interviewer" : "Candidate"}:{" "}
              {name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {role === "interviewer" && (
            <button
              onClick={handleEndInterview}
              disabled={ending}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg"
            >
              <PhoneOff size={16} />

              {ending ? "Ending..." : "End Interview"}
            </button>
          )}

          <button
            onClick={handleLeave}
            className="bg-panel border border-border hover:bg-panel2 text-text font-semibold px-4 py-2 rounded-lg"
          >
            Leave Interview
          </button>
        </div>
      </div>

      {/* Jitsi Video Meeting */}
      <div className="h-[calc(100vh-64px)]">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={session.roomId}
          userInfo={{
            displayName: name,
          }}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          }}
          interfaceConfigOverwrite={{
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
          }}
          onReadyToClose={handleLeave}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100%";
            iframeRef.style.width = "100%";
          }}
        />
      </div>
    </div>
  );
}

export default VideoInterviewPage;
