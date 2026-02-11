// import express from "express";
// import { InterviewSession } from "../models/InterviewSession.js";
// import { verifyToken } from "../../middleware/verifytoken.js";

// const router = express.Router();

// router.post("/start", verifyToken, async (req, res) => {
//   try {
//     const { companyType, role } = req.body;

//     if (!companyType || !role) {
//       return res.status(400).json({ message: "companyType and role are required" });
//     }

//     // ✅ CONSUME INTERVIEW CREDIT FIRST
//     try {
//       await axios.post(
//         "http://localhost:5000/api/payment/consume-interview",
//         {},
//         {
//           headers: {
//             Cookie: req.headers.cookie, // Forward auth cookie
//           },
//         }
//       );
//     } catch (creditErr) {
//       // If credit consumption fails, block interview start
//       const errorMsg = creditErr.response?.data?.message || "Failed to verify subscription";
//       return res.status(403).json({ 
//         message: errorMsg,
//         requiresPayment: creditErr.response?.data?.requiresPayment,
//         needsUpgrade: creditErr.response?.data?.needsUpgrade
//       });
//     }

//     // ✅ CREATE SESSION ONLY IF CREDIT WAS CONSUMED
//     const session = await InterviewSession.create({
//       userId: req.user.id,
//       companyType,
//       role,
//       status: "in-progress",
//       startedAt: new Date(),
//       messages: [],
//       solvedProblems: [],
//     });

//     res.status(201).json({
//       success: true,
//       sessionId: session._id,
//     });

//   } catch (err) {
//     console.error("❌ Start interview error:", err);
//     res.status(500).json({ message: "Failed to start interview session" });
//   }
// });


// // ✅ COMPLETE INTERVIEW SESSION
// router.patch("/complete/:sessionId", verifyToken, async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const { reportUrl, messages, solvedProblems, highlightClips } = req.body;

//     if (!reportUrl) {
//       return res.status(400).json({ message: "Report URL is required" });
//     }

//     const session = await InterviewSession.findOne({
//       _id: sessionId,
//       userId: req.user.id, // ⚠️ MUST be userId, not user
//     });

//     if (!session) {
//       return res.status(404).json({ message: "Interview session not found" });
//     }

//     session.reportUrl = reportUrl;
//     session.messages = messages || [];
//     session.solvedProblems = solvedProblems || [];
//     session.highlightClips = highlightClips || [];
//     session.status = "completed";
//     session.completedAt = new Date();

//     await session.save();

//     res.json({
//       success: true,
//       message: "Interview completed successfully",
//     });
//   } catch (err) {
//     console.error("Complete interview error:", err);
//     res.status(500).json({ message: "Failed to complete interview session" });
//   }
// });



// // GET all interviews for logged-in user
// router.get("/my", verifyToken, async (req, res) => {
//   try {
//     const interviews = await InterviewSession.find({
//       userId: req.user.id,
//     })
//       .sort({ startedAt: -1 })
//       .select(
//         "role companyType startedAt completedAt reportUrl messages solvedProblems highlightClips status"
//       );

//     res.json({
//       success: true,
//       interviews,
//     });
//   } catch (err) {
//     console.error("Fetch interviews error:", err);
//     res.status(500).json({ message: "Failed to fetch interviews" });
//   }
// });



// router.get("/:sessionId", verifyToken, async (req, res) => {
//   try {
//     const { sessionId } = req.params;

//     const session = await InterviewSession.findOne({
//       _id: sessionId,
//       userId: req.user.id,
//     });

//     if (!session) {
//       return res.status(404).json({ message: "Interview session not found" });
//     }

//     res.json({
//       success: true,
//       session,
//     });
//   } catch (err) {
//     console.error("Fetch session error:", err);
//     res.status(500).json({ message: "Failed to fetch interview session" });
//   }
// });

// router.delete("/:id", verifyToken, async (req, res) => {
//   try {
//     const session = await InterviewSession.findOne({
//       _id: req.params.id,
//       userId: req.user.id, // IMPORTANT: ownership check
//     });

//     if (!session) {
//       return res.status(404).json({ success: false, message: "Interview not found" });
//     }

//     await session.deleteOne();

//     return res.json({ success: true });
//   } catch (err) {
//     console.error("Delete interview failed:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ✅ ADMIN: get all interview sessions for a user
// router.get("/admin/user/:userId", async (req, res) => {
//   try {
//     const sessions = await InterviewSession.find({
//       userId: req.params.userId
//     })
//       .sort({ startedAt: -1 })
//       .select(
//         "companyType role status startedAt completedAt reportUrl messages solvedProblems highlightClips"
//       )
//       .lean();

