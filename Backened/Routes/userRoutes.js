import express from "express";
import { User } from "../models/User.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

/* =========================================================
   PROFILE
========================================================= */
router.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ success: true, user });
});

/* =========================================================
   START LEARNING
========================================================= */


router.post("/start-learning", verifyToken, async (req, res) => {
  const {
    courseId,
    courseTitle,          // ✅ REQUIRED
    channelId,
    channelName,
    channelThumbnail,
  } = req.body;

  // 🔴 NO DEFAULTS, NO "Course"
  if (!courseId || !courseTitle || !channelId || !channelName) {
    return res.status(400).json({ message: "Missing data" });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: "User not found" });

  if (!user.courseProgress) {
    user.courseProgress = [];
  }

  const exists = user.courseProgress.find(
    (c) => c.courseId === courseId && c.channelId === channelId
  );

  if (!exists) {
    user.courseProgress.push({
      courseId,
      courseTitle: courseTitle.trim(), // ✅ EXACT NAME FROM FRONTEND
      channelId,
      channelName,
      channelThumbnail,
      totalSeconds: 0,
      watchedSeconds: 0,
      videos: [],
      startedAt: new Date(),
      lastAccessed: new Date(),
    });

    await user.save();
  }

  res.json({ success: true });
});



/* =========================================================
   VIDEO PROGRESS (SAVE)
========================================================= */
router.post("/video-progress", verifyToken, async (req, res) => {
  const { videoId, courseId, channelId, watchedSeconds, durationSeconds } =
    req.body;

  if (
    !videoId ||
    !courseId ||
    !channelId ||
    typeof watchedSeconds !== "number" ||
    typeof durationSeconds !== "number"
  ) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // ✅ GUARD
  if (!user.courseProgress) {
    user.courseProgress = [];
  }

  const course = user.courseProgress.find(
    (c) => c.courseId === courseId && c.channelId === channelId
  );

  if (!course) {
    return res.status(404).json({ message: "Course not started yet" });
  }

  let video = course.videos.find((v) => v.videoId === videoId);

  const safeWatched =
  durationSeconds > 0
    ? Math.min(Math.max(watchedSeconds, 0), durationSeconds)
    : Math.max(watchedSeconds, 0);


  if (!video) {
    course.videos.push({
      videoId,
      watchedSeconds: safeWatched,
      durationSeconds,
      completed: safeWatched >= durationSeconds * 0.9,
      updatedAt: new Date(),
    });
  } else {
    video.watchedSeconds = Math.max(video.watchedSeconds, safeWatched);
    video.durationSeconds = durationSeconds;
    video.completed =
      video.watchedSeconds >= video.durationSeconds * 0.9;
    video.updatedAt = new Date();
  }

  course.watchedSeconds = course.videos.reduce(
  (sum, v) =>
    sum +
    (v.durationSeconds > 0
      ? Math.min(v.watchedSeconds, v.durationSeconds)
      : v.watchedSeconds),
  0
);


  course.lastAccessed = new Date();

  await user.save();
  res.json({ success: true });
});

/* =========================================================
   FETCH VIDEO PROGRESS
========================================================= */
router.get(
  "/video-progress/:courseId/:channelId",
  verifyToken,
  async (req, res) => {
    const { courseId, channelId } = req.params;

    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const courses = user.courseProgress || [];

    const course = courses.find(
      (c) => c.courseId === courseId && c.channelId === channelId
    );

    res.json({
      success: true,
      data: course?.videos || [],
    });
  }
);

/* =========================================================
   MY LEARNING
========================================================= */
router.get("/my-learning", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const courses = user.courseProgress || [];

  const data = courses.map((course) => {
    let lastVideoId = null;

    if (course.videos?.length) {
      const lastVideo = course.videos.reduce((a, b) =>
        new Date(b.updatedAt) > new Date(a.updatedAt) ? b : a
      );
      lastVideoId = lastVideo.videoId;
    }

    return {
      courseId: course.courseId,
      courseTitle: course.courseTitle,
      channelId: course.channelId,
      channelName: course.channelName,
      channelThumbnail: course.channelThumbnail,
      watchedSeconds: course.watchedSeconds,
      totalSeconds: course.totalSeconds,
      lastAccessed: course.lastAccessed,
      lastVideoId,
    };
  });

  res.json({ success: true, data });
});

/* =========================================================
   RESET COURSE
========================================================= */
router.delete(
  "/course-progress/:courseId/:channelId",
  verifyToken,
  async (req, res) => {
    const { courseId, channelId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.courseProgress = (user.courseProgress || []).filter(
      (c) => !(c.courseId === courseId && c.channelId === channelId)
    );

    await user.save();
    res.json({ success: true });
  }
);

/* =========================================================
   WATCH LATER
========================================================= */
router.post("/watch-later", verifyToken, async (req, res) => {
  const { videoId, title, thumbnail, channelId, channelName, courseId } =
    req.body;

  if (!videoId) {
    return res.status(400).json({ message: "Video ID required" });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const exists = user.savedVideos.find((v) => v.videoId === videoId);
  if (exists) {
    return res.status(400).json({ message: "Already saved" });
  }

  user.savedVideos.push({
    videoId,
    title,
    thumbnail,
    channelId,
    channelName,
    courseId,
  });

  await user.save();
  res.json({ success: true });
});

router.get("/watch-later", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ success: true, data: user.savedVideos || [] });
});

