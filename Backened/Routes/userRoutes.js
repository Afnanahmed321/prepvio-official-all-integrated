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
   START LEARNING (SAFE, NON-BROKEN CREATION)
========================================================= */
router.post("/start-learning", verifyToken, async (req, res) => {
  // console.log("START LEARNING HIT", req.userId, req.body);

  const {
    courseId,
    courseTitle,
    courseThumbnail,
    channelId,
    channelName,
    channelThumbnail,
  } = req.body;

  if (!courseId || !courseTitle || !channelId || !channelName) {
    return res.status(400).json({ message: "Missing data" });
  }

  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const exists = user.courseProgress.find(
    (c) => c.courseId === courseId && c.channelId === channelId
  );

  if (!exists) {
    user.courseProgress.push({
      courseId,
      courseTitle,
      courseThumbnail,
      channelId,
      channelName,
      channelThumbnail,
      totalSeconds: 0,
      watchedSeconds: 0,
      videos: [],
    });

    await user.save();
  }

  return res.json({ success: true });
});



/* =========================================================
   VIDEO PROGRESS (GUARANTEED WRITE)
========================================================= */
/* =========================================================
   VIDEO PROGRESS (FINAL — CLEAN & CORRECT)
========================================================= */
router.post("/video-progress", verifyToken, async (req, res) => {
  const {
    videoId,
    courseId,
    channelId,
    watchedSeconds,
    durationSeconds,
  } = req.body;

  if (
    !videoId ||
    !courseId ||
    !channelId ||
    typeof watchedSeconds !== "number" ||
    typeof durationSeconds !== "number"
  ) {
    return res.status(400).json({ message: "Missing or invalid data" });
  }

  const user = await User.findById(req.userId);

  /* 1️⃣ FIND COURSE */
  const course = user.courseProgress.find(
    (c) => c.courseId === courseId && c.channelId === channelId
  );

  if (!course) {
    return res
      .status(404)
      .json({ message: "Course not started yet" });
  }

  /* 2️⃣ FIND OR CREATE VIDEO */
  let video = course.videos.find((v) => v.videoId === videoId);

  const safeWatched = Math.min(
    Math.max(watchedSeconds, 0),
    durationSeconds
  );

  if (!video) {
    course.videos.push({
      videoId,
      watchedSeconds: safeWatched,
      durationSeconds,
      completed: safeWatched >= durationSeconds * 0.9,
      updatedAt: new Date(),
    });
  } else {
    video.watchedSeconds = Math.max(
      video.watchedSeconds,
      safeWatched
    );
    video.durationSeconds = durationSeconds;
    video.completed =
      video.watchedSeconds >= video.durationSeconds * 0.9;
    video.updatedAt = new Date();
  }

  /* 3️⃣ CORRECT AGGREGATION (NO DOUBLE COUNTING) */
  course.watchedSeconds = course.videos.reduce(
    (sum, v) =>
      sum + Math.min(v.watchedSeconds, v.durationSeconds),
    0
  );

  course.lastAccessed = new Date();

  await user.save();

  res.json({ success: true });
});


/* =========================================================
   FETCH VIDEO PROGRESS (FOR RESUME AFTER REFRESH)
========================================================= */
router.get(
  "/video-progress/:courseId/:channelId",
  verifyToken,
  async (req, res) => {
    const { courseId, channelId } = req.params;

    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const course = user.courseProgress.find(
      (c) => c.courseId === courseId && c.channelId === channelId
    );

    if (!course) {
      return res.json({ success: true, data: [] });
    }

    res.json({
      success: true,
      data: course.videos || [],
    });
  }
);

/* =========================================================
   MY LEARNING
========================================================= */
router.get("/my-learning", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const data = user.courseProgress.map((course) => {
    let lastVideoId = null;

    if (course.videos && course.videos.length > 0) {
      const lastVideo = course.videos.reduce((latest, v) =>
        !latest || new Date(v.updatedAt) > new Date(latest.updatedAt)
          ? v
          : latest
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

      // 🔥 THIS IS THE KEY
      lastVideoId,
    };
  });

  res.json({ success: true, data });
});





/* =========================================================
   RESET COURSE (CLEAN DELETE)
========================================================= */
router.delete(
  "/course-progress/:courseId/:channelId",
  verifyToken,
  async (req, res) => {
    const { courseId, channelId } = req.params;

    const user = await User.findById(req.userId);

    user.courseProgress = user.courseProgress.filter(
      (c) => !(c.courseId === courseId && c.channelId === channelId)
    );

    await user.save();
    res.json({ success: true });
  }
);

router.post("/watch-later", verifyToken, async (req, res) => {
  const { videoId, title, thumbnail, channelId, channelName, courseId } =
    req.body;

  if (!videoId) {
    return res.status(400).json({ message: "Video ID required" });
  }

  const user = await User.findById(req.userId);

  const exists = user.savedVideos.find(
    (v) => v.videoId === videoId
  );

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
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    success: true,
    data: user.savedVideos || [],
  });
});

/* =========================================================
   UPDATE COURSE TOTAL DURATION (PLAYLIST TOTAL)
========================================================= */
router.post("/update-course-total", verifyToken, async (req, res) => {
  const { courseId, channelId, totalSeconds } = req.body;

  if (
    !courseId ||
    !channelId ||
    typeof totalSeconds !== "number" ||
    totalSeconds <= 0
  ) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const user = await User.findById(req.userId);

  const course = user.courseProgress.find(
    (c) => c.courseId === courseId && c.channelId === channelId
  );

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  /*
    IMPORTANT RULE:
    - totalSeconds represents FULL PLAYLIST duration
    - It should only ever increase or be set once
    - Never decrease (prevents corruption)
  */
  if (course.totalSeconds !== totalSeconds) {
    course.totalSeconds = totalSeconds;
    await user.save();
  }

  res.json({ success: true });
});

router.get("/dashboard", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  const courses = user.courseProgress || [];

  const totalCourses = courses.length;

  const completedCourses = courses.filter(
    c => c.watchedSeconds >= c.totalSeconds && c.totalSeconds > 0
  ).length;

  const inProgressCourses = totalCourses - completedCourses;

  const totalWatchedSeconds = courses.reduce(
    (sum, c) => sum + (c.watchedSeconds || 0),
    0
  );

  // Resume target (latest accessed course + video)
  let resume = null;
  let latestAccess = null;

  courses.forEach(course => {
    course.videos?.forEach(video => {
      if (!latestAccess || new Date(video.updatedAt) > latestAccess) {
        latestAccess = new Date(video.updatedAt);
        resume = {
          courseId: course.courseId,
          channelId: course.channelId,
          videoId: video.videoId,
        };
      }
    });
  });

  res.json({
    success: true,
    stats: {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalWatchedHours: Math.round(totalWatchedSeconds / 3600),
    },
    resume,
    courses: courses.map(c => ({
      courseId: c.courseId,
      courseTitle: c.courseTitle,
      channelName: c.channelName,
      channelThumbnail: c.channelThumbnail,
      watchedSeconds: c.watchedSeconds,
      totalSeconds: c.totalSeconds,
      lastAccessed: c.lastAccessed,
      completed: c.watchedSeconds >= c.totalSeconds && c.totalSeconds > 0,
    })),
  });
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