//     res.json({
//       success: true,
//       interviews: sessions
//     });
//   } catch (err) {
//     console.error("Admin interview fetch error:", err);
//     res.status(500).json({ message: "Failed to fetch interviews" });
//   }
// });

// // ✅ ADMIN: GLOBAL INTERVIEW STATS
// router.get("/admin/stats", async (req, res) => {
//   try {
//     const sessions = await InterviewSession.find({}).select(
//       "status companyType messages solvedProblems highlightClips"
//     );

//     const stats = {
//       total: sessions.length,
//       completed: 0,
//       inProgress: 0,
//       startup: 0,
//       service: 0,
//       product: 0,

//       // 🔥 NEW GLOBAL COUNTS
//       totalMessages: 0,
//       totalProblems: 0,
//       totalClips: 0,
//     };

//     sessions.forEach(s => {
//       // status
//       if (s.status === "completed") stats.completed++;
//       else stats.inProgress++;

//       // company type
//       const type = s.companyType?.toLowerCase();
//       if (type === "startup") stats.startup++;
//       if (type === "service") stats.service++;
//       if (type === "product") stats.product++;

//       // 🔥 NEW AGGREGATES
//       stats.totalMessages += s.messages?.length || 0;
//       stats.totalProblems += s.solvedProblems?.length || 0;
//       stats.totalClips += s.highlightClips?.length || 0;
//     });

//     res.json({ success: true, stats });
//   } catch (err) {
//     console.error("Interview stats error:", err);
//     res.status(500).json({ message: "Failed to fetch interview stats" });
//   }
// });


// export default router;


import express from "express";
import { InterviewSession } from "../models/InterviewSession.js";
import { verifyToken, isAdmin } from "../../middleware/authMiddleware.js";
import { User } from "../../models/User.js"; // ✅ ADD THIS
import { sendInterviewCompletedNotification, sendCreditsExhaustedNotification } from "../../Utils/notificationHelper.js";

const router = express.Router();