/* =========================================================
   UPDATE COURSE TOTAL
========================================================= */
router.post("/update-course-total", verifyToken, async (req, res) => {
  const { courseId, channelId, totalSeconds } = req.body;

  if (!courseId || !channelId || typeof totalSeconds !== "number") {
    return res.status(400).json({ message: "Invalid data" });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.courseProgress) {
    user.courseProgress = [];
  }

  const course = user.courseProgress.find(
    (c) => c.courseId === courseId && c.channelId === channelId
  );

  if (!course) return res.status(404).json({ message: "Course not found" });

  if (course.totalSeconds !== totalSeconds) {
    course.totalSeconds = totalSeconds;
    await user.save();
  }

  res.json({ success: true });
});

/* =========================================================
   DASHBOARD
========================================================= */
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ======================================================
       COURSES + COMPLETION
    ====================================================== */
    const courses = (user.courseProgress || []).map((c) => {
      const completed =
        c.totalSeconds > 0 && c.watchedSeconds >= c.totalSeconds * 0.9;

      return {
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        channelId: c.channelId,
        channelName: c.channelName,
        channelThumbnail: c.channelThumbnail,
        totalSeconds: c.totalSeconds,
        watchedSeconds: c.watchedSeconds,
        completed,
        lastAccessed: c.lastAccessed,
      };
    });

    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.completed).length;
    const inProgressCourses = totalCourses - completedCourses;

    const totalWatchedSeconds = courses.reduce(
      (sum, c) => sum + (c.watchedSeconds || 0),
      0
    );

    /* ======================================================
       RESUME COURSE
    ====================================================== */
    const resumeCourse = courses
      .filter(c => !c.completed && c.watchedSeconds > 0)
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))[0];

    /* ======================================================
       WEEKLY LEARNING ACTIVITY (ROLLING 4 WEEKS)
    ====================================================== */

    const getWeekBucket = (date) => {
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 7) return "This Week";
      if (diffDays <= 14) return "Last Week";
      if (diffDays <= 21) return "2 Weeks Ago";
      return "3 Weeks Ago";
    };

    const weeklyActivity = {
      "3 Weeks Ago": 0,
      "2 Weeks Ago": 0,
      "Last Week": 0,
      "This Week": 0,
    };

    (user.courseProgress || []).forEach(course => {
      if (course.lastAccessed && course.watchedSeconds > 0) {
        const bucket = getWeekBucket(course.lastAccessed);
        weeklyActivity[bucket] += course.watchedSeconds;
      }
    });

    // convert seconds → hours (1 decimal)
    Object.keys(weeklyActivity).forEach(key => {
      weeklyActivity[key] =
        Math.round((weeklyActivity[key] / 3600) * 10) / 10;
    });

    /* ======================================================
       RESPONSE
    ====================================================== */
    res.json({
      stats: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalWatchedHours: Math.floor(totalWatchedSeconds / 3600),
      },
      courses,
      resume: resumeCourse
        ? {
            courseId: resumeCourse.courseId,
            channelId: resumeCourse.channelId,
            videoId: null,
          }
        : null,
      weeklyActivity,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});






/* =========================================================
   ADMIN: GET ALL USERS (FOR USER MANAGEMENT)
========================================================= */
router.get("/admin/all-users", async (req, res) => {
  try {
    const users = await User.find({})
      .select("firstName lastName email isVerified createdAt");

    res.json({
      success: true,
      data: users.map(u => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        featureAccess: "All Features", // placeholder (backend not ready)
        status: u.isVerified ? "Active" : "Suspended"
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* =========================================================
   ADMIN: FULL USER LEARNING DETAILS
========================================================= */
router.get("/admin/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const courses = (user.courseProgress || []).map(course => ({
      courseId: course.courseId,
      courseTitle: course.courseTitle,
      channelName: course.channelName,
      watchedSeconds: course.watchedSeconds,
      totalSeconds: course.totalSeconds,
      completed: course.totalSeconds > 0 &&
                 course.watchedSeconds >= course.totalSeconds,
      videos: (course.videos || []).map(video => ({
        videoId: video.videoId,
        watchedSeconds: video.watchedSeconds,
        durationSeconds: video.durationSeconds,
        completed: video.completed,
        updatedAt: video.updatedAt,
      })),
    }));

    res.json({
      success: true,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      courses,
      savedVideos: user.savedVideos || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
});




export default router;