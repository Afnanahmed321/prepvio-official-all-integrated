import express from "express";
import { User } from "../models/User.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { sendCourseStartedNotification, sendCourseCompletedNotification } from "../Utils/notificationHelper.js";
import { deduplicateCourseProgress } from "../Utils/courseHelper.js";

const router = express.Router();

/* =========================================================
   GET COMPLETED COURSES
========================================================= */
router.get("/completed-courses", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const completedCourses = (user.courseProgress || [])
      .filter((c) => c.totalSeconds > 0 && c.watchedSeconds >= c.totalSeconds * 0.9)
      .map((c) => ({
        _id: c.courseId,
        courseId: c.courseId,
        name: c.courseTitle,
        thumbnail: c.courseThumbnail,
        completedAt: c.lastAccessed
      }));

    res.json({
      success: true,
      completedCourses
    });
  } catch (err) {
    console.error("Error fetching completed courses:", err);
    res.status(500).json({ message: "Failed to fetch completed courses" });
  }
});

/* =========================================================
   MANUALLY COMPLETE COURSE (For Certification/Project Map)
========================================================= */
router.post("/complete-course/:courseId", verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.courseProgress) {
      user.courseProgress = [];
    }

    let courseProgress = user.courseProgress.find(c => c.courseId === courseId);

    if (courseProgress) {
      courseProgress.watchedSeconds = courseProgress.totalSeconds || 3600;
      courseProgress.totalSeconds = courseProgress.watchedSeconds;
      courseProgress.lastAccessed = new Date();
    } else {
      user.courseProgress.push({
        courseId,
        courseTitle: "Manually Completed Course",
        channelId: "manual_completion",
        channelName: "Manual Completion",
        totalSeconds: 3600,
        watchedSeconds: 3600,
        lastAccessed: new Date(),
        videos: []
      });
    }

    await user.save();

    try {
      await sendCourseCompletedNotification(user._id, courseId, courseProgress?.courseTitle || "Course");
    } catch (error) {
      console.error("Notification failed", error);
    }

    res.json({ success: true, message: "Course marked as completed" });

  } catch (err) {
    console.error("Error completing course:", err);
    res.status(500).json({ message: "Failed to complete course" });
  }
});