// ✅ START INTERVIEW SESSION (FIXED)
router.post("/start", verifyToken, async (req, res) => {
  try {
    const { companyType, role } = req.body;
    const userId = req.userId;

    console.log("🎯 Starting interview for user:", userId);

    if (!companyType || !role) {
      return res.status(400).json({ message: "companyType and role are required" });
    }

    // ✅ CHECK AND CONSUME CREDIT DIRECTLY (no axios needed)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("📊 User subscription:", user.subscription);
    console.log("🔍 Plan ID from subscription:", user.subscription?.planId);

    // Check if subscription exists
    if (!user.subscription || !user.subscription.active) {
      return res.status(403).json({
        message: "No active subscription. Please purchase a plan.",
        requiresPayment: true
      });
    }

    // Check if subscription expired
    if (user.subscription.endDate && new Date() > new Date(user.subscription.endDate)) {
      await User.findByIdAndUpdate(userId, { "subscription.active": false });
      return res.status(403).json({
        message: "Your subscription has expired.",
        requiresPayment: true
      });
    }

    // Check if user has remaining interviews
    if (user.subscription.interviewsRemaining <= 0) {
      return res.status(403).json({
        message: "No interview credits remaining.",
        needsUpgrade: true
      });
    }

    // ✅ CHECK IF THIS IS THE LAST CREDIT
    const isLastCredit = user.subscription.interviewsRemaining === 1;

    // ✅ CONSUME 1 CREDIT
    await User.findByIdAndUpdate(userId, {
      $inc: {
        "subscription.interviewsUsed": 1,
        "subscription.interviewsRemaining": -1,
      },
    });

    console.log("✅ Credit consumed. Remaining:", user.subscription.interviewsRemaining - 1);

    // ✅ SEND NOTIFICATION IF ALL CREDITS ARE USED
    if (isLastCredit) {
      setTimeout(async () => {
        await sendCreditsExhaustedNotification(userId, user.name);
      }, 3000); // Send after 3 seconds
    }

    // ✅ CREATE SESSION
    const session = await InterviewSession.create({
      userId: userId,
      companyType,
      role,
      status: "in-progress",
      startedAt: new Date(),
      messages: [],
      solvedProblems: [],
      planId: user.subscription?.planId || 'free'  // ✅ STORE PLAN ID
    });

    res.status(201).json({
      success: true,
      sessionId: session._id,
      creditsRemaining: user.subscription.interviewsRemaining - 1
    });

  } catch (err) {
    console.error("❌ Start interview error:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({
      message: "Failed to start interview session",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// ✅ COMPLETE INTERVIEW SESSION
router.patch("/complete/:sessionId", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reportUrl, messages, solvedProblems, highlightClips } = req.body;

    if (!reportUrl) {
      return res.status(400).json({ message: "Report URL is required" });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    session.reportUrl = reportUrl;
    session.messages = messages || [];
    session.solvedProblems = solvedProblems || [];
    session.highlightClips = highlightClips || [];
    session.status = "completed";
    session.completedAt = new Date();

    await session.save();

    // 🔔 Send interview completion notification
    const score = session.score || 0;
    const role = session.role || "Unknown Role";
    await sendInterviewCompletedNotification(req.userId, role, score);

    res.json({
      success: true,
      message: "Interview completed successfully",
    });
  } catch (err) {
    console.error("Complete interview error:", err);
    res.status(500).json({ message: "Failed to complete interview session" });
  }
});

// GET all interviews for logged-in user
router.get("/my", verifyToken, async (req, res) => {
  try {
    const interviews = await InterviewSession.find({
      userId: req.userId,
    })
      .sort({ startedAt: -1 })
      .select(
        "role companyType startedAt completedAt reportUrl messages solvedProblems highlightClips status planId"
      );

    res.json({
      success: true,
      interviews,
    });
  } catch (err) {
    console.error("Fetch interviews error:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
});

router.get("/:sessionId", verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    res.json({
      success: true,
      session,
    });
  } catch (err) {
    console.error("Fetch session error:", err);
    res.status(500).json({ message: "Failed to fetch interview session" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    await session.deleteOne();

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete interview failed:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ ADMIN: get all interview sessions for a user
router.get("/admin/user/:userId", verifyToken, isAdmin, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      userId: req.params.userId
    })
      .sort({ startedAt: -1 })
      .select(
        "companyType role status startedAt completedAt reportUrl messages solvedProblems highlightClips planId"
      )
      .lean();

    res.json({
      success: true,
      interviews: sessions
    });
  } catch (err) {
    console.error("Admin interview fetch error:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
});

// ✅ ADMIN: GLOBAL INTERVIEW STATS
router.get("/admin/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({}).select(
      "status companyType messages solvedProblems highlightClips"
    );

    const stats = {
      total: sessions.length,
      completed: 0,
      inProgress: 0,
      startup: 0,
      service: 0,
      product: 0,
      totalMessages: 0,
      totalProblems: 0,
      totalClips: 0,
    };

    sessions.forEach(s => {
      if (s.status === "completed") stats.completed++;
      else stats.inProgress++;

      const type = s.companyType?.toLowerCase();
      if (type === "startup") stats.startup++;
      if (type === "service") stats.service++;
      if (type === "product") stats.product++;

      stats.totalMessages += s.messages?.length || 0;
      stats.totalProblems += s.solvedProblems?.length || 0;
      stats.totalClips += s.highlightClips?.length || 0;
    });

    res.json({ success: true, stats });
  } catch (err) {
    console.error("Interview stats error:", err);
    res.status(500).json({ message: "Failed to fetch interview stats" });
  }
});

router.post("/claim-free-session", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    console.log("🎁 Free session claim request from user:", userId);

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // ✅ Check if user has already claimed free session
    if (user.hasClaimedFreeSession) {
      return res.status(400).json({
        success: false,
        message: "You've already claimed your free session. Check out our premium plans for more interviews!"
      });
    }

    console.log("📊 Current subscription:", user.subscription);

    // ✅ Initialize or update subscription with 1 free credit
    if (!user.subscription) {
      // Create new subscription with 1 free credit
      user.subscription = {
        planId: 'free',
        planName: 'Free Trial',
        interviewsRemaining: 1,
        interviewsTotal: 1,
        interviewsUsed: 0,
        active: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days validity
      };
    } else {
      // Add 1 credit to existing subscription
      user.subscription.interviewsRemaining = (user.subscription.interviewsRemaining || 0) + 1;
      user.subscription.interviewsTotal = (user.subscription.interviewsTotal || 0) + 1;
      user.subscription.active = true;

      // Extend end date if expired
      if (!user.subscription.endDate || new Date(user.subscription.endDate) < new Date()) {
        user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    }

    // ✅ Mark that user has claimed free session
    user.hasClaimedFreeSession = true;

    // Save user
    await user.save();

    console.log("✅ Free session claimed successfully. New credits:", user.subscription.interviewsRemaining);

    return res.status(200).json({
      success: true,
      message: "Free session claimed successfully!",
      subscription: {
        interviewsRemaining: user.subscription.interviewsRemaining,
        interviewsTotal: user.subscription.interviewsTotal,
        planName: user.subscription.planName || 'Free Trial'
      }
    });

  } catch (error) {
    console.error("❌ Claim free session error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while claiming your free session. Please try again later.",
      error: error.message
    });
  }
});

export default router;