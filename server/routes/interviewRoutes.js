
import express from "express";
import mongoose from "mongoose";
import InterviewSession from "../models/InterviewSession.js";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import crypto from "crypto";

const router = express.Router();

// Helper: Check whether logged-in user is part of this interview
const isParticipant = (session, userId) => {
  return (
    session.interviewer.toString() === userId.toString() ||
    session.candidate.toString() === userId.toString()
  );
};

// Create a new interview session (interviewer only)
router.post("/", protect, async (req, res) => {
  const { title, problems, candidateEmail, scheduledAt, duration } = req.body;

  try {
    if (req.user.role !== "interviewer") {
      return res.status(403).json({
        message: "Only interviewer can schedule an interview",
      });
    }

    const candidate = await User.findOne({
      email: candidateEmail,
      role: "student",
    });

    if (!candidate) {
      return res.status(404).json({
        message: "No student found with this email",
      });
    }

    const newSession = new InterviewSession({
      title,
      problems,
      interviewer: req.user.id,
      candidate: candidate._id,
      scheduledAt,
      duration,
    });

    await newSession.save();

    res.status(201).json({
      message: "Interview scheduled successfully",
      session: newSession,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error scheduling interview",
    });
  }
});

// Get sessions for the logged-in user
router.get("/my-sessions", protect, async (req, res) => {
  try {
    let sessions;

    if (req.user.role === "interviewer") {
      sessions = await InterviewSession.find({
        interviewer: req.user.id,
      })
        .populate("candidate", "name email")
        .populate("problems", "title difficulty");
    } else {
      sessions = await InterviewSession.find({
        candidate: req.user.id,
      })
        .populate("interviewer", "name email")
        .populate("problems", "title difficulty");
    }

    res.status(200).json(sessions);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error fetching sessions",
    });
  }
});

// Start interview (interviewer only)
router.post("/:id/start", protect, async (req, res) => {
  try {
    if (req.user.role !== "interviewer") {
      return res.status(403).json({
        message: "Only interviewer can start the interview",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid interview ID",
      });
    }

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      interviewer: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found",
      });
    }

    if (session.status === "Cancelled" || session.status === "Completed") {
      return res.status(400).json({
        message: `Interview is already ${session.status.toLowerCase()}`,
      });
    }

    // Reuse existing room if interview has already started
    if (session.status === "Live" && session.roomId) {
      return res.status(200).json({
        message: "Interview is already live",
        session,
        meetingUrl: session.meetingUrl,
      });
    }

    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);
    const durationMs = (session.duration || 60) * 60 * 1000;

    // Allow starting 15 minutes before scheduled time
    if (now < new Date(scheduledTime.getTime() - 15 * 60 * 1000)) {
      return res.status(400).json({
        message: "Interview cannot be started yet",
      });
    }

    // Don't start after scheduled duration has passed
    if (now > new Date(scheduledTime.getTime() + durationMs)) {
      return res.status(400).json({
        message: "Scheduled interview time has expired",
      });
    }

    const roomId = `interview-${crypto.randomBytes(12).toString("hex")}`;
    const meetingUrl = `https://meet.jit.si/${roomId}`;

    session.roomId = roomId;
    session.meetingUrl = meetingUrl;
    session.startedAt = now;
    session.status = "Live";

    await session.save();

    res.status(200).json({
      message: "Interview started successfully",
      session,
      meetingUrl,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error starting interview",
    });
  }
});

// Join interview (interviewer or assigned candidate)
router.get("/:id/join", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid interview ID",
      });
    }

    const session = await InterviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found",
      });
    }

    if (!isParticipant(session, req.user.id)) {
      return res.status(403).json({
        message: "You are not part of this interview",
      });
    }

    if (session.status !== "Live" || !session.meetingUrl) {
      return res.status(400).json({
        message: "Interview has not started yet",
      });
    }

    res.status(200).json({
      message: "Joining interview",
      session,
      meetingUrl: session.meetingUrl,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error joining interview",
    });
  }
});

// End interview (interviewer only)
router.post("/:id/end", protect, async (req, res) => {
  try {
    if (req.user.role !== "interviewer") {
      return res.status(403).json({
        message: "Only interviewer can end the interview",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid interview ID",
      });
    }

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      interviewer: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found",
      });
    }

    if (session.status !== "Live") {
      return res.status(400).json({
        message: "Interview is not live",
      });
    }

    session.status = "Completed";
    session.endedAt = new Date();

    await session.save();

    res.status(200).json({
      message: "Interview ended successfully",
      session,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error ending interview",
    });
  }
});

export default router;