/* =========================================================
   PORTFOLIO & PROJECTS
========================================================= */
router.get("/portfolio", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const interviews = user.interviewAttempts || [];
    const aptitude = user.aptitudeAttempts || [];
    const projects = user.projects || [];

    const codingInterviews = interviews.filter(i =>
      i.role?.toLowerCase().includes('coding') ||
      i.role?.toLowerCase().includes('programming') ||
      i.role?.toLowerCase().includes('algorithm') ||
      i.role?.toLowerCase().includes('dsa') ||
      i.role?.toLowerCase().includes('technical')
    );
    const logicAccuracy = codingInterviews.length > 0
      ? Math.round(codingInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / codingInterviews.length)
      : 0;

    const communicationInterviews = interviews.filter(i =>
      i.role?.toLowerCase().includes('hr') ||
      i.role?.toLowerCase().includes('behavioral') ||
      i.role?.toLowerCase().includes('communication') ||
      (i.feedback && i.feedback.length > 20)
    );
    const commSkills = communicationInterviews.length > 0
      ? Math.round(communicationInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / communicationInterviews.length)
      : (interviews.length > 0 ? Math.round(interviews.reduce((sum, i) => sum + (i.score || 0), 0) / interviews.length) : 0);

    const systemDesignInterviews = interviews.filter(i =>
      !i.role?.toLowerCase().includes('hr') &&
      !i.role?.toLowerCase().includes('behavioral')
    );
    const systemDesign = systemDesignInterviews.length > 0
      ? Math.round(systemDesignInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / systemDesignInterviews.length)
      : 0;

    const cultureFitInterviews = interviews.filter(i =>
      i.role?.toLowerCase().includes('hr') ||
      i.role?.toLowerCase().includes('cultural') ||
      i.role?.toLowerCase().includes('behavioral') ||
      (i.feedback && (
        i.feedback.toLowerCase().includes('good') ||
        i.feedback.toLowerCase().includes('great') ||
        i.feedback.toLowerCase().includes('excellent') ||
        i.feedback.toLowerCase().includes('strong')
      ))
    );
    const cultureFit = cultureFitInterviews.length > 0
      ? Math.round(cultureFitInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / cultureFitInterviews.length)
      : (interviews.length > 0 ? Math.round(interviews.reduce((sum, i) => sum + (i.score || 0), 0) / interviews.length) : 0);

    res.status(200).json({
      success: true,
      user: {
        name: user.name || "User",
        bio: user.bio || "Passionate developer building amazing things.",
        avatarUrl: user.avatarUrl || "/swaroopProfile.jpg",
        profilePic: user.profilePic || null,
        location: user.location || {},
      },
      skills: user.courseProgress || [],
      interviews: interviews,
      aptitude: aptitude,
      projects: projects,
      metrics: {
        logicAccuracy,
        commSkills,
        systemDesign,
        cultureFit
      }
    });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   PROJECT MANAGEMENT ENDPOINTS
========================================================= */

// CREATE PROJECT
router.post("/projects", verifyToken, async (req, res) => {
  try {
    const { title, description, tags, imageUrl, liveLink, githubLink, featured } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newProject = {
      title: title.trim(),
      description: description.trim(),
      tags: Array.isArray(tags) ? tags.filter(t => t.trim()) : [],
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      liveLink: liveLink?.trim() || "",
      githubLink: githubLink?.trim() || "",
      featured: Boolean(featured),
    };

    user.projects.push(newProject);
    await user.save();

    const createdProject = user.projects[user.projects.length - 1];

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: createdProject,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET ALL PROJECTS (for current user)
router.get("/projects", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("projects").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      projects: user.projects || [],
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET SINGLE PROJECT
router.get("/projects/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findById(req.userId).select("projects").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const project = user.projects.find(p => p._id.toString() === projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE PROJECT
router.put("/projects/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, tags, imageUrl, liveLink, githubLink, featured } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (title !== undefined) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (tags !== undefined) project.tags = Array.isArray(tags) ? tags.filter(t => t.trim()) : [];
    if (imageUrl !== undefined) project.imageUrl = imageUrl;
    if (liveLink !== undefined) project.liveLink = liveLink?.trim() || "";
    if (githubLink !== undefined) project.githubLink = githubLink?.trim() || "";
    if (featured !== undefined) project.featured = Boolean(featured);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE PROJECT
router.delete("/projects/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const projectIndex = user.projects.findIndex(p => p._id.toString() === projectId);
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    user.projects.splice(projectIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================================
   PROFILE
========================================================= */

// FETCH PROFILE
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PROFILE
router.put("/me", verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, location } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (location) user.location = location;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================
   UPLOAD PROFILE PICTURE
========================================================= */
router.post("/upload-profile-pic", verifyToken, async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.profilePic = profilePic;
    await user.save();

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      profilePic: user.profilePic
    });
  } catch (err) {
    console.error("Profile pic upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================
   START LEARNING
========================================================= */
router.post("/start-learning", verifyToken, async (req, res) => {
  const {
    courseId,
    courseTitle,
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

  if (!user.courseProgress) {
    user.courseProgress = [];
  }

  const courseIdStr = String(courseId);
  const channelIdStr = String(channelId);

  const existingEntries = user.courseProgress.filter(
    (c) => String(c.courseId) === courseIdStr && String(c.channelId) === channelIdStr
  );

  if (existingEntries.length > 0) {
    const entryWithMostProgress = existingEntries.reduce((max, current) =>
      (current.watchedSeconds || 0) > (max.watchedSeconds || 0) ? current : max
    );

    user.courseProgress = user.courseProgress.filter(
      (c) => !(String(c.courseId) === courseIdStr && String(c.channelId) === channelIdStr)
    );

    user.courseProgress.push(entryWithMostProgress);
    await user.save();
  } else {
    user.courseProgress.push({
      courseId,
      courseTitle,
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
    await sendCourseStartedNotification(req.userId, courseTitle, channelName);
  }

  return res.json({ success: true });
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
    video.completed = video.watchedSeconds >= video.durationSeconds * 0.9;
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

  const isCourseCompleted = course.totalSeconds > 0 &&
    course.watchedSeconds >= course.totalSeconds * 0.9;

  const wasCourseAlreadyCompleted = course.completed;
  course.completed = isCourseCompleted;

  course.lastAccessed = new Date();

  await user.save();

  if (isCourseCompleted && !wasCourseAlreadyCompleted) {
    await sendCourseCompletedNotification(req.userId, course.courseTitle, course.channelName);
  }

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

  let courses = user.courseProgress || [];
  const feedbacks = user.feedbacks || [];

  courses = deduplicateCourseProgress(courses);

  const data = courses.map((course) => {
    let lastVideoId = null;

    if (course.videos?.length) {
      const lastVideo = course.videos.reduce((a, b) =>
        new Date(b.updatedAt) > new Date(a.updatedAt) ? b : a
      );
      lastVideoId = lastVideo.videoId;
    }

    const hasFeedback = feedbacks.some(
      (fb) =>
        fb.courseId === course.courseId &&
        fb.channelId === course.channelId
    );

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
      hasFeedback,
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

router.delete("/watch-later/:videoId", verifyToken, async (req, res) => {
  const { videoId } = req.params;

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.savedVideos = (user.savedVideos || []).filter(
    (v) => v.videoId !== videoId
  );

  await user.save();
  res.json({ success: true });
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

    const originalCount = (user.courseProgress || []).length;
    const deduplicatedProgress = deduplicateCourseProgress(user.courseProgress || []);

    if (deduplicatedProgress.length < originalCount) {
      await User.findByIdAndUpdate(req.userId, { courseProgress: deduplicatedProgress });
    }

    const courses = deduplicatedProgress.map((c) => {
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

    const resumeCourse = courses
      .filter(c => !c.completed && c.watchedSeconds > 0)
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))[0];

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

    deduplicatedProgress.forEach(course => {
      if (course.lastAccessed && course.watchedSeconds > 0) {
        const bucket = getWeekBucket(course.lastAccessed);
        weeklyActivity[bucket] += course.watchedSeconds;
      }
    });

    Object.keys(weeklyActivity).forEach(key => {
      weeklyActivity[key] =
        Math.round((weeklyActivity[key] / 3600) * 10) / 10;
    });

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
router.get("/admin/all-users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select("firstName lastName name email isVerified createdAt");

    res.json({
      success: true,
      data: users.map(u => ({
        id: u._id,
        name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "No Name",
        email: u.email,
        featureAccess: "All Features",
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
router.get("/admin/user/:userId", verifyToken, isAdmin, async (req, res) => {
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
        name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "No Name",
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

/* =========================================================
   SUBMIT FEEDBACK
========================================================= */
router.post("/feedback", verifyToken, async (req, res) => {
  try {
    const { courseId, channelId, category, rating, message } = req.body;

    if (!message || !category) {
      return res.status(400).json({ message: "Missing feedback data" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isCourseFeedback = Boolean(courseId && channelId);

    user.feedbacks.push({
      userId: req.userId,
      courseId: isCourseFeedback ? courseId : null,
      channelId: isCourseFeedback ? channelId : null,
      type: isCourseFeedback ? "course" : "general",
      category,
      rating,
      message,
    });

    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Feedback save error:", err);
    res.status(500).json({ message: "Failed to save feedback" });
  }
});

/* =========================================================
   SUBMIT APTITUDE TEST
========================================================= */
router.post("/aptitude/submit", verifyToken, async (req, res) => {
  const {
    topic,
    totalQuestions,
    correctAnswers,
    percentage,
    timeTakenSeconds,
    answers,
  } = req.body;

  if (
    typeof topic !== "string" ||
    typeof totalQuestions !== "number" ||
    !Array.isArray(answers) ||
    answers.length === 0
  ) {
    return res.status(400).json({ message: "Invalid aptitude data" });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  user.aptitudeAttempts.push({
    topic,
    totalQuestions,
    correctAnswers,
    percentage,
    timeTakenSeconds,
    answers: answers.map((a) => ({
      questionId: String(a.questionId),
      question: String(a.question || ""),
      options: Array.isArray(a.options)
        ? a.options.map((o) => ({
          text: typeof o === "string" ? o : o.text,
        }))
        : [],
      explanation: a.explanation || "",
      difficulty: a.difficulty || "medium",
      selectedIndex: Number(a.selectedIndex),
      correctIndex: Number(a.correctIndex),
      isCorrect: Boolean(a.isCorrect),
    })),
  });

  try {
    await user.save();
  } catch (err) {
    console.error("❌ Aptitude save failed:", err);
    return res.status(500).json({ message: "DB save failed" });
  }

  return res.json({ success: true });
});

/* =========================================================
   GET USER APTITUDE ATTEMPTS
========================================================= */
router.get("/aptitude/attempts", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("aptitudeAttempts")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user.aptitudeAttempts || [],
    });
  } catch (err) {
    console.error("Fetch aptitude attempts error:", err);
    res.status(500).json({ message: "Failed to fetch aptitude attempts" });
  }
});

/* =========================================================
   GET LATEST APTITUDE ATTEMPT
========================================================= */
router.get("/aptitude/latest", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("aptitudeAttempts")
      .lean();

    if (!user || !user.aptitudeAttempts?.length) {
      return res.json({ success: true, data: null });
    }

    const latestAttempt =
      user.aptitudeAttempts[user.aptitudeAttempts.length - 1];

    res.json({
      success: true,
      data: latestAttempt,
    });
  } catch (err) {
    console.error("Fetch latest aptitude error:", err);
    res.status(500).json({ message: "Failed to fetch latest aptitude attempt" });
  }
});

/* =========================================================
   ADMIN: DELETE USER
========================================================= */
router.delete("/admin/delete/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

export default router;
